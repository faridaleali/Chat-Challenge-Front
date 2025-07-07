"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import useAuthListener from "./useAuthListener";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const { loading } = useAuthListener();

  if (loading) return <div>Cargando...</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      useAuthStore.getState().setToken(token);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_WEB;

      if (!backendUrl) throw new Error("NEXT_PUBLIC_BACKEND_WEB no definida");

      const res = await fetch(`${backendUrl}/auth/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Token inválido en el backend");

      alert("Login exitoso");
      router.push("/chat");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-700">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Iniciar sesión</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-2 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full mb-4 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <button className="bg-indigo-600 text-white w-full p-2 rounded hover:bg-indigo-700">
          Entrar
        </button>
      </form>
    </div>
  );
}
