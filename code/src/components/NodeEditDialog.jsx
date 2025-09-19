// components/NodeEditDialog.jsx

// ... (导入部分保持不变)

import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent,
    TextField, RadioGroup,
    FormControlLabel, Radio,
    Box, Button, IconButton, Typography,
    CircularProgress,
    Paper,
    Snackbar, Alert,
    DialogActions,
    Grid,
    Divider,Tooltip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SyncIcon from '@mui/icons-material/Sync';
import SplitIcon from '@mui/icons-material/HorizontalSplit';
import PsychologyIcon from '@mui/icons-material/Psychology';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import {
    TAG_OPTIONS
} from './constants';

const NodeEditDialog = ({
    open,
    editData,
    setEditData,
    onClose,
    onDelete,
    onAIAction,
    isAiLoading
}) => {
    // ... (状态和函数保持不变)
    const [aiPrompt, setAiPrompt] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const dialogContentRef = useRef(null);

    const currentTag = TAG_OPTIONS.find(tag => tag.value === editData.tag);
    const tagColor = currentTag ? currentTag.color : '#666';
    const tagLabel = currentTag ? currentTag.label : '未知';


    // 核心修改1: 定义一个默认的 AI Prompt
    const getAiDefaultPrompt = (action) => {
        const { tag, title, description } = editData;
        const base = `卡片标签: ${tag}。标题: ${title}。描述: ${description}。`;
        switch (action) {
            case 'refine':
                return `${base} 请根据卡片内容，将描述部分进行细化和扩充。`;
            case 'correct':
                return `${base} 请检查卡片内容是否存在语法、错别字或逻辑错误，并进行纠正。`;
            case 'split':
                return `${base} 请将卡片内容分解成更小的、更具体的信息点，以方便教学设计。`;
            case 'sync':
                return `${base} 请调整卡片内容以保持和相连节点的一致性`;
            case 'influence':
                return `${base} 请从调整相邻节点以保持和当前节点一致`;
            default:
                return "";
        }
    };

    // 核心修改2: handleAiActionClick 函数
    const handleAiActionClick = (action) => {
        // 如果 aiPrompt 为空，则使用默认的 Prompt
        const promptToSend = aiPrompt || getAiDefaultPrompt(action);
        
        // 确保 promptToSend 不为空
        if (!promptToSend) return;

        onAIAction(action, promptToSend)
            .then(() => {
                setAiPrompt("");
            })
            .catch(err => console.error("AI action failed:", err));
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    useEffect(() => {
        if (open) {
            setAiPrompt("");
        }
    }, [open]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5,
                backgroundColor: tagColor,
                color: '#fff',
                '& .MuiIconButton-root': { color: '#fff' }
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {currentTag?.icon && <currentTag.icon sx={{ mr: 1 }} />}
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        编辑卡片: {tagLabel}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ pt: '10px !important', position: 'relative' }} ref={dialogContentRef}>
                <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                    <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Paper sx={{ p: 3, backgroundColor: '#f9f9f9' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>编辑内容</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <TextField
                                label="标题"
                                fullWidth
                                margin="normal"
                                value={editData.title || ""}
                                onChange={e => setEditData(prevEditData => ({ ...prevEditData, title: e.target.value }))}
                                sx={{ mb: 2 }}
                            />
                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>详情描述</Typography>
                            <ReactQuill
                                theme="snow"
                                value={editData.description || ""}
                                onChange={value => setEditData(prevEditData => ({ ...prevEditData, description: value }))}
                                style={{ marginBottom: '20px', height: '200px' }}
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, false] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                        [{ 'indent': '-1' }, { 'indent': '+1' }],
                                        ['link', 'image'],
                                        ['clean']
                                    ],
                                }}
                                formats={[
                                    'header', 'bold', 'italic', 'underline', 'strike',
                                    'list', 'bullet', 'indent', 'link', 'image'
                                ]}
                            />
                            <Typography variant="subtitle2" sx={{ mt: 6, mb: 1, color: 'text.secondary' }}>卡片标签</Typography>
                            <RadioGroup row value={editData.tag || ""} onChange={e => setEditData(prevEditData => ({ ...prevEditData, tag: e.target.value }))}>
                                {TAG_OPTIONS.map(o => (
                                    <FormControlLabel
                                        key={o.value}
                                        value={o.value}
                                        control={<Radio size="small" sx={{ color: o.color, '&.Mui-checked': { color: o.color } }} />}
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', color: o.color }}>
                                                {o.icon && <o.icon fontSize="small" sx={{ mr: 0.5 }} />}
                                                {o.label}
                                            </Box>
                                        }
                                    />
                                ))}
                            </RadioGroup>
                        </Paper>

                        <Paper sx={{ p: 3, backgroundColor: '#f0f4ff' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1a237e' }}>智能辅助</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <TextField
                                label="对当前内容不满意？给AI一点优化方向的提示让它帮忙改进吧，也可以直接点击下方按钮生成修改建议"
                                fullWidth
                                multiline
                                rows={1}
                                value={aiPrompt}
                                onChange={e => setAiPrompt(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                <Tooltip title="对卡片进行内容的丰富和补充。">
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleAiActionClick('refine')}
                                        startIcon={<AutoFixHighIcon />}
                                        disabled={isAiLoading} // 仅在加载时禁用
                                    >
                                        补充
                                    </Button>
                                </Tooltip>
                                <Tooltip title="将当前卡片的内容分解成多个独立的、更小的卡片">
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleAiActionClick('split')}
                                        startIcon={<SplitIcon />}
                                        disabled={isAiLoading}
                                    >
                                        分裂
                                    </Button>
                                </Tooltip>
                                {/* <Tooltip title="分析相邻卡片的内容，并调整当前卡片，使其与相邻节点在主题或逻辑上更加连贯。">
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleAiActionClick('sync')}
                                        startIcon={<SyncIcon />}
                                        disabled={isAiLoading}
                                    >
                                        同步
                                    </Button>
                                </Tooltip>
                                <Tooltip title="根据此卡片内容修改其相连节点的内容">
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleAiActionClick('influence')}
                                        startIcon={<PsychologyIcon />}
                                        disabled={isAiLoading}
                                    >
                                        影响
                                    </Button>
                                </Tooltip> */}
                            </Box>
                        </Paper>
                    </Box>
                </Box>
                {/* ... (其他部分保持不变) */}

                {isAiLoading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 10,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
                <Button
                    color="error"
                    onClick={onDelete}
                    startIcon={<DeleteIcon />}
                    sx={{ mr: 'auto' }}
                >
                    删除卡片
                </Button>
                <Button variant="contained" onClick={onClose} color="inherit">
                    关闭
                </Button>
            </DialogActions>

            <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    已成功应用预设！
                </Alert>
            </Snackbar>
        </Dialog>
    );
};

export default NodeEditDialog;