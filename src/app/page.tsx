"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { supabase } from "./utils/supabaseClient";

export default function Home() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    const signedInUser = await supabase.auth.signInWithPassword({
      email: user,
      password: password,
    });
    if (signedInUser.data.session?.access_token) {
      localStorage.setItem(
        "accessToken",
        signedInUser.data.session?.access_token
      );
      toast.success("Inicio de sesión exitoso");

      setTimeout(() => {
        router.push("/pacientes");
      }, 500);
    } else {
      toast.error("Correo electrónico o contraseña incorrectos");
    }
    console.log("ACCESS TOKEN: ", signedInUser.data);

    // Verificar las credenciales
    // if (user === validUser && password === validPassword) {
  };

  return (
    <div className="h-[calc(100vh-88px)] bg-surface-sunken flex flex-col justify-center items-center">
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
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                className="h-4 w-4 text-accent focus:ring-accent-ring border-border-strong rounded"
              />
              <label
                htmlFor="remember_me"
                className="ml-2 block text-sm text-fg"
              >
                Recordarme
              </label>
            </div>
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
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-fg-inverse bg-surface-inverse hover:bg-surface-inverse-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-ring"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
      <ToastContainer position="bottom-center" />
    </div>
  );
}
