import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

type UserRole = "guest" | "user" | "admin";

export type User = {
  id: string | null;
  name: string | null;
  role: UserRole;
};

type UserContextType = {
  user: User;
  login: (userData: User) => void;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({
    id: null,
    name: null,
    role: "guest",
  });

  
  useEffect(() => {
    const checkSession = async () => {
      try {
        
        const res = await fetch(import.meta.env.VITE_API_AUTH_URL, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setUser({
              id: data.user.id,
              name: data.user.name,
              role: data.user.role,
            });
            localStorage.setItem("user", JSON.stringify(data.user));
            return;
          }
        }

        
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (["guest", "user", "admin"].includes(parsed.role)) {
            setUser(parsed);
          }
        }
      } catch (err) {
        console.error("Erro ao verificar sessão:", err);
      }
    };

    checkSession();
  }, []);

 
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

 
  const logout = async () => {
    try {
      await fetch(import.meta.env.VITE_API_LOGOUT_URL, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
    setUser({ id: null, name: null, role: "guest" });
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("useUser deve ser usado dentro de UserProvider");
  return context;
};