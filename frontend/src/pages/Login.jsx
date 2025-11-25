//pages/Login.jsx
import React, { useState,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// import { login } from '../api/login';
import { useAuth } from '../context/AuthContext'; 
import {
  Button,
  TextField,
  Box,
  Typography,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CoMAPLogo from '../assets/comap.png';
import BackgroundImage from '../assets/bg.png'; 
import styled from '@emotion/styled';

// 全屏容器，负责背景图片和半透明遮罩
const FullPageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  position: 'relative',
  backgroundImage: `url(${BackgroundImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  
  // 半透明白色遮罩层
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1,
  },
}));

// 内容包装器，用于左右两栏布局，位于遮罩层之上
const ContentWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  maxWidth: 1200, // 限制内容最大宽度
  minHeight: '80vh',
  boxShadow: theme.shadows[8],
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  position: 'relative',
  lineHeight: 1.5,
  zIndex: 2,
}));

// 左侧介绍面板
const IntroPanel = styled(Box)(({ theme }) => ({
  flex: 1.2, // 占据更多空间
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(6),
  color: '#888',
  lineHeight: 1.5,
  // 略带透明的深色渐变背景，让背景图隐约可见
  background: `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.6) 100%)`,
  textAlign: 'center',
}));

// 右侧登录表单面板
const FormPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(6),
  lineHeight: 1.5,
  backgroundColor: 'rgba(255, 255, 255, 0.8)', // 纯白不透明
}));

const LogoImage = styled('img')({
  height: '150px',
  marginBottom: '24px',
});

const StyledTextField = styled(TextField)({
  marginTop: '16px',
});

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  color: 'white',
  padding: theme.spacing(1.5, 4),
  boxShadow: theme.shadows[2],
  '&:hover': {
    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
    boxShadow: theme.shadows[4],
  },
}));




const LoginPage = () => {
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

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
      text: {
        primary: '#333',
        secondary: '#666',
      },
    },
    typography: {
      fontFamily: "'Playfair Display', 'Roboto', sans-serif",
      h3: {
        fontWeight: 700,
        color: '#666',
        lineHeight: 1.5,
        letterSpacing: '2px',
        marginBottom: '16px',
      },
      h5: {
        fontWeight: 600,
        lineHeight: 1.5,
        marginBottom: '20px',
        fontSize: '1.8rem',
      },
      h6: {
        fontWeight: 500,
        marginBottom: '16px',
        lineHeight: 1.5,
        fontSize: '1.4rem',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 2,
        color: '#555',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&display=swap');
        `,
      },
    },
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showSnackbar("请输入您的邮箱！","warning");
      return;
    }
    try {
      await login(email);
      showSnackbar("登录成功！");
      navigate('/dashboard');
    } catch (error) {
      console.error("登录失败:", error);
      showSnackbar("登录失败，请重试。",error);
    }
  };

  //消息提示
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FullPageContainer>
        <ContentWrapper>
          <IntroPanel>
            <LogoImage src={CoMAPLogo} alt="CoMAP Logo" />
            <Typography variant="body1" sx={{ mt: 2 }}>
              CoMAP 不仅仅是一个工具，更是一个思维的画布。
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              我们帮助教育者将复杂的知识点分解、连接，形成直观的教学图谱。
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              在这里，每一次教学设计都是一次创造性的探索。
            </Typography>
            
          </IntroPanel>
          
          <FormPanel>
            <Typography component="h1" variant="h5" sx={{ color: theme.palette.text.primary, mb: 1 }}>
              立即登录
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              输入您的邮箱，开启教学新篇章。
            </Typography>
            <form onSubmit={handleLogin}>
              <StyledTextField
                required
                fullWidth
                id="email"
                label="邮箱地址"
                name="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
              />
              <StyledButton
                type="submit"
                fullWidth
                variant="contained"
              >
                登录 / 注册
              </StyledButton>
            </form>
          </FormPanel>
        </ContentWrapper>
      </FullPageContainer>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
            <Alert
            onClose={() => setSnackbar(s => ({ ...s, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
            >
            {snackbar.message}
            </Alert>
      </Snackbar>
    </ThemeProvider>
    
  );
};

export default LoginPage;