
import axios from "axios";

export const axiosClient = axios.create({
  // Defaults to same-origin so production can route /notes through a proxy.
  baseURL: import.meta.env.VITE_API_URL || "/",
  headers: {
    "Content-Type": "application/json",
  },
});
