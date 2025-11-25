import React, { createContext, useState, useContext } from 'react';

// 创建 Context
const DisplayContext = createContext();

// Context Provider 组件
export const DisplayProvider = ({ children }) => {
    // 初始状态为 false，即不显示详情
    const [showDetails, setShowDetails] = useState(true);

    // 提供给外部组件访问的 value
    const value = {
        showDetails,
        toggleDetails: () => {
            setShowDetails(prev => !prev);
        },
    };

    return (
        <DisplayContext.Provider value={value}>
            {children}
        </DisplayContext.Provider>
    );
};

// 自定义 Hook，方便组件使用
export const useDisplayMode = () => {
    return useContext(DisplayContext);
};