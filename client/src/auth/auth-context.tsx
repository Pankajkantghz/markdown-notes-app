import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { axiosClient } from "@/lib/api-client";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  avatar: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (credential: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(() => {
    setUser(null);
    void axiosClient.post("/auth/logout").catch(() => {});
  }, []);

  const signIn = useCallback(async (credential: string) => {
    const response = await axiosClient.post<{ data: { user: AuthUser } }>(
      "/auth/google",
      { credential },
    );
    setUser(response.data.data.user);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => signOut();
    window.addEventListener("mireth:unauthorized", onUnauthorized);
    axiosClient
      .get<{ data: { user: AuthUser } }>("/auth/me")
      .then((response) => setUser(response.data.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
    return () =>
      window.removeEventListener("mireth:unauthorized", onUnauthorized);
  }, [signOut]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
