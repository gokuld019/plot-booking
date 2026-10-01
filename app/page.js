import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <Image
            src="/genuinelogo.png"
            alt="Company Logo"
            width={208}
            height={78}
            priority
            className="h-auto w-52 object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-[#231F20]">
          Welcome to Plot Booking
        </h1>
        <p className="text-[#6B6B6B] text-sm mb-8">
          Find your perfect plot. Premium locations. Trusted by 1000+ families.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="bg-[#E31E24] hover:bg-[#BF171C] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="border border-[#E31E24] text-[#E31E24] hover:bg-red-50 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}