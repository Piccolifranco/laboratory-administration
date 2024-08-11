import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../../types/supabase";
import { FaMicroscope } from "react-icons/fa";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });
const createFetch =
  (options: Pick<RequestInit, "next" | "cache">) =>
  (url: RequestInfo | URL, init?: RequestInit) => {
    return fetch(url, {
      ...init,
      ...options,
    });
  };
export const supabase = createClient<Database>(
  "https://lylnvhhzhyqlbbjgymws.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5bG52aGh6aHlxbGJiamd5bXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4MjA3MzUsImV4cCI6MjAzNDM5NjczNX0.nFOeaQqh5WYlLlBKssniRY-NRmZt1Xp9yDfBnzaiGnA",
  {
    global: {
      fetch: createFetch({
        cache: "no-store",
      }),
    },
  }
);

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex justify-center items-center gap-10 dark:border-gray-700 dark:bg-gray-900">
          <Link href="/pacientes">
            <FaMicroscope className="text-white text-4xl" />
          </Link>
          <h1 className="text-4xl font-extrabold text-center text-gray-800 py-6 shadow-md  dark:text-white">
            Administración de Historia Clínica - Anatomía Patológica General
          </h1>
        </div>
        {children}
      </body>
    </html>
  );
}
