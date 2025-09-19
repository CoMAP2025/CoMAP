import React, { useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Collapse,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import styled from '@emotion/styled';
import {
    TAG_OPTIONS,
    PRESET_LEARNER_FEATURES,
    PRESET_STRATEGIES,
    PRESET_ACTIVITIES,
    PRESET_GOALS,
    PRESET_RESOURCES,
    PRESET_EVALUATIONS
} from './constants';

const SidebarWrapper = styled(Box)(({ theme }) => ({
    width: 300,
    height: '85vh',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    overflowY: 'auto'
}));

const TAG_TO_PRESETS = {
    学习者: PRESET_LEARNER_FEATURES,
    目标: PRESET_GOALS.flatMap(cat => cat.items),
    策略: PRESET_STRATEGIES.flatMap(cat => cat.items),
    活动: PRESET_ACTIVITIES,
    资源: PRESET_RESOURCES.flatMap(cat => cat.items),
    评价: PRESET_EVALUATIONS.flatMap(cat => cat.items),
};

const AddNodeSidebar = ({ getViewportCenter, onAddNode, theme }) => {
    const [openCategories, setOpenCategories] = useState({});

    const handleMouseEnter = (value) => {
        setOpenCategories(prev => ({
            ...prev,
            [value]: true
        }));
    };

    const handleMouseLeave = (value) => {
        setOpenCategories(prev => ({
            ...prev,
            [value]: false
        }));
    };

    const toggleCategory = (value) => {
        setOpenCategories(prev => ({
            ...prev,
            [value]: !prev[value]
        }));
    };

    const handleAddPresetNode = useCallback((tagOption, preset) => {
        const position = getViewportCenter();
        const newNode = {
            type: 'infoNode',
            position,
            data: {
                tag: tagOption.value,
                title: preset.title || `新建${tagOption.label}卡片`,
                description: preset.description || "单击以编辑和查看详情",
                sources: ["教师"],
                icon: tagOption.icon,
                color: tagOption.color,
            },
        };
        onAddNode(newNode);
    }, [getViewportCenter, onAddNode]);

    return (
        <SidebarWrapper>
            <Typography
                variant="h6"
                sx={{
                    mb: 1,
                    color: theme.palette.primary.dark,
                    fontWeight: 'bold'
                }}
            >
                点击下方添加卡片
            </Typography>

            <List disablePadding>
                {TAG_OPTIONS.map(tagOption => {
                    const Icon = tagOption.icon;
                    return (
                        <Box
                            key={tagOption.value}
                            onMouseEnter={() => handleMouseEnter(tagOption.value)}
                            onMouseLeave={() => handleMouseLeave(tagOption.value)}
                        >
                            <ListItemButton onClick={() => toggleCategory(tagOption.value)}>
                                <ListItemIcon>
                                    <Icon sx={{ color: tagOption.color }} />
                                </ListItemIcon>
                                <ListItemText primary={tagOption.label} />
                                {openCategories[tagOption.value] ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>

                            <Collapse in={openCategories[tagOption.value]} timeout="auto" unmountOnExit>
                                <Grid container spacing={2} sx={{ pl: 2, pr: 2, pb: 1 }}>
                                    {TAG_TO_PRESETS[tagOption.value]?.map((preset, idx) => (
                                        <Grid item xs={12} sm={6} key={idx}>
                                            <Card
                                                variant="outlined"
                                                sx={{
                                                    borderLeft: `4px solid ${tagOption.color}`,
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                                                    height: '100%'
                                                }}
                                            >
                                                <CardActionArea onClick={() => handleAddPresetNode(tagOption, preset)}>
                                                    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                        <Typography
                                                            variant="subtitle1"
                                                            sx={{ fontWeight: 'bold', color: tagOption.color, mb: 0.5 }}
                                                        >
                                                            {preset.title}
                                                        </Typography>
                                                        {/* 核心改动在这里 */}
                                                        <Box
                                                            sx={{
                                                                typography: 'body2',
                                                                color: 'text.secondary',
                                                                '& h1, & h2, & h3, & h4, & h5, & h6': {
                                                                    fontSize: 'inherit',
                                                                    margin: 0
                                                                },
                                                                '& p': { margin: 0 },
                                                                '& ul, & ol': { paddingLeft: 2 }
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: preset.description }}
                                                        />
                                                    </CardContent>
                                                </CardActionArea>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Collapse>

                            <Divider sx={{ my: 1 }} />
                        </Box>
                    );
                })}
            </List>
        </SidebarWrapper>
    );
};

export default AddNodeSidebar;