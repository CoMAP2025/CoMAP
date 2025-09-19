import React, {
  useEffect,
  useRef,
  useState,
} from "react"
import {
  TextField,
  IconButton,
  Box,
  Typography,
  Divider,
  Paper,
  CircularProgress,
} from "@mui/material"

import SendIcon from "@mui/icons-material/Send"
import CloseIcon from "@mui/icons-material/Close"
import ReactMarkdown from "react-markdown"

// API 
import { chatReply } from "../api/chat"
import { createSession } from "../api/session"

// FullScreenChat 
const FullScreenChatPage = () => {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const messagesEndRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState(null)

  const welcomeMessage = {
    id: "welcome-1",
    role: "ai",
    content: "👋 您好！有什么可以帮助您的呢？",
    timestamp: Date.now(),
  };

  // loading and add welcome message
  useEffect(() => {
    const createAndLoadSession = async () => {
      setLoading(true);
      setMessages([welcomeMessage]);
      try {
        // createSession api
        const res = await createSession({ user_id: "testuser" });
        setCurrentSessionId(res.session_id);
      } catch (error) {
        console.error("创建会话失败:", error);
        setMessages(prev => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "ai",
            content: "抱歉，无法创建会话。请检查网络或稍后重试。",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    createAndLoadSession();
  }, []); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleSend = async (messageContent = input.trim()) => {
    if (!messageContent || loading || !currentSessionId) return;

    setLoading(true)
    const now = Date.now()
    const userMsg = {
      id: `user-${now}`,
      role: "user",
      content: messageContent,
      timestamp: now,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")

    try {
      const response = await chatReply({
        session_id: currentSessionId,
        question: messageContent,
      })
      const aiContent = response.reply || "我暂时无法回答您的问题。"
      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: aiContent,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (error) {
      console.error("发送消息失败:", error)
      const errorMsg = {
        id: `error-${Date.now()}`,
        role: "ai",
        content: "请求失败，请稍后重试。",
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  // CSS for Typing Dots Animation
  const typingAnimationStyles = `
    @keyframes blink {
      0% { opacity: 0.2; }
      20% { opacity: 1; }
      100% { opacity: 0.2; }
    }
    .typing-dot {
      animation: blink 1.4s infinite linear;
      background-color: #999;
      border-radius: 50%;
      width: 8px;
      height: 8px;
      margin: 0 2px;
      display: inline-block;
    }
    .typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }
    .typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }
  `;

  return (
    <>
      <style>{typingAnimationStyles}</style>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: "flex",
          flexDirection: "column",
          borderRadius: 0,
          zIndex: 1300,
          boxShadow: 'none',
        }}
      >
        <Box
          sx={{
            backgroundColor: "#aaa",
            color: "#fff",
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>AI助手对话</Typography>          <IconButton
            size="large"
            sx={{ color: "#fff" }}
            title="关闭"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            backgroundColor: '#f8f9fa',
          }}
        >
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                textAlign: msg.role === "user" ? "right" : "left",
              }}
            >
              <Box
                sx={{
                  backgroundColor: msg.role === "user" ? "#e3f2fd" : "#ffffff",
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                  display: 'inline-block',
                  maxWidth: "75%",
                  wordBreak: 'break-word',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  textAlign: "left",
                }}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </Box>
            </Box>
          ))}

          {loading && (
            <Box
              sx={{
                backgroundColor: "#ffffff",
                borderRadius: 2,
                minHeight: 40,
                px: 2,
                py: 1.5,
                maxWidth: "60%",
                display: "flex",
                alignItems: 'center',
                gap: 1,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <Box display="flex" alignItems="center">
                <span className="typing-dot" />
                <span className="typing-dot" style={{ animationDelay: '0.2s' }} />
                <span className="typing-dot" style={{ animationDelay: '0.4s' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" ml={1}>
                {currentSessionId ? "AI助手正在思考" : "正在创建会话..."}
              </Typography>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        <Divider sx={{ borderColor: 'rgba(0,0,0,0.1)' }}/>

        <Box display="flex" gap={1} p={2} sx={{ backgroundColor: '#f8f9fa' }}>
          <TextField
            variant="outlined"
            fullWidth
            placeholder={loading ? "请稍等..." : "输入你的问题..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading || !currentSessionId}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: '#ffffff',
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={() => handleSend()}
            disabled={loading || !currentSessionId}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </>
  )
}

export default FullScreenChatPage;