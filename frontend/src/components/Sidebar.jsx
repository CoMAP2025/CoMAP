import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import './Sidebar.css';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import ManageHistoryOutlinedIcon from '@mui/icons-material/ManageHistoryOutlined';

function Sidebar({ selectedTab, setSelectedTab }) {
  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Tabs
      value={selectedTab}
      indicatorColor="primary"
      textColor="primary"
      orientation="vertical"
      onChange={handleChange}
      aria-label="Sidebar Tabs"
      style={{ width: '200px', borderRight: '1px solid #ccc' ,position: 'fixed', top: '0', left: '0',zIndex: '1000',backgroundColor: '#fff'}}
    >
      <Tab icon={<AutoAwesomeOutlinedIcon />} label="教学设计画布" />
      <Tab icon={<BarChartOutlinedIcon />} label="模型统计" />
      <Tab icon={<ManageHistoryOutlinedIcon />} label="历史记录" />
    </Tabs>
  );
}

export default Sidebar;
