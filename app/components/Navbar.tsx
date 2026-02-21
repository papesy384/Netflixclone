import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between px-6 bg-[#141414]">
      <Link
        href="/"
        className="text-[#e50914] font-bold text-2xl tracking-tight hover:text-[#f40612] transition-colors"
        aria-label="Home"
      >
        NETFLIX
      </Link>
      <Link
        href="/watch/new"
        className="rounded bg-[#e50914] px-4 py-2 text-sm font-semibold text-white hover:bg-[#f40612]"
      >
        Watch now
      </Link>
    </nav>
  );
}
