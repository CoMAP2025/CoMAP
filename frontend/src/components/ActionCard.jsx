import React, { useState } from "react"; // 引入 useState
import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"; // 接受按钮图标
import AddIcon from "@mui/icons-material/Add"; // 新增图标
import EditIcon from "@mui/icons-material/Edit"; // 修改图标

// 导入类别相关的图标
import SchoolIcon from "@mui/icons-material/School"; // Learner
import LightbulbIcon from "@mui/icons-material/Lightbulb"; // Strategy
import SportsEsportsIcon from "@mui/icons-material/SportsEsports"; // Activity (示例，根据你的实际含义选择)
import FlagIcon from "@mui/icons-material/Flag"; // Goal
import DescriptionIcon from "@mui/icons-material/Description"; // Resource
import StarIcon from "@mui/icons-material/Star"; // Rating

// 导入 CSS 文件
import "./ActionCard.css"; // 确保路径正确

// 类别到图标的映射
const typeIcons = {
  learner: SchoolIcon,
  strategy: LightbulbIcon,
  activity: SportsEsportsIcon,
  goal: FlagIcon,
  resource: DescriptionIcon,
  rating: StarIcon,
  // 可以添加更多类型
};

// 类别到颜色的映射（对应 CSS 中的类名）
const typeColorClasses = {
  learner: "tag-color-learner",
  strategy: "tag-color-strategy",
  activity: "tag-color-activity",
  goal: "tag-color-goal",
  resource: "tag-color-resource",
  rating: "tag-color-rating",
};

const ActionCard = ({ action, onAccept }) => {
  const [isAccepted, setIsAccepted] = useState(false); // 新增状态来跟踪是否已接受

  const handleAcceptClick = () => {
    setIsAccepted(true); // 标记为已接受
    onAccept?.(action); // 执行外部传入的接受操作
  };

  // 根据 action.type 获取对应的图标组件
  const TypeIcon = typeIcons[action.type.toLowerCase()];
  // 根据 action.type 获取对应的颜色类名
  const typeColorClass = typeColorClasses[action.type.toLowerCase()];

  return (
    <Card
      className="action-card-glass" // 应用液态玻璃基础样式
      sx={{
        my: 1, // 保持外部间距
      }}
    >
      {/* 接受按钮定位在右上角 */}
      <Button
        onClick={handleAcceptClick}
        size="small"
        variant="contained"
        color="success" // 使用 success 颜色，MUI 默认是绿色
        startIcon={<CheckCircleOutlineIcon sx={{ fontSize: '0.9rem' }} />} // 接受图标
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          borderRadius: "8px",
          boxShadow: "none",
          minWidth: "auto",
          px: 1.5,
          py: 0.5,
          fontSize: "0.75rem",
          fontWeight: 'bold', // 字体加粗
          // 悬停时阴影
          "&:hover": {
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            backgroundColor: 'success.dark', // 悬停颜色
          },
          // 点击后的样式变化
          ...(isAccepted && {
            backgroundColor: "#4CAF50", // 绿色，可以更深一点
            color: "#fff",
            border: "1px solid #388E3C",
            boxShadow: "inset 0 2px 5px rgba(0,0,0,0.2)", // 内阴影
            opacity: 0.9,
          }),
        }}
      >
        接受
      </Button>

      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Typography
          variant="overline"
          sx={{
            display: "flex", // 允许图标和文字对齐
            alignItems: "center",
            mb: 0.5,
            fontWeight: "bold",
            // 动态应用类别颜色
            color: typeColorClass ? undefined : "text.secondary", // 如果有自定义颜色，就不使用 text.secondary
          }}
          className={typeColorClass} // 应用类别颜色类名
        >
          {/* 新增/修改 图标 */}
          {action.option === "add" ? (
            <AddIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
          ) : (
            <EditIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
          )}
          {/* 类别图标 */}
          {TypeIcon && <TypeIcon sx={{ fontSize: "1rem", mr: 0.5 }} />}
          {/* 类别文字 */}
          {action.option === "add" ? "新增" : "修改"}：{action.type}
        </Typography>

        <Typography variant="h6" component="div" sx={{ mb: 1, color: "primary.dark" }}>
          {action.title}
        </Typography>
        <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-line", mb: 1.5 }}>
          {action.description}
        </Typography>
        {action.card_id && (
          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8 }}>
            修改目标卡片 ID：{action.card_id}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ActionCard;