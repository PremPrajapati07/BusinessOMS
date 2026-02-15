import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden p-8 text-center space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Status Handle</h1>
          <p className="text-gray-500 mt-2">InHouse Manufacturing Management</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/setup"
            className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Run Initial Setup
          </Link>
          <p className="text-xs text-gray-400">Use this for the first time to create an Admin user.</p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Already setup?</span>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="block w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
