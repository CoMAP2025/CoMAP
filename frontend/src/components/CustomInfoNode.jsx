import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import InfoCard from './InfoCard';

// 通用 Handle 样式
const baseHandleStyle = {
  width: '16px',
  height: '16px',
  background: 'rgba(0, 0, 0, 0.3)',
  // borderRadius: '50%',
  // border: '1px solid white',
  zIndex: 10,
  pointerEvents: 'auto',
  opacity: 0,
  transition: 'all 0.2s ease',
};

// Hover 时额外样式
const hoverHandleStyle = {
  opacity: 1,
};

const CustomInfoNode = ({ data }) => {
  const [hovered, setHovered] = useState(false);

  const getStyle = (base, extra) => hovered ? { ...base, ...extra } : base;

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={data.onOpen}
    >
      {/* 单个双向 Handle，每边一个 */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        style={getStyle({
          ...baseHandleStyle,
          top: -8,
          left: '50%',
          transform: 'translateX(-50%)',
        }, hoverHandleStyle)}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={getStyle({
          ...baseHandleStyle,
          right: -8,
          top: '50%',
          transform: 'translateY(-50%)',
        }, hoverHandleStyle)}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={getStyle({
          ...baseHandleStyle,
          bottom: -8,
          left: '50%',
          transform: 'translateX(-50%)',
        }, hoverHandleStyle)}
      />

      <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={getStyle({
          ...baseHandleStyle,
          left: -8,
          top: '50%',
          transform: 'translateY(-50%)',
        }, hoverHandleStyle)}
      />

      {/* 渲染卡片内容 */}
      <InfoCard {...data} />
    </div>
  );
};

export default CustomInfoNode;
