"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ShieldCheck, User, ArrowRight, Lock, Mail, AlertTriangle } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [selectedRole, setSelectedRole] = useState<"ADMIN" | "KARIGAR" | null>(null)
    const router = useRouter()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedRole) {
            setError("Please select a login type first")
            return
        }
        setError("")
        setLoading(true)

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (res?.error) {
                setError("Login failed. Check your credentials.")
                setLoading(false)
            } else {
                // Successful login - router handles redirection based on middleware/session later 
                // but we can be proactive here
                router.push(selectedRole === "ADMIN" ? "/dashboard" : "/manufacturer/dashboard")
                router.refresh()
            }
        } catch (err) {
            setError("A network error occurred")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 selection:bg-indigo-100">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
            </div>

            <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[32px] shadow-2xl overflow-hidden relative z-10 border border-white/20 ring-1 ring-black/5">

                {/* Left Side: Role Selection & Branding */}
                <div className="p-8 lg:p-12 bg-slate-900 text-white flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <ShieldCheck className="text-white" size={24} />
                            </div>
                            <span className="text-2xl font-black tracking-tighter">VAAMA<span className="text-indigo-400">OMS</span></span>
                        </div>

                        <h1 className="text-4xl font-bold mb-4 leading-tight">Welcome to the <br /><span className="text-indigo-400 font-black">Control Center</span></h1>
                        <p className="text-slate-400 text-lg mb-8 font-medium">Select your portal to continue.</p>

                        <div className="space-y-4">
                            <button
                                onClick={() => setSelectedRole("ADMIN")}
                                className={`w-full group p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${selectedRole === "ADMIN" ? "bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-600/20" : "bg-slate-800/50 border-slate-700 hover:border-slate-500"}`}
                            >
                                <div className={`p-3 rounded-xl transition-colors ${selectedRole === "ADMIN" ? "bg-white/10" : "bg-slate-700 group-hover:bg-slate-600"}`}>
                                    <ShieldCheck size={28} className={selectedRole === "ADMIN" ? "text-white" : "text-indigo-400"} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-lg">Admin Login</p>
                                    <p className="text-sm opacity-60">Full manufacturing control</p>
                                </div>
                                <ArrowRight className={`ml-auto transition-transform ${selectedRole === "ADMIN" ? "translate-x-1" : "opacity-0 group-hover:opacity-100"}`} size={20} />
                            </button>

                            <button
                                onClick={() => setSelectedRole("KARIGAR")}
                                className={`w-full group p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${selectedRole === "KARIGAR" ? "bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-600/20" : "bg-slate-800/50 border-slate-700 hover:border-slate-500"}`}
                            >
                                <div className={`p-3 rounded-xl transition-colors ${selectedRole === "KARIGAR" ? "bg-white/10" : "bg-slate-700 group-hover:bg-slate-600"}`}>
                                    <User size={28} className={selectedRole === "KARIGAR" ? "text-white" : "text-indigo-400"} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-lg">Karigar Login</p>
                                    <p className="text-sm opacity-60">Order status & material usage</p>
                                </div>
                                <ArrowRight className={`ml-auto transition-transform ${selectedRole === "KARIGAR" ? "translate-x-1" : "opacity-0 group-hover:opacity-100"}`} size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-widest">
                        <span>© 2026 Vaama Exports</span>
                        <span>v2.0.4</span>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="p-8 lg:p-12 bg-white flex flex-col justify-center">
                    {!selectedRole ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Lock className="text-slate-300" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Secure Access</h2>
                            <p className="text-slate-500">Please select a portal on the left to start your session.</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="mb-10">
                                <h2 className="text-3xl font-black text-slate-900 mb-2">Login as <span className="text-indigo-600">{selectedRole}</span></h2>
                                <p className="text-slate-500 font-medium">Enter your credentials to continue.</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 border border-red-100 animate-in shake duration-500">
                                    <AlertTriangle size={18} />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium text-slate-900"
                                            placeholder="name@vaama.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Secret Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium text-slate-900"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <span className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <>Access Dashboard <ArrowRight size={20} /></>
                                    )}
                                </button>
                            </form>

                            <button
                                onClick={() => setSelectedRole(null)}
                                className="w-full mt-6 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                            >
                                ← Switch Role
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
