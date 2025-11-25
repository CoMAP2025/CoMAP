// src/api/index.js
import axios from "axios"

const BASE_URL =  "/api"

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 100000 // 可根据需要调整
})

export default apiClient
