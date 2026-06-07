import axios from "axios";

const api = axios.create({
  baseURL:
    `${import.meta.env.VITE_API_URL}/api/v1` || "http://localhost:4000/api/v1",
  withCredentials: true, // CLAVE: Permite enviar y recibir cookies HttpOnly automáticamente
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
