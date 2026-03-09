import axios from "axios"

const API = axios.create({
  baseURL: "https://vitalsync-2s35.onrender.com"
})

export const getHealthData = () => API.get("/health")
export const addHealthData = (data) => API.post("/health", data)