"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface RecentActivityProps {
  title: string
  type: "users" | "fines"
}

export function RecentActivity({ title, type }: RecentActivityProps) {
  const [items, setItems] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (type === "users") {
          const response = await fetch("/api/recent-users")
          const data = await response.json()
          setItems(data)
        } else if (type === "fines") {
          const [finesRes, usersRes] = await Promise.all([
            fetch("/api/recent-fines"),
            fetch("/api/recent-users")
          ])
          const [finesData, usersData] = await Promise.all([
            finesRes.json(),
            usersRes.json()
          ])
          setItems(finesData)
          setUsers(usersData)
        }
      } catch (error) {
        console.error("Failed to fetch recent activity:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [type])

  const getUserById = (id: string) => {
    return users.find((u) => u.id === id)
  }

  return (
    <div className="bg-gray-800/70 border border-gray-700/50 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-700/50">
        <h3 className="font-medium text-gray-100">{title}</h3>
      </div>

      {loading ? (
        <div className="p-4 text-sm text-gray-400">Loading...</div>
      ) : (
        <div className="divide-y divide-gray-700/50">
          {type === "users" &&
            items.map((user) => (
              <div key={user.id} className="p-4 flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${user.name?.charAt(0)}`} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-100 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleString()}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
                      user.status === "active"
                        ? "bg-emerald-900/50 text-emerald-400"
                        : "bg-gray-700/50 text-gray-400"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
            ))}

          {type === "fines" &&
            items.map((fine) => {
              const user = getUserById(fine.userId)
              return (
                <div key={fine.id} className="p-4 flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${user?.name?.charAt(0)}`} />
                    <AvatarFallback>{user?.name?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-100 truncate">
                      ₹{fine.amount} — {fine.reason || "No reason"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user?.name || fine.userId}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-400">
                      {new Date(fine.createdAt).toLocaleString()}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
                        fine.paid
                          ? "bg-emerald-900/50 text-emerald-400"
                          : "bg-rose-900/50 text-rose-400"
                      }`}
                    >
                      {fine.paid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
