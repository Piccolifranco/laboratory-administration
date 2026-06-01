"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaMicroscope } from "react-icons/fa";
import {
  UsersIcon,
  ChartBarIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { supabase } from "@/app/utils/supabaseClient";

const navItems = [
  { href: "/pacientes", label: "Pacientes", Icon: UsersIcon, match: "/paciente" },
  {
    href: "/estadisticas",
    label: "Estadísticas",
    Icon: ChartBarIcon,
    match: "/estadisticas",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("accessToken");
    router.push("/");
  };

  return (
    <aside className="flex h-screen w-60 flex-col bg-sidebar text-sidebar-text">
      <div className="flex items-center gap-3 px-4 py-6">
        <FaMicroscope className="text-2xl text-sidebar-text-active" />
        <span className="font-semibold text-sidebar-text-active">
          Anat. Patológica
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navItems.map(({ href, label, Icon, match }) => {
          const active = pathname.startsWith(match);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-item-active text-sidebar-text-active"
                  : "hover:bg-sidebar-item-hover"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-4 text-sm hover:bg-sidebar-item-hover"
      >
        <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
        Salir
      </button>
    </aside>
  );
}