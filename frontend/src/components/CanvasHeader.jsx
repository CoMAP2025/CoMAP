import React from 'react';
import { 
    Box, Button, IconButton, Chip, CircularProgress, Typography, Dialog, DialogTitle, DialogContent, TextField,
    FormControl, FormGroup, FormLabel, Checkbox, FormControlLabel,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EditIcon from "@mui/icons-material/Edit";
import CoMAPLogo from '../assets/comap.png';
import styled from '@emotion/styled';
const HeaderWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2, 4),
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    gap: theme.spacing(2),
}));

const ProgressContainer = styled('div')({
    position: 'relative',
    height: '40px',
    width: '200px',
    backgroundColor: '#e0e0e0',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
});

const ProgressBar = styled('div')(({ progress }) => ({
    height: '100%',
    width: `${progress}%`,
    backgroundColor: '#4caf50',
    transition: 'width 0.3s ease-in-out',
    position: 'absolute',
}));

const ProgressText = styled(Typography)({
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
    zIndex: 1,
});

const PulseChip = styled(Chip)({
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)', opacity: 1 },
    '50%': { transform: 'scale(1.05)', opacity: 0.8 },
    '100%': { transform: 'scale(1)', opacity: 1 },
  },
  animation: 'pulse 1.5s infinite',
});

const subjects = [
    '数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '信息技术', '艺术', '体育', '通用技术', '其他'
];
const CanvasHeader = ({
    canvasInfo,
    isSaving,
    isDownloading,
    progress,
    onOpenChat,
    onDownload,
    onExport,
    onOpenCanvasInfoModal,
    onUpdateCanvasInfo,
    onCloseCanvasInfoModal,
    isCanvasInfoModalOpen,
    editCanvasData,
    setEditCanvasData
}) => {
    const saveMessage = isSaving === 'manual' ? '手动保存中...' : '自动保存中...';
    // 处理多选框变化的函数
    const handleSubjectChange = (event) => {
        const { value, checked } = event.target;
        // 获取当前选中的学科数组
        const currentSubjects = Array.isArray(editCanvasData.subject) ? editCanvasData.subject : [];

        if (checked) {
            setEditCanvasData({ ...editCanvasData, subject: [...currentSubjects, value] });
        } else {
            setEditCanvasData({ ...editCanvasData, subject: currentSubjects.filter((subject) => subject !== value) });
        }
    };

    // 重写 onOpenCanvasInfoModal，确保将 subject 字符串转为数组
    const handleOpenModal = () => {
        // 如果 subject 是一个字符串，就把它拆分成数组
        const initialSubjects = canvasInfo.subject ? canvasInfo.subject.split(',') : [];
        setEditCanvasData({ ...canvasInfo, subject: initialSubjects });
        onOpenCanvasInfoModal();
    };

    // 重写 onUpdateCanvasInfo，确保将 subject 数组转为字符串
    const handleUpdateInfo = () => {
        // 将 subjects 数组重新拼接为字符串
        const updatedData = {
            ...editCanvasData,
            subject: Array.isArray(editCanvasData.subject) ? editCanvasData.subject.join(',') : editCanvasData.subject,
        };
        onUpdateCanvasInfo(updatedData);
    };
    return (
        <HeaderWrapper>
            <Box display="flex" alignItems="center" gap={2}>
                {CoMAPLogo && <img src={CoMAPLogo} alt="CoMAP Logo" style={{ height: '40px' }} />}
                {canvasInfo ? (
                    <Chip
                        label={canvasInfo.name}
                        variant="outlined"
                        sx={{ fontSize: '1rem', fontWeight: 'bold', padding:'10px 5px' }}
                    />
                ) : (
                    <Chip label="加载中..." />
                )}
                {canvasInfo && (
                    <IconButton
                        color="primary"
                        onClick={handleOpenModal}
                        size="small"
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
                {isSaving && (
                    <PulseChip
                        label={saveMessage} // 根据isSaving类型显示不同消息
                        size="small"
                        icon={<CircularProgress size={16} sx={{ color: 'text.secondary' }} />}
                    />
                )}
                {isDownloading ? (
                    <ProgressContainer>
                        <ProgressBar progress={progress} />
                        <ProgressText variant="body2">{`生成中... ${progress}%`}</ProgressText>
                    </ProgressContainer>
                ) : (
                    <Button
                        onClick={onDownload}
                        variant="outlined"
                        startIcon={<DescriptionOutlinedIcon />}
                    >
                        导出为 Word 教案
                    </Button>
                    
                )}
                {/* <Button
                    onClick={onExport}
                    variant="outlined"
                    startIcon={<DescriptionOutlinedIcon />}
                >
                    导出为卡片
                </Button> */}
                {/* <Button onClick={onOpenChat} startIcon={<SmartToyIcon />} variant="outlined">
                    对话辅助
                </Button> */}
            </Box>

            <Dialog open={isCanvasInfoModalOpen} onClose={onCloseCanvasInfoModal}>
                <DialogTitle>编辑画布信息</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        label="教学设计名称"
                        fullWidth
                        margin="normal"
                        value={editCanvasData.name || ''}
                        onChange={(e) => setEditCanvasData({ ...editCanvasData, name: e.target.value })}
                    />
                    <TextField
                        label="总课时"
                        fullWidth
                        margin="normal"
                        type="number"
                        value={editCanvasData.lesson_count || ''}
                        onChange={(e) => setEditCanvasData({ ...editCanvasData, lesson_count: e.target.value })}
                    />
                    <TextField
                        label="每节时长(分钟)"
                        fullWidth
                        margin="normal"
                        type="number"
                        value={editCanvasData.lesson_duration || ''}
                        onChange={(e) => setEditCanvasData({ ...editCanvasData, lesson_duration: e.target.value })}
                    />
                    <FormControl component="fieldset" fullWidth margin="normal">
                        <FormLabel component="legend">学科</FormLabel>
                        <FormGroup row sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                            {subjects.map((s) => (
                                <FormControlLabel
                                    key={s}
                                    control={
                                        <Checkbox
                                            checked={editCanvasData.subject ? editCanvasData.subject.includes(s) : false}
                                            onChange={handleSubjectChange}
                                            value={s}
                                            size="small"
                                        />
                                    }
                                    label={s}
                                />
                            ))}
                        </FormGroup>
                    </FormControl>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={onCloseCanvasInfoModal} variant="outlined">取消</Button>
                        <Button onClick={handleUpdateInfo} variant="contained" color="primary">保存</Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </HeaderWrapper>
    );
};

export default CanvasHeader;