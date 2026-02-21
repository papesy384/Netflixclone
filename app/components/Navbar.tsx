import Link from "next/link";
import { Sofa } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between px-6 bg-[#141414]">
      <Link
        href="/"
        className="flex items-center gap-2 text-[#E50914] font-bold text-xl tracking-tight hover:text-[#f40612] transition-colors"
        aria-label="The Social Sofa - Home"
      >
        <Sofa className="h-7 w-7" strokeWidth={2.5} />
        The Social Sofa
      </Link>
    </nav>
  );
}
