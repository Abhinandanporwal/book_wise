import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"

export async function GET() {
  try {
    const books = await db.book.findMany()
    return NextResponse.json(books)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 })
  }
}
