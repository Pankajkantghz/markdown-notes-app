import axios from "axios";

export const axiosClient = axios.create({
  // Defaults to same-origin so production can route /notes through a proxy.
  baseURL: import.meta.env.VITE_API_URL || "/",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((request) => {
  const token = sessionStorage.getItem("mireth.google.credential");
  if (token) request.headers.Authorization = `Bearer ${token}`;
  return request;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      window.dispatchEvent(new Event("mireth:unauthorized"));
    }
    return Promise.reject(error);
  },
);
