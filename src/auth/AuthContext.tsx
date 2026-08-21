import { createContext, useContext, useEffect, useState, ReactNode, SetStateAction } from "react";
import { api, setToken } from "../api/client";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (data: RegisterData) => Promise<User | null>;
  logout: () => void;
  refresh: () => Promise<User | null>;
  updateBalance: (balance: number) => void;
  updateFundedBalance: (accountType: "basic-funded" | "pro-funded", balance: number) => void;
  updatePurchasedBots: (purchasedBotIds: string[]) => void;
  setWalletBalance: (balance: SetStateAction<number>) => void;
}

interface RegisterData {
  email: string;
  full_name: string;
  password: string;
  referral_code?: string;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh(): Promise<User | null> {
    try {
      const { data } = await api.get<User>("/auth/me");
      setUser(data);
      return data;
    } catch {
      setUser(null);
      return null;
    }
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    // OAuth2 password flow expects form-encoded username/password.
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    const { data } = await api.post("/auth/login", form);
    setToken(data.access_token);
    return await refresh();
  }

  async function register(payload: RegisterData) {
    await api.post("/auth/register", payload);
    return await login(payload.email, payload.password);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  function updateBalance(balance: number) {
    setUser((prev) => (prev ? { ...prev, balance } : prev));
  }

  function updateFundedBalance(accountType: "basic-funded" | "pro-funded", balance: number) {
    setUser((prev) => {
      if (!prev) return prev;
      return accountType === "basic-funded"
        ? { ...prev, basic_funded_balance: balance }
        : { ...prev, pro_funded_balance: balance };
    });
  }

  function updatePurchasedBots(purchasedBotIds: string[]) {
    setUser((prev) => (prev ? { ...prev, purchased_bot_ids: purchasedBotIds } : prev));
  }

  // Shared wallet setter used by flows that need an atomic balance update.
  function setWalletBalance(nextBalance: SetStateAction<number>) {
    setUser((prev) => {
      if (!prev) return prev;
      const balance = typeof nextBalance === "function"
        ? nextBalance(Number(prev.balance ?? 0))
        : nextBalance;
      return { ...prev, balance };
    });
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh, updateBalance, updateFundedBalance, updatePurchasedBots, setWalletBalance }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
