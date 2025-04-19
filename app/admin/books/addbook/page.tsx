"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { BookPlus, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BookFormData {
  title: string;
  author: string;
  genre: string;
  publishedYear: string;
  available: boolean;
  borrowDate: string;
  dueDate: string;
}

export default function AddBookForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    genre: "",
    publishedYear: "",
    available: true,
    borrowDate: "",
    dueDate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : undefined,
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
        console.log("Book added successfully:", result.message);
        alert("Book added successfully");

        // Reset form after successful submission
        setFormData({
          title: "",
          author: "",
          genre: "",
          publishedYear: "",
          available: true,
          borrowDate: "",
          dueDate: "",
        });

        router.push("/"); // Redirect to the home page or wherever you want
      } else {
        alert(result.error || "Failed to add book. Please try again.");
      }
    } catch (error) {
      console.error("Error adding book:", error);
      alert("Failed to add book. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,...')] opacity-40"></div>

      <div className="w-full max-w-2xl z-10">
        <div className="flex items-center space-x-3 mb-8 justify-center">
          <div className="bg-blue-600 rounded-lg p-2 shadow-lg shadow-blue-900/20">
            <BookPlus className="w-6 h-6 text-gray-100" />
          </div>
          <h1 className="text-3xl font-bold text-gray-100">Add New Book</h1>
        </div>

        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-xl">
          <CardHeader className="border-b border-gray-700/50 pb-4">
            <CardTitle className="text-gray-100">Book Details</CardTitle>
            <CardDescription className="text-gray-400">
              Enter information about the book you want to add to the library
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-gray-300">Genre</Label>
                  <Select value={formData.genre} onValueChange={handleSelectChange}>
                    <SelectTrigger id="genre" className="bg-gray-700/50 border-gray-600 text-gray-100">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {["fiction", "non-fiction", "science-fiction", "fantasy", "mystery", "biography", "history", "self-help", "other"].map((g) => (
                        <SelectItem key={g} value={g} className="text-gray-200 capitalize">{g.replace("-", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="available" className="text-gray-300">Available</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="available"
                      name="available"
                      checked={formData.available}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-200">Mark as Available</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </CardContent>

            <CardFooter className="flex justify-between border-t border-gray-700/50 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Adding...
                  </div>
                ) : "Add Book"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center mt-8 text-gray-500 text-sm">
          © {new Date().getFullYear()} Bookwise Library System
        </div>
      </div>
    </div>
  );
}
