import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-lg font-bold tracking-tight text-gray-900">
          SRI HOUSING INFRA
        </div>
        <div className="text-[10px] text-yellow-700 tracking-widest mb-8">
          • TRUSTED LEGACY •
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome to Plot Booking</h1>
        <p className="text-gray-500 text-sm mb-8">
          Find your perfect plot. Premium locations. Trusted by 1000+ families.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="border border-green-600 text-green-600 hover:bg-green-50 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}