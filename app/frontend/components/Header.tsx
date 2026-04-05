import { Link } from "@inertiajs/react";
import DarkModeSwitch from "@/components/shadcn-studio/switch/switch-11";
import { useEffect, useState } from "react";

export default function Header() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

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
        <DarkModeSwitch checked={dark} onCheckedChange={setDark} />
      </div>
    </header>
  );
}
