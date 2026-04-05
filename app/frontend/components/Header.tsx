import { Link } from "@inertiajs/react";
import DarkModeSwitch from "@/components/shadcn-studio/switch/switch-11";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";

export default function Header() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });
  const { cartCount } = useCart();

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
    } else if (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDark(true);
    }
  }, []);

  return (
    <header className="border-b">
      <div className="mx-auto max-w-2xl flex items-center justify-between py-3 px-4">
        <Link href="/products" className="text-lg font-bold hover:opacity-80">
          Store
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative hover:opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          <DarkModeSwitch checked={dark} onCheckedChange={setDark} />
        </div>
      </div>
    </header>
  );
}
