// pages/DashBoard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateCanvasModal from '../components/CreateCanvasModal';
import {
  Button,
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Chip, 
  IconButton, 
  Fab
} from '@mui/material';
import {
  DescriptionOutlined as DescriptionIcon,
  SchoolOutlined as SchoolIcon,
  AccessTime as AccessTimeIcon,
  FormatListNumberedOutlined as LessonsIcon,
  AddOutlined as AddIcon,
} from '@mui/icons-material'; // icon
import CoMAPLogo from '../assets/comap.png';
import { fetchUserCanvases, createNewCanvas } from '../api/canva';
import styled from '@emotion/styled';
import { useAuth } from '../context/AuthContext';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

// ... (Theme and Header styled component remain the same)
const theme = createTheme({
    palette: {
        primary: {
            main: '#f48fb1',
            light: '#f8d0e2',
            dark: '#d26a97',
        },
        secondary: {
            main: '#90caf9',
            light: '#c7e6ff',
            dark: '#6a9bd6',
        },
        background: {
            default: '#f5f7fa',
            paper: '#ffffff',
        },
        text: {
            primary: '#333',
            secondary: '#666',
        },
    },
    typography: {
        fontFamily: "'Playfair Display', 'Roboto', sans-serif",
        h4: {
            fontWeight: 700,
            marginBottom: '24px',
        },
        h6: {
            fontWeight: 600,
        },
        body2: {
            fontSize: '0.875rem',
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    },
                    borderRadius: '12px',
                },
            },
        },
    },
});

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(4, 0),
  marginBottom: theme.spacing(4),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledLogo = styled('img')({
  height: '50px',
});


// 新增：根据学科名返回不同的颜色，让标签更美观
const getSubjectColor = (subject) => {
    switch (subject) {
        case '数学': return 'primary';
        case '语文': return 'error';
        case '英语': return 'secondary';
        case '物理': return 'warning';
        case '化学': return 'success';
        case '生物': return 'info';
        default: return 'default';
    }
};

const DashboardPage = () => {
    const [canvases, setCanvases] = useState([]);
    const { isLoggedIn, logout } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/');
        } else {
            const loadCanvases = async () => {
                try {
                    const data = await fetchUserCanvases();
                    setCanvases(data);
                } catch (error) {
                    console.error("Failed to fetch canvases:", error);
                }
            };
            loadCanvases();
        }
    }, [isLoggedIn, navigate]);

    const handleCreateCanvas = async (canvasData) => {
        try {
            const newCanvasData = await createNewCanvas(canvasData);
            // 确保后端返回的ID字段名正确
            navigate(`/design-canvas/${newCanvasData.map_id}`);
        } catch (error) {
            console.error("Failed to create new canvas:", error);
        }
    };

    const handleOpenCanvas = (id) => {
        navigate(`/design-canvas/${id}`);
    };

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
                <Header>
                    <Box display="flex" alignItems="center">
                        {CoMAPLogo && <StyledLogo src={CoMAPLogo} alt="CoMAP Logo" />}
                        <Typography variant="h4" sx={{ ml: 2, color: theme.palette.text.primary }}>
                            我的教学地图
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenModal}
                        startIcon={<AddIcon />} // 新增：添加图标
                        sx={{
                            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                            color: 'white',
                            '&:hover': {
                                background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
                            },
                        }}
                    >
                        创建新画布
                    </Button>
                </Header>
                
                <Grid container spacing={4}>
                    {canvases.length > 0 ? (
                        canvases.map((canvas) => (
                            <Grid item xs={12} sm={6} md={4} key={canvas.id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardActionArea onClick={() => handleOpenCanvas(canvas.id)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                                        <CardContent sx={{ flexGrow: 1, p: 3, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <DescriptionIcon color="action" sx={{ mr: 1 }} />
                                                <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                                                    {canvas.name}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ mb: 1 }}>
                                                {/* 使用 Chip 组件创建带有颜色的标签 */}
                                                <Chip
                                                    icon={<SchoolIcon />}
                                                    label={canvas.subject}
                                                    color={getSubjectColor(canvas.subject)}
                                                    size="small"
                                                    sx={{ mr: 1 }}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <LessonsIcon color="action" sx={{ mr: 0.5, fontSize: '1.1rem' }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {canvas.lesson_count} 节
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <AccessTimeIcon color="action" sx={{ mr: 0.5, fontSize: '1.1rem' }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {canvas.lesson_duration} 分钟/节
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #f0f0f0' }}>
                                                <Typography variant="caption" color="text.disabled">
                                                    更新时间: {new Date(canvas.updated_at).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 8 }}>
                                您还没有创建任何画布。
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Container>
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                }}
            >
                <Fab
                    size="small"
                    color="default"
                    sx={{
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        '&:hover': {
                            backgroundColor: theme.palette.grey[100],
                        },
                    }}
                    onClick={() => navigate('/chat')}
                >
                    <ChatBubbleOutlineIcon />
                </Fab>
            </Box>
            <CreateCanvasModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onCreate={handleCreateCanvas}
            />
        </ThemeProvider>
    );
};

export default DashboardPage;