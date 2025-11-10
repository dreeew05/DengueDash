import Link from "next/link";

export default function GuestHeader() {
  return (
    <header className="bg-teal-800  text-white">
      <nav className="container w-5/6 mx-auto flex items-center justify-between py-6">
        <Link href="/" className="text-2xl font-bold">
          DengueDash
        </Link>
        <ul className="flex space-x-6">
          <li className="hover:underline">Dashboard</li>
          <Link href="/login">
            <li className="hover:underline">Login</li>
          </Link>
        </ul>
      </nav>
    </header>
  );
}
