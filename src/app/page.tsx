"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

export default function Home() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user, password }),
      });

      if (!response.ok) {
        toast.error("Correo electrónico o contraseña incorrectos");
        return;
      }

      toast.success("Inicio de sesión exitoso");
      // refresh() lets the proxy see the new cookie before we navigate.
      router.refresh();
      router.push("/pacientes");
    } catch {
      toast.error("No se pudo conectar. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-sunken flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-lg bg-surface shadow-lg rounded-lg p-8">
        <div className="w-[100%] justify-center flex">
          <Image
            src="/images/microscope.svg"
            alt="microscope"
            height={200}
            width={200}
          />
        </div>
        <h1 className="text-3xl font-bold text-center text-fg mb-6">
          Administración de Historia Clínica
        </h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              htmlFor="user"
              className="block text-sm font-medium text-fg-muted"
            >
              Usuario
            </label>
            <input
              type="text"
              id="user"
              placeholder="Usuario"
              className="mt-1 block w-full px-3 py-2 border border-border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-fg-muted"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              placeholder="Contraseña"
              className="mt-1 block w-full px-3 py-2 border border-border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-fg hover:text-fg-muted"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-fg-inverse bg-surface-inverse hover:bg-surface-inverse-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-ring disabled:opacity-60"
            disabled={submitting}
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
      <ToastContainer position="bottom-center" />
    </div>
  );
}
