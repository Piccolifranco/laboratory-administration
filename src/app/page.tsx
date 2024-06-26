"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Definir credenciales estáticas
  const validUser = "gianella";
  const validPassword = "curry123";

  const handleLogin = (e) => {
    e.preventDefault();

    // Verificar las credenciales
    if (user === validUser && password === validPassword) {
      toast.success("Inicio de sesión exitoso");
      // Redirigir a la página principal o realizar otras acciones necesarias
      setTimeout(() => {
        router.push("/pacientes");
      }, 2000); // Redirigir después de 2 segundos para que se muestre el toast
    } else {
      toast.error("Correo electrónico o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Administración de Historia Clínica
        </h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              htmlFor="user"
              className="block text-sm font-medium text-gray-700"
            >
              Usuario
            </label>
            <input
              type="text"
              id="user"
              placeholder="Usuario"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              placeholder="Contraseña"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember_me"
                className="ml-2 block text-sm text-gray-900"
              >
                Recordarme
              </label>
            </div>
            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-gray-900 hover:text-gray-800"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white dark:bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
      <ToastContainer position="bottom-center" />
    </div>
  );
}
