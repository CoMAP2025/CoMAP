import React, { useState, useRef, useEffect } from "react";
import "./InfoCard.css";

// 导入你需要的 Material-UI 图标
import SchoolIcon from '@mui/icons-material/School';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SportsHandballIcon from '@mui/icons-material/SportsHandball';
import TourIcon from '@mui/icons-material/Tour';
import CategoryIcon from '@mui/icons-material/Category';
import GradeIcon from '@mui/icons-material/Grade';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PsychologyAltOutlinedIcon from '@mui/icons-material/PsychologyAltOutlined';

// 新增的图标
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import Tooltip from '@mui/material/Tooltip';

import { useDisplayMode } from '../context/DisplayContext';

const TAG_OPTIONS = [
    { label: "学习者", value: "学习者", icon: SchoolIcon, color: "#4CAF50" },
    { label: "策略", value: "策略", icon: LightbulbIcon, color: "#FFC107" },
    { label: "活动", value: "活动", icon: SportsHandballIcon, color: "#2196F3" },
    { label: "目标", value: "目标", icon: TourIcon, color: "#9C27B0" },
    { label: "资源", value: "资源", icon: CategoryIcon, color: "#FF5722" },
    { label: "评价", value: "评价", icon: GradeIcon, color: "#795548" },
];

const TAG_ICONS_MAP = TAG_OPTIONS.reduce((acc, option) => {
    acc[option.label] = option.icon;
    return acc;
}, {});

const TAG_CLASSES = {
    学习者: "tag learner",
    策略: "tag strategy",
    活动: "tag activity",
    目标: "tag goal",
    资源: "tag resource",
    评价: "tag rating",
};

const InfoCard = ({
    id,
    tag,
    title,
    description,
    sources = [],
    onOpen,
    onAddRelated,
    onAddAnalogy,
    onEdit,
    onDelete,
    onSplit,
    onRefine,
}) => {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const infoCardRef = useRef(null);
    const menuRef = useRef(null);
    const { showDetails } = useDisplayMode();

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuVisible(true);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuVisible && menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuVisible]);

    const IconComponent = TAG_ICONS_MAP[tag];

    return (
        <div
            ref={infoCardRef}
            className={`info-card ${showDetails ? 'detailed-mode' : ''} ${TAG_CLASSES[tag]}`}
            onClick={onOpen}
            onContextMenu={handleContextMenu}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ position: "relative", userSelect: "none" }}
        >
            <div className={`tag-absolute ${TAG_CLASSES[tag] || "tag"}`}>
                {IconComponent && <IconComponent className="title-icon" fontSize="small" />} {tag}
            </div>
            <h2 className="info-title">{title}</h2>

            {showDetails && (
                <div 
                    className="info-description"
                    dangerouslySetInnerHTML={{ __html: description }}
                />
            )}

            {!showDetails && isHovered && (
                <button 
                    className="view-details-button" 
                    onClick={onOpen}
                >
                    <span>查看详情</span>
                </button>
            )}

            <div className="source-container">
                {sources.includes("教师") && (
                    <Tooltip title="来自教师" arrow>
                        <SchoolOutlinedIcon className="source-icon teacher" fontSize="small" />
                    </Tooltip>
                )}
                {sources.includes("AI") && (
                    <Tooltip title="来自AI" arrow>
                        <PsychologyAltOutlinedIcon className="source-icon ai" fontSize="small" />
                    </Tooltip>
                )}
            </div>

            {isMenuVisible && (
                <div 
                    ref={menuRef}
                    className="context-menu-container"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button className="menu-button edit" onClick={onEdit}>
                        <EditIcon />
                        <span>编辑</span>
                    </button>
                    <button className="menu-button delete" onClick={onDelete}>
                        <DeleteIcon />
                        <span>删除</span>
                    </button>
                    <button className="menu-button split" onClick={onSplit}>
                        <CallSplitIcon />
                        <span>拆分</span>
                    </button>
                    <button className="menu-button refine" onClick={onRefine}>
                        <AutoAwesomeIcon />
                        <span>改善</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default InfoCard;