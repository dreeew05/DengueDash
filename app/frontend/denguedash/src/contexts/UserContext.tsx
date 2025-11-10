"use client";

import { MyUserInterface } from "@/interfaces/account/user-interface";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext<{
  user: MyUserInterface | null;
  setUser: React.Dispatch<React.SetStateAction<MyUserInterface | null>>;
}>({
  user: null,
  setUser: () => {},
});

import { ReactNode } from "react";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MyUserInterface | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
