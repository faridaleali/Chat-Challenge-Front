"use client";

import { useEffect, useState, useRef } from "react";
import { useChatStore } from "../store/chatStore";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../lib/firebase";
import { useRouter } from "next/navigation";

const auth = getAuth(app);

export default function Chat() {
  const messages = useChatStore((state) => state.messages);
  const input = useChatStore((state) => state.input);
  const setInput = useChatStore((state) => state.setInput);
  const initListener = useChatStore((state) => state.initListener);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const isAuthLoading = useChatStore((state) => state.isAuthLoading);
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthLoading && userEmail === null) {
      router.replace("/");
    }
  }, [userEmail, isAuthLoading, router]);


  useEffect(() => {
    const unsubscribe = initListener();

    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
      user.getIdToken().then(setToken);
    }

    return () => unsubscribe();
  }, [initListener]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Por favor, inicia sesión para enviar mensajes");
      return;
    }

    if (!input.trim()) return;

    if (!token) {
      alert("No hay token de autorización");
      return;
    }

    try {
      await sendMessage(input, token);
      setInput("");
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      alert("Error enviando mensaje, revisa la consola");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserEmail(null);
      setToken(null);
      alert("Has cerrado sesión");
      router.replace("/"); 
    } catch (error) {
      console.error("Error cerrando sesión:", error);
      alert("No se pudo cerrar sesión");
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-gray-50 rounded-lg shadow-lg">
      {/* Navbar */}
      <nav className="bg-indigo-700 text-white px-6 py-4 rounded-t-lg shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <h1 className="text-xl font-bold">Fidoo ERP</h1>

          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            {userEmail ? (
              <>
                <span className="text-sm sm:text-base text-white text-wrap">
                  Logueado con: <strong>{userEmail}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-indigo-500 hover:bg-indigo-600 transition rounded px-3 py-1 text-sm sm:text-base font-medium shadow-sm mt-1 sm:mt-0"
                  aria-label="Cerrar sesión"
                >
                  Desloguearse
                </button>
              </>
            ) : (
              <span className="text-sm sm:text-base">No logueado</span>
            )}
          </div>
        </div>
      </nav>

      {/* Chat principal */}
      <main className="flex flex-col flex-1 p-4 sm:p-6 overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-white rounded-md p-4 shadow-inner scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-indigo-100">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 select-none mt-12 text-sm sm:text-base">
              No hay mensajes aún...
            </p>
          )}

          {messages.map((msg) => {
            const isMe = msg.email === userEmail;
            return (
              <div
                key={msg.id}
                className={`flex mb-3 ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-lg shadow-md
                    ${isMe
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }
                  `}
                  style={{ wordBreak: "break-word" }}
                >
                  {!isMe && (
                    <p className="text-xs font-semibold mb-1 text-indigo-600 sm:text-sm">
                      {msg.email}
                    </p>
                  )}
                  <p className="text-sm sm:text-base">{msg.text}</p>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input y botón */}
        <div className="flex gap-3 mt-4">
          <input
            type="text"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-700 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 outline-none shadow-sm text-sm sm:text-base transition"
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            onClick={handleSend}
            className="rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-indigo-700 active:scale-95 transition-transform duration-150 select-none text-sm sm:text-base"
            aria-label="Enviar mensaje"
          >
            Enviar
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-indigo-700 text-white text-center py-3 rounded-b-lg mt-auto">
        <p className="text-sm sm:text-base">© 2025 Fidoo ERP - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}
