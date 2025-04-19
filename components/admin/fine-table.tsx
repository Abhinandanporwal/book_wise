"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash, CheckCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

// Fetch fines from API
const fetchFines = async () => {
  const response = await fetch("/api/fines")
  if (!response.ok) {
    throw new Error("Failed to fetch fines")
  }
  return await response.json()
}

export function FinesTable() {
  const router = useRouter();  // Place the useRouter hook inside the component
  const [selectedFines, setSelectedFines] = useState<number[]>([])
  const [fines, setFines] = useState<any[]>([])

  useEffect(() => {
    const getFines = async () => {
      try {
        const data = await fetchFines()
        setFines(data)
      } catch (error) {
        console.error("Error fetching fines:", error)
      }
    }

    getFines()
  }, [])

  const handleadd = () => {
    router.push("fines/addfine");
  };

  const toggleSelectFine = (id: number) => {
    setSelectedFines((prev) => (prev.includes(id) ? prev.filter((fineId) => fineId !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedFines.length === fines.length) {
      setSelectedFines([])
    } else {
      setSelectedFines(fines.map((fine) => fine.id))
    }
  }

  type Fine = {
    id: string;
    paid: boolean;
    amount: number;
    user: {
      name: string;
      email: string;
    };
    reason: string;
    createdAt: string;
  };
  const handleedit=()=>{
    router.push("comingsoon")
  }
  const FineRow = ({ fine }: { fine: Fine }) => {
    const [isPaid, setIsPaid] = useState(fine.paid);
    const router = useRouter();

    const handleMarkPaid = async () => {
      try {
        // Call the backend API to update the status
        const res = await fetch(`/api/fines/${fine.id}/pay`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paid: true }),
        });

        if (!res.ok) {
          throw new Error("Failed to mark fine as paid");
        }

        // Update the local state (and UI) once the fine is marked as paid
        setIsPaid(true);
        toast.success("Fine marked as paid");

        // Optionally, refresh data (or router.refresh() if using Next.js with server components)
        router.refresh(); // to re-fetch or refresh the page
      } catch (err) {
        console.error("Error:", err);
        toast.error("Failed to mark fine as paid");
      }
    };

    return (
      <TableRow key={fine.id} className="border-gray-700/50 hover:bg-gray-800/50">
        <TableCell>
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-900"
            checked={selectedFines.includes(fine.id)}
            onChange={() => toggleSelectFine(fine.id)}
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${fine.user.name.charAt(0)}`} />
              <AvatarFallback>{fine.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-100">{fine.user.name}</p>
              <p className="text-xs text-gray-400">{fine.user.email}</p>
            </div>
          </div>
        </TableCell>
        <TableCell>{fine.reason || "No reason provided"}</TableCell>
        <TableCell className="font-medium">{fine.amount}</TableCell>
        <TableCell>
          <Badge variant={fine.paid ? "success" : "warning"}>{fine.paid ? "Paid" : "Pending"}</Badge>
        </TableCell>
        <TableCell>{fine.createdAt}</TableCell>
        <TableCell>{fine.createdAt}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40"onClick={handleedit}>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {!fine.paid && (
                <DropdownMenuItem className="text-emerald-500" onClick={handleMarkPaid}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Paid
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-red-500">
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="bg-gray-800/70 border border-gray-700/50 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
        <h3 className="font-medium text-gray-100">Overdue Fines</h3>
        <div className="flex space-x-2">
          {selectedFines.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-600 text-emerald-500 hover:bg-emerald-900/20 hover:text-emerald-400"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark Paid ({selectedFines.length})
              </Button>
              <Button variant="destructive" size="sm">
                <Trash className="h-4 w-4 mr-1" />
                Delete ({selectedFines.length})
              </Button>
            </>
          )}
          <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleadd}>
            Add Fine
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700/50 hover:bg-gray-800/50">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-900"
                  checked={selectedFines.length === fines.length && fines.length > 0}
                  onChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Book</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Issued Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fines.map((fine) => (
              <FineRow key={fine.id} fine={fine} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
