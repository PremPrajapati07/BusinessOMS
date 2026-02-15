"use client"
import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DeleteKarigarButton({ karigarId }: { karigarId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this karigar? This will fail if they have associated orders or users.")) return

        setIsDeleting(true)
        try {
            const res = await fetch(`/api/karigars/${karigarId}`, {
                method: "DELETE",
            })

            if (res.ok) {
                router.refresh()
            } else {
                alert("Failed to delete karigar. Ensure they have no pending orders.")
            }
        } catch (error) {
            console.error(error)
            alert("An error occurred while deleting")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
            title="Delete Karigar"
        >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
    )
}
