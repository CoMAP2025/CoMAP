// src/api/login.js
import api from "./index";

export const login = async (email) => { // 接收 email 参数
  const response = await api.post("/user/login", { email });
  return response.data;
};

export const checkAuthStatus = async () => {
  // 尝试访问一个受保护的路由，如果成功则说明已登录
  await api.get("/map/");
};

// 新增：登出接口
export const logout = async () => {
  await api.post("/user/logout");
};