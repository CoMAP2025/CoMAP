import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login'; // 导入你的登录页面组件

// 假设你有一个主页面组件
// 请替换成你实际的组件路径和名称
import DesignCanvas from './pages/DesignCanvas'; 
import DashboardPage from './pages/DashBoard';
import FullScreenChat from './pages/Chat';
function App() {
  return (
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/chat" element={<FullScreenChat/>}/>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/design-canvas/:canvasId" element={<DesignCanvas />} />
      </Routes>

  );
}

export default App;
