"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookPlus, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// It's a good practice to keep constants in a separate file for larger applications.
const GENRE_OPTIONS = [
  "fiction",
  "non-fiction",
  "science-fiction",
  "fantasy",
  "mystery",
  "biography",
  "history",
  "self-help",
  "other",
];

interface BookFormData {
  title: string;
  author: string;
  genre: string;
  publishedYear: string;
  available: boolean;
  borrowDate: string;
  dueDate: string;
}

// This represents the structure of the feedback message state.
interface FeedbackMessage {
  type: "success" | "error";
  message: string;
}

export default function AddBookForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    genre: "",
    publishedYear: "",
    available: true,
    borrowDate: "",
    dueDate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      genre: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      genre: "",
      publishedYear: "",
      available: true,
      borrowDate: "",
      dueDate: "",
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null); // Clear previous feedback

    try {
      // Prepare payload, ensuring correct data types for the API.
      const payload = {
        ...formData,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear, 10) : undefined,
        borrowDate: formData.borrowDate ? new Date(formData.borrowDate) : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      };

      // Send the form data to the server
      const response = await fetch("/api/addbook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        // For a better UX, consider using a toast notification library (e.g., Sonner, React-Toastify)
        setFeedback({ type: "success", message: "Book added successfully!" });
        resetForm();
        // Redirect after a short delay to allow the user to see the success message.
        setTimeout(() => router.push("/"), 2000);
      } else {
        setFeedback({ type: "error", message: result.error || "Failed to add book. Please try again." });
      }
    } catch (_error) {
      // This catches network errors or issues with the fetch request itself.
      setFeedback({ type: "error", message: "An unexpected error occurred. Please check your connection." });
    } finally {
      setLoading(false);
    }
  };

  // A simple, complete SVG for the background pattern.
  const backgroundSvg = `data:image/svg+xml;base64,${btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="rgb(156 163 175 / 0.1)"><path d="M0 .5H31.5V32"/></svg>`
  )}`;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `url("${backgroundSvg}")`, opacity: 0.4 }}
      ></div>

      <div className="z-10 w-full max-w-2xl">
        <div className="flex items-center justify-center mb-8 space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
            <BookPlus className="w-6 h-6 text-gray-100" />
          </div>
          <h1 className="text-3xl font-bold text-gray-100">Add New Book</h1>
        </div>

        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-xl">
          <CardHeader className="pb-4 border-b border-gray-700/50">
            <CardTitle className="text-gray-100">Book Details</CardTitle>
            <CardDescription className="text-gray-400">
              Enter information for the new book.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6 space-y-4">
              {/* Feedback Message Display */}
              {feedback && (
                <div
                  className={`p-3 rounded-md text-sm ${
                    feedback.type === 'success'
                      ? 'bg-green-900/50 text-green-300 border border-green-700'
                      : 'bg-red-900/50 text-red-300 border border-red-700'
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author" className="text-gray-300">Author</Label>
                  <Input
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    required
                    className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <div className="space-y-2">
                  <Label htmlFor="genre" className="text-gray-300">Genre</Label>
                  <Select value={formData.genre} onValueChange={handleSelectChange}>
                    <SelectTrigger id="genre" className="bg-gray-700/50 border-gray-600 text-gray-100">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {GENRE_OPTIONS.map((g) => (
                        <SelectItem key={g} value={g} className="capitalize text-gray-200">{g.replace("-", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="publishedYear" className="text-gray-300">Published Year</Label>
                  <Input
                    id="publishedYear"
                    name="publishedYear"
                    type="number"
                    value={formData.publishedYear}
                    onChange={handleChange}
                    className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="borrowDate" className="text-gray-300">Borrow Date</Label>
                  <Input
                    id="borrowDate"
                    name="borrowDate"
                    type="date"
                    value={formData.borrowDate}
                    onChange={handleChange}
                    className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-gray-300">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder:text-gray-500"
                  />
                </div>
              </div>
               <div className="flex items-center pt-2 space-x-2">
                  <input
                    type="checkbox"
                    id="available"
                    name="available"
                    checked={formData.available}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <Label htmlFor="available" className="text-gray-200">Mark as Available</Label>
                </div>
            </CardContent>

            <CardFooter className="flex justify-between pt-4 border-t border-gray-700/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white shadow-lg shadow-blue-900/20 hover:bg-blue-700"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 mr-2 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                    Adding...
                  </div>
                ) : "Add Book"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 text-sm text-center text-gray-500">
          © {new Date().getFullYear()} Bookwise Library System
        </div>
      </div>
    </div>
  );
}
