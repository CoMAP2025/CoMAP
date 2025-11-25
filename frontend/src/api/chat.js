// src/api/chat.js
import api from "./index"

export const generateReply = async ({ session_id, map, question }) => {
  const response = await api.post("/chat/generate", {
    session_id,
    map,
    question
  }, {
    headers: { "Content-Type": "application/json" }
  })
  return response.data
}




export const chatReply = async ({ session_id, question }) => {
  const response = await api.post("/chat/chat", {
    session_id,
    question
  }, {
    headers: { "Content-Type": "application/json" }
  })
  return response.data
}