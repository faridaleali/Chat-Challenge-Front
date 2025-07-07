"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-tr from-indigo-600 to-purple-700 p-6">
      <h1 className="mb-12 text-center text-4xl font-bold text-white">
        Bienvenido a la app
      </h1>

      <div className="flex gap-6">
        <button
          onClick={() => router.push("/login")}
          className="rounded bg-white px-8 py-3 font-semibold text-indigo-700 shadow hover:bg-indigo-100"
        >
          Iniciar sesión
        </button>

        <button
          onClick={() => router.push("/register")}
          className="rounded border border-white px-8 py-3 font-semibold text-white hover:bg-white hover:text-indigo-700"
        >
          Registrarse
        </button>
      </div>
    </main>
  );
}
