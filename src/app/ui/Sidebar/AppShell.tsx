"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { FaMicroscope } from "react-icons/fa";
import clsx from "clsx";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:flex">
      {/* Mobile top bar (hidden on desktop) */}
      <div className="flex items-center gap-3 bg-sidebar px-4 py-3 text-sidebar-text-active md:hidden">
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <FaMicroscope className="text-xl" />
        <span className="font-semibold">Anat. Patológica</span>
      </div>

      {/* Backdrop (mobile only, when open) */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: off-canvas drawer on mobile, static column on desktop */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onNavigate={() => setOpen(false)} />
      </div>

      <main className="min-h-screen flex-1">{children}</main>
    </div>
  );
}