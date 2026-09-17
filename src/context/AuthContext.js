import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axiosInstance, { setUnauthorizedHandler } from "../config/AxiosInstance";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clear = useCallback(() => {
    setUser(null);
    setLoading(false);
  }, []);

  // log out if any request comes back with 401
  useEffect(() => {
    setUnauthorizedHandler(clear);
    return () => setUnauthorizedHandler(null);
  }, [clear]);

  // the cookie is httpOnly, so ask the server if we are logged in
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        if (cancelled) return;
        if (res.data?.success && res.data.data) {
          setUser(res.data.data);
          setLoading(false);
          return;
        }
        clear();
      } catch {
        if (!cancelled) clear();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clear]);

  const login = useCallback(async (credentials) => {
    const res = await axiosInstance.post("/auth/login", credentials);
    if (!res.data?.success || !res.data.data) {
      throw new Error(res.data?.message || "Could not sign you in");
    }
    setUser(res.data.data);
    setLoading(false);
    return res.data.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // ignore, log out locally anyway
    }
    clear();
  }, [clear]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading: loading,
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
