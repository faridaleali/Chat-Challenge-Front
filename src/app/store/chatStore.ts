import { create } from "zustand";
import { Timestamp } from "firebase/firestore";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../lib/firebase";

const db = getFirestore(app);
const auth = getAuth(app);

interface Message {
  id: string;
  text: string;
  uid: string;
  email: string;
  createdAt: Timestamp;
}

interface ChatState {
  messages: Message[];
  input: string;
  userEmail: string | null;
  token: string | null;
  setInput: (text: string) => void;
  setUserEmail: (email: string | null) => void;
  setToken: (token: string | null) => void;
  initListener: () => () => void;
  initAuthListener: () => () => void;
  sendMessage: (message: string, token: string) => Promise<void>;
  isAuthLoading: boolean;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  input: "",
  userEmail: null,
  token: null,
  isAuthLoading: true,

  setInput: (text) => set({ input: text }),
  setUserEmail: (email) => set({ userEmail: email }),
  setToken: (token) => set({ token }),

  initListener: () => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const msgs: Message[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          msgs.push({ id: doc.id, ...data } as Message);
        });
        set({ messages: msgs });
      },
      (error) => {
        console.error("Error listening messages:", error);
      }
    );
    return unsubscribe;
  },

  initAuthListener: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        set({
          userEmail: user.email,
          token,
          isAuthLoading: false,
        });
      } else {
        set({
          userEmail: null,
          token: null,
          isAuthLoading: false,
        });
      }
    });

    return unsubscribe;
  },

  sendMessage: async (message, token) => {
    if (!message.trim()) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_WEB;

    if (!backendUrl) {
      console.error("La variable NEXT_PUBLIC_BACKEND_WEB no está definida");
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error("Error al comunicarse con el backend");
      }

      const data = await res.json();
      console.log("Respuesta del backend:", data.reply);
    } catch (err) {
      console.error("Fallo al enviar mensaje al backend:", err);
    }
  },
}));
