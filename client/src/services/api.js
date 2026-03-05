import axios from "axios"

const API = axios.create({
  baseURL: "http://https://vitalsync-production-4649.up.railway.app:5000/api"
})

export const getHealthData = () => API.get("/health")
export const addHealthData = (data) => API.post("/health", data)