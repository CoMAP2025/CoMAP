// import React, { useState } from 'react';
// import './App.css';
// import ModelStatistics from './pages/ModelStatistics';
// import Sidebar from './components/Sidebar';
// import DesignCanvas from './pages/DesignCanvas';
// import Document from './pages/Document';
// import 'react-resizable/css/styles.css';
// import 'react-quill/dist/quill.snow.css'; 
// import LoginPage from './pages/Login';
// function App() {
//   const [selectedTab, setSelectedTab] = useState(0); // 用于控制当前页面
//   const nodeCount = 89;
//   const edgeCount = 120;
//   const branchCount = 42;

//   const renderPage = () => {
//     switch (selectedTab) {
//       case 0:
//         return <LoginPage/>;
//         return <DesignCanvas />;
//       case 1:
//         return <ModelStatistics node_cnt={nodeCount} edge_cnt={edgeCount} branch_cnt={branchCount} />;
//       case 2:
//         return <Document />;
//       default:
//         return <DesignCanvas />;
//     }
//   };
  

//   return (
//     <div style={{ display: 'flex' }}>
//       <div style={{ flex: 1}}>
//         {renderPage()}
//       </div>
//     </div>
//   );
// }

// export default App;

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
        {/* / 路径对应 LoginPage 组件 */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/chat" element={<FullScreenChat/>}/>
        {/* /design-canvas 路径对应主应用组件 */}
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* 新增的动态路由，用于编辑指定的画布 */}
        <Route path="/design-canvas/:canvasId" element={<DesignCanvas />} />

        {/* 可选：如果你需要其他页面，可以继续添加 */}
        {/* <Route path="/about" element={<AboutPage />} /> */}
      </Routes>

  );
}

export default App;
