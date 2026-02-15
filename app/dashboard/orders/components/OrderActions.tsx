"use client"

import { jsPDF } from "jspdf"
import QRCode from "qrcode"
import { Download } from "lucide-react"

export default function OrderActions({ order }: { order: any }) {

    const generatePDF = async () => {
        const doc = new jsPDF()
        doc.setTextColor(0, 0, 0) // Black text throughout

        // Header
        doc.setFontSize(18)
        doc.setFont("helvetica", "bold")
        doc.text("JOB CARD", 105, 15, { align: "center" })

        // QR Code - Top Right
        try {
            const qrUrl = `${window.location.origin}/scan?orderId=${order.id}`
            const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 200 })
            doc.addImage(qrDataUrl, "PNG", 165, 8, 30, 30)
            doc.setFontSize(6)
            doc.text("Scan to Update", 180, 40, { align: "center" })
        } catch (e) {
            console.error("QR Error", e)
        }

        // Table starts at y=45
        let startY = 45
        const leftMargin = 15
        const colWidth = 85
        const rowHeight = 8
        let currentY = startY

        // Helper function to draw table row
        const drawRow = (label: string, value: string, y: number, isBold = false) => {
            doc.setLineWidth(0.3)
            doc.setTextColor(0, 0, 0) // Ensure black text
            // Draw borders
            doc.rect(leftMargin, y, colWidth, rowHeight) // Full row border
            doc.line(leftMargin + 35, y, leftMargin + 35, y + rowHeight) // Vertical separator

            // Label
            doc.setFont("helvetica", "normal")
            doc.setFontSize(9)
            doc.text(label + ":", leftMargin + 2, y + 5.5)

            // Value
            doc.setFont("helvetica", isBold ? "bold" : "normal")
            doc.setFontSize(9)
            const valueText = String(value || "-")
            const maxWidth = colWidth - 37
            const lines = doc.splitTextToSize(valueText, maxWidth)
            doc.text(lines, leftMargin + 37, y + 5.5)

            return y + rowHeight
        }

        // Draw table rows
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.text("Order Information", leftMargin, currentY - 3)

        currentY = drawRow("Order No.", `OE${String(order.id).padStart(4, '0')}`, currentY, true)
        currentY = drawRow("Order Date", new Date(order.issueDate).toLocaleDateString(), currentY)
        currentY = drawRow("Delivery Date", new Date(order.deliveryDate).toLocaleDateString(), currentY)
        currentY = drawRow("Karigar Name", order.karigar.name, currentY)
        currentY = drawRow("Items", order.itemCategory, currentY)
        currentY = drawRow("Weight", `${order.weight} gm`, currentY)
        currentY = drawRow("Quantity", String(order.quantity), currentY)

        if (order.partyOrderNo) {
            currentY = drawRow("Party Order No", order.partyOrderNo, currentY)
        }

        if (order.size) {
            currentY = drawRow("Size", order.size, currentY)
        }

        if (order.screwType) {
            currentY = drawRow("Screws", order.screwType, currentY)
        }

        // Pendant Chain Information
        if (order.itemCategory === "Pendant") {
            const chainInfo = order.hasChain
                ? `With Chain (${order.chainLength || "N/A"})`
                : "Without Chain"
            currentY = drawRow("Chain", chainInfo, currentY)
        }

        // Gold Details
        currentY += 3
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.text("Gold Details", leftMargin, currentY)
        currentY += 5

        currentY = drawRow("Purity", order.purity, currentY)
        currentY = drawRow("Gold Color", order.goldColor || "Yellow", currentY)

        const rateValue = order.isRateBooked && order.bookedRate
            ? `Rs. ${Number(order.bookedRate).toLocaleString('en-IN')}`
            : "Not Booked"
        currentY = drawRow("Rate Booked", rateValue, currentY)

        // Material Issued (Phase 10)
        if (order.materialIssued) {
            currentY += 5
            doc.setFont("helvetica", "bold")
            doc.setFontSize(10)
            doc.setTextColor(0, 51, 102) // Dark Blue for Section Header
            doc.text("Material Issued (To Karigar)", leftMargin, currentY)
            doc.setTextColor(0, 0, 0)
            currentY += 5

            doc.setLineWidth(0.5) // Thicker border for section
            // doc.line(leftMargin, currentY-1, leftMargin + colWidth, currentY-1) 

            currentY = drawRow("Issued Purity", order.materialIssued.purity, currentY)
            currentY = drawRow("Issued Weight", `${order.materialIssued.weight} gm`, currentY, true)
            currentY = drawRow("Issued Color", order.materialIssued.goldColor || "-", currentY)
            currentY = drawRow("Melting", `${order.materialIssued.melting}%`, currentY)

            if (order.materialIssued.diamondEntries && order.materialIssued.diamondEntries.length > 0) {
                const d = order.materialIssued.diamondEntries[0] // Just showing summary of first row for compactness or loop?
                // Summary of diamonds issued
                const totalPcs = order.materialIssued.diamondEntries.reduce((s: number, e: any) => s + Number(e.pieces), 0)
                const totalWt = order.materialIssued.diamondEntries.reduce((s: number, e: any) => s + Number(e.weight), 0).toFixed(2)
                currentY = drawRow("Issued Diamonds", `${totalPcs} pcs / ${totalWt} ct`, currentY)
            }
        }

        // Material Used & Completion (Phase 10)
        if (order.materialUsed) {
            currentY += 5
            doc.setFont("helvetica", "bold")
            doc.setFontSize(10)
            doc.setTextColor(0, 102, 51) // Dark Green for Completion
            doc.text("Order Completion Details", leftMargin, currentY)
            doc.setTextColor(0, 0, 0)
            currentY += 5

            currentY = drawRow("Used Weight", `${order.materialUsed.usedWeight} gm`, currentY)
            currentY = drawRow("Wastage", `${order.materialUsed.wastage} gm`, currentY)

            // Calculate Balance
            const issued = order.materialIssued?.weight || 0
            const used = order.materialUsed.usedWeight || 0
            const wastage = order.materialUsed.wastage || 0
            const balance = (issued - (used + wastage)).toFixed(3)

            currentY = drawRow("Balance (Return)", `${balance} gm`, currentY, true)
            currentY = drawRow("Final Melting", `${order.materialUsed.finalMelting}%`, currentY)
            currentY = drawRow("Gross Weight", `${order.materialUsed.finalProductWeight} gm`, currentY, true)
        }

        // Diamond Details - Show if any diamond entry exists (removed pieces > 0 check)
        if (order.diamondEntries && order.diamondEntries.length > 0) {
            currentY += 5
            doc.setFont("helvetica", "bold")
            doc.setFontSize(10)
            doc.setTextColor(0, 0, 0)
            doc.text("Diamond Details (Required)", leftMargin, currentY)
            currentY += 5

            // Diamond table header
            doc.setLineWidth(0.3)
            doc.rect(leftMargin, currentY, colWidth, 6)
            doc.setFontSize(8)
            doc.setFont("helvetica", "bold")
            doc.text("Shape", leftMargin + 2, currentY + 4)
            doc.text("Size", leftMargin + 20, currentY + 4)
            doc.text("Sieve", leftMargin + 35, currentY + 4)
            doc.text("Pcs", leftMargin + 50, currentY + 4)
            doc.text("Wt", leftMargin + 65, currentY + 4)
            currentY += 6

            // Diamond rows
            doc.setFont("helvetica", "normal")
            order.diamondEntries.forEach((entry: any) => {
                doc.rect(leftMargin, currentY, colWidth, 6)
                doc.text(entry.shape || "-", leftMargin + 2, currentY + 4)
                doc.text(entry.sizeMM || "-", leftMargin + 20, currentY + 4)
                doc.text(entry.sieveSize || "-", leftMargin + 35, currentY + 4)
                doc.text(entry.pieces ? String(entry.pieces) : "-", leftMargin + 50, currentY + 4)
                doc.text(entry.weight ? String(entry.weight) : "-", leftMargin + 65, currentY + 4)
                currentY += 6
            })
        }

        // Remarks
        if (order.remarks) {
            currentY += 3
            doc.setFont("helvetica", "bold")
            doc.setFontSize(9)
            currentY = drawRow("Remarks", order.remarks, currentY)
            doc.setTextColor(0, 0, 0) // Reset to black
        }

        // Images on the right side
        if (order.images && order.images.length > 0) {
            const imgStartX = 110
            const imgStartY = 45
            const imgWidth = 85

            try {
                if (order.images.length === 1) {
                    // Single large image
                    doc.addImage(order.images[0].imageUrl, "JPEG", imgStartX, imgStartY, imgWidth, imgWidth)
                } else if (order.images.length === 2) {
                    // Two images stacked
                    const halfHeight = (imgWidth - 5) / 2
                    doc.addImage(order.images[0].imageUrl, "JPEG", imgStartX, imgStartY, imgWidth, halfHeight)
                    doc.addImage(order.images[1].imageUrl, "JPEG", imgStartX, imgStartY + halfHeight + 5, imgWidth, halfHeight)
                } else if (order.images.length >= 3) {
                    // Three images: one large on top, two smaller below
                    const topHeight = 55
                    const bottomHeight = 28
                    const bottomWidth = (imgWidth - 3) / 2

                    doc.addImage(order.images[0].imageUrl, "JPEG", imgStartX, imgStartY, imgWidth, topHeight)
                    doc.addImage(order.images[1].imageUrl, "JPEG", imgStartX, imgStartY + topHeight + 3, bottomWidth, bottomHeight)
                    doc.addImage(order.images[2].imageUrl, "JPEG", imgStartX + bottomWidth + 3, imgStartY + topHeight + 3, bottomWidth, bottomHeight)
                }
            } catch (e) {
                console.error("Image Error", e)
            }
        }

        doc.save(`JobCard_OE${String(order.id).padStart(4, '0')}.pdf`)
    }

    return (
        <div className="flex gap-4">
            <button
                onClick={generatePDF}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-colors"
            >
                <Download size={18} />
                <span>Download Job Card</span>
            </button>
        </div>
    )
}
