// src/api/session.js
import api from "./index"

export const createSession = async ({ user_id }) => {
  const response = await api.post("/chat/create", { user_id }, {
    headers: { "Content-Type": "application/json" }
  })
  return response.data
}


