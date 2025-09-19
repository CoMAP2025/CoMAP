// src/api/user.js
import api from "./index"

export const createUser = async ({ email, nickname }) => {
  const response = await api.post("/user/create", { email, nickname }, {
    headers: { "Content-Type": "application/json" }
  })
  return response.data
}
