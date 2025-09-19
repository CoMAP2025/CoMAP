import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./app";
import { AuthProvider } from './context/AuthContext.jsx'; // 导入 AuthProvider
import { DisplayProvider } from './context/DisplayContext';
const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
   <BrowserRouter>
    <DisplayProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </DisplayProvider>
    
  </BrowserRouter>
    
);
