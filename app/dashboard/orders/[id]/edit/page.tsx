"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Upload, X, ArrowRight, Eye, Save, Plus, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [parties, setParties] = useState<any[]>([])
    const [karigars, setKarigars] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [showPreview, setShowPreview] = useState(false)

    const [formData, setFormData] = useState({
        partyId: "",
        karigarId: "",
        deliveryDate: "",
        issueDate: "",
        quantity: 1,
        weight: 0,
        partyOrderNo: "",
        itemCategory: "Ring",
        purity: "18K",
        size: "",
        screwType: "",
        remarks: "",
        goldColor: "Yellow",
        isRateBooked: false,
        bookedRate: "",
        cadFileUrl: "",
        hasChain: false,
        chainLength: "",
    })

    const [images, setImages] = useState<string[]>([])
    const [uploading, setUploading] = useState(false)

    // Diamond Entries
    const [diamondEntries, setDiamondEntries] = useState([
        { shape: "Round", sizeMM: "", sieveSize: "", pieces: 0, weight: 0.0 }
    ])

    useEffect(() => {
        // Fetch Master Data
        const fetchMasters = async () => {
            const [pRes, kRes] = await Promise.all([
                fetch("/api/parties"),
                fetch("/api/karigars")
            ])
            const [pData, kData] = await Promise.all([pRes.json(), kRes.json()])
            setParties(pData)
            setKarigars(kData)
        }

        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/orders/${id}`)
                if (!res.ok) throw new Error("Order not found")
                const order = await res.json()

                setFormData({
                    partyId: order.partyId || "",
                    karigarId: order.karigarId || "",
                    deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : "",
                    issueDate: order.issueDate ? new Date(order.issueDate).toISOString().split('T')[0] : "",
                    quantity: order.quantity || 1,
                    weight: order.weight || 0,
                    partyOrderNo: order.partyOrderNo || "",
                    itemCategory: order.itemCategory || "Ring",
                    purity: order.purity || "18K",
                    size: order.size || "",
                    screwType: order.screwType || "",
                    remarks: order.remarks || "",
                    goldColor: order.goldColor || "Yellow",
                    isRateBooked: order.isRateBooked || false,
                    bookedRate: order.bookedRate?.toString() || "",
                    cadFileUrl: order.cadFileUrl || "",
                    hasChain: order.hasChain || false,
                    chainLength: order.chainLength || "",
                })

                if (order.images && order.images.length > 0) {
                    setImages(order.images.map((img: any) => img.imageUrl))
                }

                if (order.diamondEntries && order.diamondEntries.length > 0) {
                    setDiamondEntries(order.diamondEntries.map((d: any) => ({
                        shape: d.shape,
                        sizeMM: d.sizeMM || "",
                        sieveSize: d.sieveSize || "",
                        pieces: d.pieces || 0,
                        weight: d.weight || 0.0
                    })))
                } else {
                    setDiamondEntries([{ shape: "Round", sizeMM: "", sieveSize: "", pieces: 0, weight: 0.0 }])
                }
            } catch (err) {
                console.error(err)
                alert("Failed to load order data")
                router.push("/dashboard/orders")
            } finally {
                setFetching(false)
            }
        }

        fetchMasters()
        fetchOrder()
    }, [id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }))
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return
        setUploading(true)
        const file = e.target.files[0]
        const data = new FormData()
        data.append("file", file)

        try {
            const res = await fetch("/api/upload", { method: "POST", body: data })
            const json = await res.json()
            if (json.url) {
                setImages(prev => [...prev, json.url])
            }
        } catch (err) {
            console.error(err)
            alert("Upload failed")
        } finally {
            setUploading(false)
        }
    }

    const handleCadUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return
        setUploading(true)
        const file = e.target.files[0]
        const data = new FormData()
        data.append("file", file)
        try {
            const res = await fetch("/api/upload", { method: "POST", body: data })
            const json = await res.json()
            if (json.url) {
                setFormData(prev => ({ ...prev, cadFileUrl: json.url }))
            }
        } catch (err) {
            console.error("CAD Upload Error", err)
            alert("CAD Upload failed")
        } finally {
            setUploading(false)
        }
    }

    const addDiamondRow = () => {
        setDiamondEntries([...diamondEntries, { shape: "Round", sizeMM: "", sieveSize: "", pieces: 0, weight: 0.0 }])
    }

    const removeDiamondRow = (index: number) => {
        setDiamondEntries(diamondEntries.filter((_, i) => i !== index))
    }

    const updateDiamondRow = (index: number, field: string, value: any) => {
        const newEntries = [...diamondEntries]
        newEntries[index] = { ...newEntries[index], [field]: value }
        setDiamondEntries(newEntries)
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/orders/${id}/edit`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    imageUrls: images,
                    diamondEntries
                }),
            })

            if (res.ok) {
                router.push(`/dashboard/orders/${id}`)
                router.refresh()
            } else {
                alert("Failed to update order")
            }
        } catch (err) {
            alert("Error updating order")
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return <div className="flex justify-center items-center min-h-[400px]">Loading order data...</div>
    }

    if (showPreview) {
        const partyName = parties.find(p => p.id === formData.partyId)?.name
        const karigarName = karigars.find(k => k.id === formData.karigarId)?.name

        return (
            <div className="space-y-6 max-w-4xl mx-auto pb-10">
                <div className="flex justify-between items-center text-black">
                    <h1 className="text-2xl font-bold">Preview Updates</h1>
                    <div className="space-x-4">
                        <button onClick={() => setShowPreview(false)} className="px-4 py-2 border rounded text-gray-700 bg-white">Back to Edit</button>
                        <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700">
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-lg shadow border grid grid-cols-2 gap-8 text-black" id="printable-area">
                    <div>
                        <h3 className="text-lg font-bold border-b pb-2 mb-4">Order Details</h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 text-sm"><span className="text-gray-500">Party:</span> <span className="font-semibold">{partyName}</span></div>
                            <div className="grid grid-cols-2 text-sm"><span className="text-gray-500">Party Order No:</span> <span>{formData.partyOrderNo || "-"}</span></div>
                            <div className="grid grid-cols-2 text-sm"><span className="text-gray-500">Karigar:</span> <span className="font-semibold">{karigarName}</span></div>
                            <div className="grid grid-cols-2 text-sm"><span className="text-gray-500">Item:</span> <span>{formData.itemCategory}</span></div>
                            <div className="grid grid-cols-2 text-sm"><span className="text-gray-500">Gold:</span> <span>{formData.purity} / {formData.goldColor}</span></div>
                            <div className="grid grid-cols-2 text-sm"><span className="text-gray-500">Weight:</span> <span>{formData.weight} g</span></div>
                            <div className="grid grid-cols-2 text-sm"><span className="text-gray-500">Rate Booked:</span> <span>{formData.isRateBooked ? `Yes (${formData.bookedRate})` : "No"}</span></div>
                            {formData.size && <div className="grid grid-cols-2 text-sm"><span className="text-gray-500">Size:</span> <span>{formData.size}</span></div>}
                            {formData.screwType && <div className="grid grid-cols-2 text-sm"><span className="text-gray-500">Screw:</span> <span>{formData.screwType}</span></div>}
                            {formData.itemCategory === "Pendant" && (
                                <div className="grid grid-cols-2 text-sm">
                                    <span className="text-gray-500">Chain:</span>
                                    <span>{formData.hasChain ? `With Chain (${formData.chainLength})` : "Without Chain"}</span>
                                </div>
                            )}
                            <div className="grid grid-cols-2 text-sm"><span className="text-gray-500">Delivery Date:</span> <span>{formData.deliveryDate}</span></div>
                            <div className="grid grid-cols-2 text-sm"><span className="text-gray-500">Remarks:</span> <span className="text-red-600">{formData.remarks}</span></div>
                        </div>

                        {diamondEntries.length > 0 && Number(diamondEntries[0].pieces) > 0 && (
                            <div className="mt-6">
                                <h4 className="font-bold border-b pb-1 mb-2">Diamond Details</h4>
                                <table className="w-full text-xs text-left">
                                    <thead>
                                        <tr className="border-b">
                                            <th>Shape</th>
                                            <th>Size</th>
                                            <th>Pcs</th>
                                            <th>Wt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {diamondEntries.map((d, i) => (
                                            <tr key={i} className="border-b">
                                                <td className="py-1">{d.shape}</td>
                                                <td className="py-1">{d.sizeMM || d.sieveSize}</td>
                                                <td className="py-1">{d.pieces}</td>
                                                <td className="py-1">{d.weight}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold border-b pb-2 mb-4">Design ({images.length})</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {images.map((img, i) => (
                                <img key={i} src={img} alt="Design" className={`object-contain border rounded ${i === 0 ? "col-span-2 h-48 w-full" : "h-24 w-full"}`} />
                            ))}
                        </div>
                        {formData.cadFileUrl && <div className="mt-4 text-sm text-green-600 font-medium">CAD File Attached</div>}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20 text-black">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/orders/${id}`} className="p-2 hover:bg-gray-100 rounded-full border">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold">Edit Order #{id.toString().padStart(4, '0')}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left Column: Basic Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">Basic Info</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700">Issue Date</label>
                            <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} className="block w-full p-2 border rounded text-sm bg-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700">Delivery Date *</label>
                            <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} className="block w-full p-2 border rounded text-sm bg-white" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700">Party *</label>
                            <select name="partyId" value={formData.partyId} onChange={handleChange} className="block w-full p-2 border rounded text-sm bg-white" required>
                                <option value="">Select Party</option>
                                {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700">Karigar *</label>
                            <select name="karigarId" value={formData.karigarId} onChange={handleChange} className="block w-full p-2 border rounded text-sm bg-white" required>
                                <option value="">Select Karigar</option>
                                {karigars.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700">Party Order No</label>
                        <input type="text" name="partyOrderNo" value={formData.partyOrderNo} onChange={handleChange} className="block w-full p-2 border rounded text-sm bg-white" />
                    </div>
                </div>

                {/* Right Column: Item Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">Item Details</h3>

                    {/* Categories */}
                    <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">Item Category</label>
                        <div className="flex flex-wrap gap-2">
                            {["Ring", "Pendant", "Earring", "Ladies Ring", "Bangle", "Necklace"].map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, itemCategory: cat, hasChain: false, chainLength: "" })}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${formData.itemCategory === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'text-black border-gray-200 hover:bg-gray-50 bg-white'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Conditional Size/Screw/Chain */}
                    <div className="grid grid-cols-2 gap-4">
                        {(formData.itemCategory.includes("Ring")) && (
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Size (7-30)</label>
                                <select name="size" value={formData.size} onChange={handleChange} className="block w-full p-2 border rounded text-sm bg-white">
                                    <option value="">None</option>
                                    {Array.from({ length: 24 }, (_, i) => i + 7).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
                        {(formData.itemCategory.includes("Earring")) && (
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Screw Type</label>
                                <select name="screwType" value={formData.screwType} onChange={handleChange} className="block w-full p-2 border rounded text-sm bg-white">
                                    <option value="">None</option>
                                    <option value="South">South</option>
                                    <option value="Bombay">Bombay</option>
                                    <option value="Madras">Madras</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Pendant Chain Options */}
                    {formData.itemCategory === "Pendant" && (
                        <div className="space-y-3 border-t pt-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">Chain Option</label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, hasChain: false, chainLength: "" })}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium border ${!formData.hasChain ? 'bg-indigo-600 text-white border-indigo-600' : 'text-black border-gray-200 hover:bg-gray-50 bg-white'}`}
                                    >
                                        Without Chain
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, hasChain: true })}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium border ${formData.hasChain ? 'bg-indigo-600 text-white border-indigo-600' : 'text-black border-gray-200 hover:bg-gray-50 bg-white'}`}
                                    >
                                        With Chain
                                    </button>
                                </div>
                            </div>
                            {formData.hasChain && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Chain Length</label>
                                    <select
                                        name="chainLength"
                                        value={formData.chainLength}
                                        onChange={handleChange}
                                        className="block w-full p-2 border rounded text-sm bg-white"
                                        required={formData.hasChain}
                                    >
                                        <option value="">Select Length</option>
                                        <option value='16"'>16"</option>
                                        <option value='18"'>18"</option>
                                        <option value='20"'>20"</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Row 2: Gold & Diamond */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="font-bold text-lg border-b pb-2">Gold & Diamond Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Gold Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700">Purity</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {["18K", "14K", "22K", "Melting"].map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, purity: p })}
                                        className={`px-2 py-1 rounded text-xs border ${formData.purity === p ? 'bg-indigo-600 text-white' : 'bg-white'}`}
                                    >{p}</button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700">Gold Color</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {["Yellow", "Rose", "White"].map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, goldColor: c })}
                                        className={`px-2 py-1 rounded text-xs border ${formData.goldColor === c ? 'bg-yellow-100 border-yellow-400 text-yellow-800' : 'bg-white'}`}
                                    >{c}</button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700">Approx Weight (gm)</label>
                            <input type="number" step="0.01" name="weight" value={formData.weight} onChange={handleChange} className="block w-full p-2 border rounded text-sm bg-white" />
                        </div>

                        <div className="flex items-center gap-2 border p-2 rounded bg-gray-50">
                            <input type="checkbox" name="isRateBooked" checked={formData.isRateBooked} onChange={handleChange} />
                            <span className="text-sm">Rate Booked?</span>
                            {formData.isRateBooked && (
                                <input type="number" placeholder="Rate" name="bookedRate" value={formData.bookedRate} onChange={handleChange} className="w-20 p-1 border rounded text-sm bg-white" />
                            )}
                        </div>
                    </div>

                    {/* Diamond Table */}
                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-2">Diamond Components</label>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-600">
                                    <tr>
                                        <th className="p-2 font-medium">Shape</th>
                                        <th className="p-2 font-medium">Size (mm)</th>
                                        <th className="p-2 font-medium">Sieve</th>
                                        <th className="p-2 font-medium">Pcs</th>
                                        <th className="p-2 font-medium">Wt</th>
                                        <th className="p-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {diamondEntries.map((row, idx) => (
                                        <tr key={idx} className="border-t">
                                            <td className="p-2">
                                                <select value={row.shape} onChange={(e) => updateDiamondRow(idx, 'shape', e.target.value)} className="w-full p-1 border rounded text-xs bg-white">
                                                    <option value="Round">Round</option>
                                                    <option value="Princess">Princess</option>
                                                    <option value="Marquise">Marquise</option>
                                                    <option value="Pear">Pear</option>
                                                    <option value="Oval">Oval</option>
                                                </select>
                                            </td>
                                            <td className="p-2"><input type="text" value={row.sizeMM} onChange={(e) => updateDiamondRow(idx, 'sizeMM', e.target.value)} className="w-full p-1 border rounded text-xs bg-white" placeholder="mm" /></td>
                                            <td className="p-2"><input type="text" value={row.sieveSize} onChange={(e) => updateDiamondRow(idx, 'sieveSize', e.target.value)} className="w-full p-1 border rounded text-xs bg-white" placeholder="sieve" /></td>
                                            <td className="p-2"><input type="number" value={row.pieces} onChange={(e) => updateDiamondRow(idx, 'pieces', e.target.value)} className="w-full p-1 border rounded text-xs bg-white" /></td>
                                            <td className="p-2"><input type="number" step="0.01" value={row.weight} onChange={(e) => updateDiamondRow(idx, 'weight', e.target.value)} className="w-full p-1 border rounded text-xs bg-white" /></td>
                                            <td className="p-2 text-center">
                                                <button onClick={() => removeDiamondRow(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-2 bg-gray-50 border-t">
                                <button type="button" onClick={addDiamondRow} className="flex items-center gap-1 text-xs text-indigo-600 font-medium"><Plus size={14} /> Add Row</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Uploads */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg border-b pb-2 mb-4">Files</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Design Images (Max 3)</label>
                        <div className="flex gap-4">
                            {images.length < 3 && (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative w-24 h-24 flex items-center justify-center">
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    <Upload className="text-gray-400" />
                                </div>
                            )}
                            {images.map((img, idx) => (
                                <div key={idx} className="relative w-24 h-24 border rounded overflow-hidden group">
                                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                                    <button onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl shadow opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CAD File (.3dm / .stl)</label>
                        <div className="border border-gray-300 rounded-md p-3 flex items-center justify-between">
                            <span className="text-sm text-gray-600 truncate max-w-[200px]">{formData.cadFileUrl ? "File Uploaded" : "No file selected"}</span>
                            <div className="relative overflow-hidden inline-block">
                                <button className="border border-gray-300 bg-white text-gray-700 py-1 px-3 rounded text-xs hover:bg-gray-50">Upload</button>
                                <input type="file" accept=".3dm,.stl" onChange={handleCadUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                        </div>
                        {formData.cadFileUrl && <p className="text-xs text-green-600 mt-1">CAD file attached successfully.</p>}
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-4">
                <button
                    disabled={!formData.partyId || !formData.karigarId || !formData.deliveryDate}
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Eye size={18} />
                    <span>Review Changes</span>
                </button>
            </div>
        </div>
    )
}
