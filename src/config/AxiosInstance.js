import axios from "axios";

// Calls /api on the same domain, it gets forwarded to the backend
// (setupProxy.js locally, vercel.json in production)
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "/api",
  withCredentials: true,
});

let onUnauthorized = null;

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    // a 401 from these just means "not logged in"
    const isAuthProbe = url.endsWith("/auth/me") || url.endsWith("/auth/login");

    if (status === 401 && !isAuthProbe && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export const errorMessage = (error, fallback = "Something went wrong") => {
  const fromServer = error?.response?.data?.message;
  if (fromServer) return fromServer;

  // no response at all
  if (error?.isAxiosError && !error.response) {
    return error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
      ? "The server took too long to respond. Try again."
      : "Cannot reach the server. Check your connection.";
  }

  return fallback;
};

export default axiosInstance;
