import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FaMicroscope } from "react-icons/fa";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anatomia Patologica",
  description:
    "Sistema de administracion de anatomia patologica para seguimiento de pacientes.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex justify-center items-center gap-10 border-gray-700 bg-gray-900">
          <Link href="/pacientes">
            <FaMicroscope className="text-white text-4xl" />
          </Link>
          <h1 className="text-4xl font-extrabold text-center text-white py-6 shadow-md">
            Administración de Historia Clínica - Anatomía Patológica General
          </h1>
        </div>
        {children}
      </body>
    </html>
  );
}
