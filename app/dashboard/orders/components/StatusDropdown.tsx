"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

const STATUS_OPTIONS = ["ISSUED", "RECEIVED", "COMPLETED"]

export default function StatusDropdown({ orderId, currentStatus, isAdmin, assignedKarigarId }: { orderId: number, currentStatus: string, isAdmin?: boolean, assignedKarigarId?: string }) {
    const { data: session } = useSession()
    const [status, setStatus] = useState(currentStatus)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const canUpdate = isAdmin || (session?.user?.role === "MANUFACTURER" && session?.user?.karigarId === assignedKarigarId)

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value

        if (newStatus === "COMPLETED") {
            // Redirect to completion form
            router.push(`/manufacturer/orders/${orderId}/complete`)
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                setStatus(newStatus)
                router.refresh()
            } else {
                const errorData = await res.json()
                alert(errorData.error || "Failed to update status")
            }
        } catch (error) {
            console.error(error)
            alert("Error updating status")
        } finally {
            setLoading(false)
        }
    }

    const getStatusStyles = (s: string) => {
        switch (s) {
            case "COMPLETED": return "bg-green-100 text-green-800 border-green-200"
            case "RECEIVED": return "bg-blue-100 text-blue-800 border-blue-200"
            default: return "bg-yellow-100 text-yellow-800 border-yellow-200"
        }
    }

    return (
        <select
            value={status}
            onChange={handleChange}
            disabled={loading || !canUpdate}
            className={`text-xs font-semibold rounded-full px-2 py-1 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${getStatusStyles(status)}`}
        >
            {STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    )
}
