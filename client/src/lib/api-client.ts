import axios from "axios";

export const axiosClient = axios.create({
  // Production must stay same-origin so Chrome accepts the session cookie.
  baseURL: import.meta.env.PROD ? "/" : import.meta.env.VITE_API_URL || "/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-Mireth-Request": "1",
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !error.config?.url?.startsWith("/auth/")
    ) {
      window.dispatchEvent(new Event("mireth:unauthorized"));
    }
    return Promise.reject(error);
  },
);
