"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/prisma"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function executeQuery1(formData: FormData) {
  const userPrompt = formData.get("prompt") as string

  console.log("🧾 Received Prompt:", userPrompt)

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress
  const info = await db.user.findUnique({
    where: { email },
  })
  console.log(info)

  // Check if the prompt is about creating/adding data
  const isCreationPrompt = /add|create|insert|new|register/i.test(userPrompt)

  let geminiPrompt = ""

  if (isCreationPrompt) {
    geminiPrompt = `
    You are a Prisma expert.

    Convert the following instruction into a Prisma Client JavaScript query to CREATE new records.  
    Only return the **code** for the query — no explanation, no markdown, no comments.

    ---

    ⚠️ Rules to follow:

    - Use \`create\` for single record creation.
    - Use \`createMany\` for multiple records.
    - Extract all relevant fields from the instruction.
    - For dates, use \`new Date()\` for current date or parse date strings appropriately.
    - Always return a complete Prisma query like \`prisma.book.create(...)\`.
    - For book creation, set \`available\` to true by default.
    - For fine creation, set \`paid\` to false by default.
    - When creating a fine, always associate it with the current user ID: "${info?.id}"

    ---

    Instruction: "${userPrompt}"

    ---

    Available Prisma models:

    model User {
      id            String   @id @default(uuid())
      email         String   @unique
      name          String?
      borrowedBooks Book[]  
      fines         Fine[]  
      createdAt     DateTime @default(now())
    }

    model Book {
      id            String   @id @default(uuid())
      title         String
      author        String
      genre         String?
      publishedYear Int?
      available     Boolean  @default(true)
      borrowerId    String?
      borrower      User?    @relation(fields: [borrowerId], references: [id])
      borrowDate    DateTime?
      dueDate       DateTime?
    }

    model Fine {
      id        String   @id @default(uuid())
      amount    Float
      reason    String?
      paid      Boolean  @default(false)
      userId    String
      user      User     @relation(fields: [userId], references: [id])
      createdAt DateTime @default(now())
    }

    ---

    If this instruction cannot be converted into a Prisma query, return only \`false\` and nothing else.
    `
  } else {
    geminiPrompt = `
    You are a Prisma expert.

    Convert the following instruction into a Prisma Client JavaScript query.  
    Only return the **code** for the query — no explanation, no markdown, no comments.

    ---

    ⚠️ Rules to follow:

    - Use \`findUnique\` only if the field being queried is unique (like \`id\` or \`email\`).
    - Use \`findFirst\` or \`findMany\` if the field is not unique (like \`title\`, \`author\`, \`genre\`, etc.).
    - Use \`count\` only when the instruction asks for the number of matching records.
    - Use \`aggregate({ _sum: { amount: true } })\` **when the instruction asks for the total amount of fines or money**, and make sure to filter the results using the current user's ID unless the total fine was asked, in which case, ensure to give only unpaid fines.
    - Always return a complete Prisma query like \`prisma.book.findMany(...)\`.

    ---

    Instruction: "${userPrompt}"

    If the instruction is related to **user fines**, **borrowed books**, or other user-specific information, use the following user ID in the query: "${info?.id}"

    ---

    Available Prisma models:

    model User {
      id            String   @id @default(uuid())
      email         String   @unique
      name          String?
      borrowedBooks Book[]  
      fines         Fine[]  
      createdAt     DateTime @default(now())
    }

    model Book {
      id            String   @id @default(uuid())
      title         String
      author        String
      genre         String?
      publishedYear Int?
      available     Boolean  @default(true)
      borrowerId    String?
      borrower      User?    @relation(fields: [borrowerId], references: [id])
      borrowDate    DateTime?
      dueDate       DateTime?
    }

    model Fine {
      id        String   @id @default(uuid())
      amount    Float
      reason    String?
      paid      Boolean  @default(false)
      userId    String
      user      User     @relation(fields: [userId], references: [id])
      createdAt DateTime @default(now())
    }

    ---

    If this instruction cannot be converted into a Prisma query, return only \`false\` and nothing else.
    `
  }

  const geminiResponse = await model.generateContent(geminiPrompt)

  const code = geminiResponse.response.text().trim()
  console.log("🧠 Gemini Output:\n", code)

  if (code === "false") {
    const notaquery = await model.generateContent(`
      You're a helpful assistant. The following user instruction could not be converted into a Prisma query. 
      Kindly return a short, polite Markdown message asking the user to rephrase or clarify their request.
      
      Instruction: "${userPrompt}"
      `)
    return {
      success: false,
      error: notaquery.response.text().trim(),
    }
  }

  try {
    let cleanCode = code
    if (code.includes("```")) {
      const match = code.match(/```(?:typescript|ts|js)?\s*([\s\S]*?)```/)
      if (match && match[1]) cleanCode = match[1].trim()
    }

    cleanCode = cleanCode.replace(/^(db|prisma)\./, "")
    console.log("🧾 Cleaned Query:", cleanCode)

    const queryFunction = new Function(
      "prisma",
      `return (async () => {
        try {
          return await prisma.${cleanCode};
        } catch (error) {
          console.error("❌ Error during Prisma execution:", error);
          throw error;
        }
      })();`,
    )

    const result = await queryFunction(db)
    console.log("📦 Final result returned to UI:\n", result)

    // For creation operations, provide a success message
    if (isCreationPrompt && result) {
      const successMessage = await model.generateContent(`
        You're a helpful assistant.
        
        The following data was successfully created in the database. 
        Write a clear and friendly Markdown message to inform the user that the operation was successful.
        Include the details of what was created in a readable format.
        
        Data: ${JSON.stringify(result, null, 2)}
        `)

      return {
        success: true,
        query: cleanCode,
        result: successMessage.response.text().trim(),
      }
    }

    if (!result || (Array.isArray(result) && result.length === 0)) {
      const noresult = await model.generateContent(`
        You're a helpful assistant.
        
        The following Prisma query was executed, but it returned no results from the database. 
        Write a clear and friendly Markdown message to inform the user that nothing was found.
        
        Include:
        - A sentence indicating that the requested record (like a Book or User) was not found.
        - A few helpful suggestions:
          - Try different casing (e.g., lowercase vs UPPERCASE)
          - Double-check spelling
          - Broaden the search if the query is too specific
        
        Query: \`${cleanCode}\`
        `)
      return {
        success: false,
        error: noresult.response.text().trim(),
      }
    }

    // Format Gemini response using raw object, NOT JSON.stringify
    const readableData = Array.isArray(result)
      ? result.map((item) => JSON.stringify(item, null, 2)).join("\n")
      : JSON.stringify(result, null, 2)

    const reformattedResponse = await model.generateContent(`
You're a helpful assistant. Convert the following data into a clear, user-friendly Markdown message. Use **bold**, bullet points, and \`code\` where appropriate:

${readableData}
    `)

    const finalAnswer = reformattedResponse.response.text().trim()

    return {
      success: true,
      query: cleanCode,
      result: finalAnswer,
    }
  } catch (err: any) {
    console.error("🔥 Runtime error:", err)
    return {
      success: false,
      error: `❌ Error executing the query: ${err.message}`,
      generated: code,
    }
  }
}
