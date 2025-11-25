
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react"
import {
  Fab,
  TextField,
  IconButton,
  Box,
  Typography,
  Divider,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material"

import ActionCard from "./ActionCard"
import ChatIcon from "@mui/icons-material/Chat"
import SendIcon from "@mui/icons-material/Send"
import CloseIcon from "@mui/icons-material/Close"
import NewSessionIcon from "@mui/icons-material/Refresh"
import MinimizeIcon from "@mui/icons-material/Minimize";
import AddIcon from "@mui/icons-material/Add";
import { generateReply } from "../api/chat"
import { createSession } from "../api/session"
import Draggable from "react-draggable"
import { ResizableBox } from 'react-resizable';
import ReactMarkdown from "react-markdown"

// 引入 react-resizable 的默认样式，这对于正确渲染拖拽手柄是必要的
import 'react-resizable/css/styles.css';

function splitMarkdownWithJson(content) {
  const regex = /```json\s*([\s\S]*?)\s*```/g
  const parts = []
  let lastIndex = 0
  let match

  while ((match = regex.exec(content)) !== null) {
    // 文本块
    if (match.index > lastIndex) {
      parts.push({
        type: "markdown",
        content: content.slice(lastIndex, match.index),
      })
    }

    // JSON 块
    try {
      const json = JSON.parse(match[1])
      if (Array.isArray(json.actions)) {
        parts.push({
          type: "actions",
          actions: json.actions,
        })
      }
    } catch (e) {
      console.warn("JSON 解析失败，保留为 markdown,错误为" + e)
      parts.push({
        type: "markdown",
        content: match[0], // 保留原始代码块
      })
    }

    lastIndex = regex.lastIndex
  }

  // 最后的文本块
  if (lastIndex < content.length) {
    parts.push({
      type: "markdown",
      content: content.slice(lastIndex),
    })
  }

  return parts
}

const FloatingChat = forwardRef(
  (
    { open, onClose, showFab = true, onOpen, initialSessionId, cases, showSnackbar, canvasInfo, onActions },
    ref
  ) => {
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState([])
    const messagesEndRef = useRef(null)
    // 拖动 ref 应该只在最外层的可拖动组件上使用
    const dragRef = useRef(null)
    const [visible, setVisible] = useState(open)
    const [loading, setLoading] = useState(false)
    const [isCreatingSession, setIsCreatingSession] = useState(false)
    const [currentSessionId, setCurrentSessionId] = useState(initialSessionId)

    // New state for dialog size, loaded from localStorage
    const [dialogSize, setDialogSize] = useState(() => {
      const storedSize = localStorage.getItem('chatDialogSize');
      return storedSize ? JSON.parse(storedSize) : { width: 450, height: 650 }; // Default size
    });

    // New state for Fab position, loaded from localStorage
    const [fabPosition, setFabPosition] = useState(() => {
      const storedPos = localStorage.getItem('fabPosition');
      return storedPos ? JSON.parse(storedPos) : { x: 0, y: 0 };
    });

    const handleFabStop = (e, data) => {
      localStorage.setItem('fabPosition', JSON.stringify({ x: data.x, y: data.y }));
      setFabPosition({ x: data.x, y: data.y });
    };

    const handleResize = (event, { size }) => {
      setDialogSize(size);
      localStorage.setItem('chatDialogSize', JSON.stringify(size));
    };

    const welcomeMessages = [
      {
        id: "welcome-1",
        role: "ai",
        content: "👋 您好！我是您的智能助手，可以帮助你添加和修改卡片。",
        timestamp: Date.now(),
      },
    ]

    const initialOptions = [
      "我是一个初中物理教师，我想创建一门核污水为主题的跨学科课程",
      "我是一个高中思政老师，想设计一节培养学生批判性思维的课程",
      "我是一个初中物理老师，我想设计一门关于电路的实验课",
    ]

    const handleActionAccept = async (action) => {
      if (onActions) {
        await onActions([action])
      }
      showSnackbar(`✅ 已执行操作 ${action.option === "add" ? "增加" : "修改"}${action.type}：${action.title}`, 'success');
    }

    useEffect(() => {
      setVisible(open)
    }, [open])

    useEffect(() => {
      // 仅当聊天窗口打开，并且 canvasInfo 有效时才更新消息
      if (open && canvasInfo && canvasInfo.subject && canvasInfo.name) {
        const dynamicOption = `当前课程主题为“${canvasInfo.subject}”，课程名称为“${canvasInfo.name}”。请基于此，为我提供一些教学设计建议。`;
        const updatedOptions = [dynamicOption, ...initialOptions];

        // 创建一个新的消息数组
        const newMessages = [
          ...welcomeMessages
        ];

        setMessages(newMessages);
      } else if (open && !currentSessionId) {
        // 如果 open 是 true，但 canvasInfo 还没加载，或者会话没创建，就显示基本的欢迎消息
        setMessages([...welcomeMessages, {
          id: "options-msg",
          role: "system",
          content: "请选择一个快速开始选项，或者直接输入您的问题：",
          options: initialOptions,
          timestamp: Date.now() + 1,
        }]);
      }
    }, [open, canvasInfo]);

    // 这是一个用于处理创建会话的独立 useEffect
    useEffect(() => {
      const createAndLoadSession = async () => {
        if (open && !currentSessionId && !isCreatingSession) {
          setIsCreatingSession(true);
          setLoading(true);
          try {
            const res = await createSession({ user_id: "testuser" });
            setCurrentSessionId(res.session_id);
          } catch (error) {
            console.error("创建会话失败:", error);
            showSnackbar("无法开始新的聊天会话。", "error");
            setMessages([
              {
                id: `error-${Date.now()}`,
                role: "system",
                content: "抱歉，无法创建会话。请检查网络或稍后重试。",
                timestamp: Date.now(),
              },
            ]);
          } finally {
            setLoading(false);
            setIsCreatingSession(false);
          }
        }
      };
      createAndLoadSession();
    }, [open, currentSessionId, isCreatingSession]);

    useEffect(() => {
      if (currentSessionId) {
        const stored = sessionStorage.getItem(`chat-history-${currentSessionId}`);
        if (stored) {
          setMessages(JSON.parse(stored));
        } else {
          if (messages.length === 0 || messages[0].id !== welcomeMessages[0].id) {
            setMessages([...welcomeMessages, {
              id: "options-msg",
              role: "system",
              content: "请选择一个快速开始选项，或者直接输入您的问题：",
              timestamp: Date.now() + 1,
            }]);
          }
        }
      } else if (!open) {
        setMessages([]);
      }
    }, [currentSessionId, open]);

    useEffect(() => {
      if (currentSessionId && messages.length > 0) {
        sessionStorage.setItem(`chat-history-${currentSessionId}`, JSON.stringify(messages));
      }
    }, [messages, currentSessionId]);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, loading])

    const onReceiveActions = (actions) => {
      if (onActions && Array.isArray(actions)) {
        onActions(actions)
      }
    }

    const handleSend = async (messageContent = input.trim()) => {
      if (!messageContent) return

      if (!currentSessionId) {
        showSnackbar("会话尚未创建，请稍等。", "warning");
        return;
      }

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
        const response = await generateReply({
          session_id: currentSessionId,
          question: messageContent,
          map: cases,
        })
        const aiContent = response.reply || `这是你说的「${messageContent}」哦！`
        if (response.actions) {
          onReceiveActions(response.actions)
        }
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

    useImperativeHandle(ref, () => ({
      clearHistory: () => {
        setMessages([]);
        if (currentSessionId) {
          sessionStorage.removeItem(`chat-history-${currentSessionId}`);
        }
      },
      startNewConversation: async () => {
        setMessages([]);
        if (currentSessionId) {
          sessionStorage.removeItem(`chat-history-${currentSessionId}`);
        }
        setCurrentSessionId(null);
      },
      addMessage: (msg) =>
        setMessages((prev) => [
          ...prev,
          {
            id: `manual-${Date.now()}`,
            role: msg.role || "system",
            content: msg.content || "",
            timestamp: Date.now(),
          },
        ]),
    }))

    return (
      <>
        {showFab && (
          <Draggable
            position={fabPosition}
            onStop={handleFabStop}
            bounds="parent"
          >
            <Fab
              onClick={() => {
                setVisible(true)
                onOpen?.()
              }}
              sx={{
                position: "fixed",
                bottom: 32,
                right: 32,
              }}
              variant="extended"
            >
              <ChatIcon sx={{ mr: 1 }} />
              CoMAP AI
            </Fab>
          </Draggable>
        )}

        {visible && (
          <Draggable handle=".chat-header" nodeRef={dragRef}>
            <Box
              ref={dragRef} // 将 ref 绑定到这个 Box 上
              sx={{
                position: 'fixed',
                bottom: 100,
                right: 50,
                zIndex: 1300,
                // 修复：为外层 Box 设置宽度，以确保 ResizableBox 能正确计算尺寸
                width: dialogSize.width,
                height: dialogSize.height,
              }}
            >
              <ResizableBox
                width={dialogSize.width}
                height={dialogSize.height}
                minConstraints={[300, 400]}
                maxConstraints={[window.innerWidth * 0.9, window.innerHeight * 0.9]}
                resizeHandles={['se', 's', 'e']}
                onResizeStop={handleResize}
              >
                <Paper
                  elevation={8}
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                    // 使用 MUI 的 sx 属性实现半透明背景和毛玻璃效果
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(10px)',
                    // 移除 position: fixed
                  }}
                >
                  <Box
                    className="chat-header"
                    sx={{
                      backgroundColor: "#aaa",
                      color: "#fff",
                      p: 1.5,
                      cursor: "grab",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTopLeftRadius: 3,
                      borderTopRightRadius: 3,
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>CoMAP助手</Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={async () => {
                          if (ref.current && ref.current.startNewConversation) {
                            await ref.current.startNewConversation();
                          }
                        }}
                        sx={{ color: "#fff", mr: 0.5 }}
                        title="开始新会话"
                      >
                        <AddIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setVisible(false)
                          onClose?.()
                        }}
                        sx={{ color: "#fff" }}
                        title="最小化聊天"
                      >
                        <MinimizeIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      flexGrow: 1,
                      overflowY: "auto",
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                      // 修改背景为半透明
                      backgroundColor: 'rgba(248, 249, 250, 0.7)',
                    }}
                  >
                    {messages.map((msg) => {
                      if (msg.role === "system") {
                        return (
                          <Box key={msg.id} textAlign="center" my={1}>
                            <Typography variant="caption" color="text.secondary">
                              {msg.content}
                            </Typography>
                            <Divider sx={{ my: 0.5, borderColor: 'rgba(0,0,0,0.1)' }} />
                          </Box>
                        )
                      }

                      return (
                        <Box
                          key={msg.id}
                          sx={{
                            textAlign: "left",
                            // 修改气泡背景色为半透明
                            backgroundColor:
                              msg.role === "user"
                                ? "rgba(227, 242, 253, 0.9)"
                                : msg.role === "ai"
                                  ? "rgba(255, 255, 255, 0.9)"
                                  : "rgba(252, 228, 236, 0.9)",
                            borderRadius: 2,
                            px: 1.8,
                            py: 1.2,
                            alignSelf:
                              msg.role === "user" ? "flex-end" : "flex-start",
                            maxWidth: "85%",
                            wordBreak: 'break-word',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          }}
                        >
                          {msg.role === "ai" ? (
                            <>
                              <ReactMarkdown>{splitMarkdownWithJson(msg.content)[0]?.content || msg.content}</ReactMarkdown>
                              {splitMarkdownWithJson(msg.content).slice(1).map((block, i) => {
                                if (block.type === "actions") {
                                  return block.actions.map((action, j) => (
                                    <ActionCard
                                      key={`${i}-${j}`}
                                      action={action}
                                      onAccept={() => handleActionAccept(action)}
                                    />
                                  ));
                                }
                                return null;
                              })}
                            </>
                          ) : (
                            <Typography variant="body2">{msg.content}</Typography>
                          )}
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                      )
                    })}

                    {/* AI Loading Indicator */}
                    {loading && (
                      <Box
                        sx={{
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderRadius: 2,
                          minHeight: 40,
                          px: 1.5,
                          py: 1,
                          maxWidth: "60%",
                          alignSelf: "flex-start",
                          display: "flex",
                          alignItems: 'center',
                          gap: 1,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                      >
                        {isCreatingSession ? (
                          <CircularProgress size={20} color="primary" />
                        ) : (
                          <Box display="flex" alignItems="center">
                            <Box className="typing-dot" sx={{ animationDelay: '0s', bgcolor: '#999', width: 8, height: 8, borderRadius: '50%', mx: 0.25 }} />
                            <Box className="typing-dot" sx={{ animationDelay: '0.2s', bgcolor: '#999', width: 8, height: 8, borderRadius: '50%', mx: 0.25 }} />
                            <Box className="typing-dot" sx={{ animationDelay: '0.4s', bgcolor: '#999', width: 8, height: 8, borderRadius: '50%', mx: 0.25 }} />
                          </Box>
                        )}
                        <Typography variant="body2" color="text.secondary" ml={1}>
                          {isCreatingSession ? "正在创建会话..." : "CoMAP AI 助手正在思考"}
                        </Typography>
                      </Box>
                    )}

                    <div ref={messagesEndRef} />
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(0,0,0,0.1)' }} />

                  <Box display="flex" gap={1} p={1.5} sx={{ backgroundColor: 'rgba(248, 249, 250, 0.7)' }}> {/* 修改背景为半透明 */}
                    <TextField
                      variant="outlined"
                      size="small"
                      fullWidth
                      placeholder={loading ? "请稍等..." : "输入你的问题..."}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      disabled={loading || !currentSessionId || isCreatingSession}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          // 修改输入框背景为半透明
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                    />
                    <IconButton
                      color="primary"
                      onClick={() => handleSend()}
                      disabled={loading || !currentSessionId || isCreatingSession}
                    >
                      <SendIcon />
                    </IconButton>
                  </Box>

                </Paper>
              </ResizableBox>
            </Box>
          </Draggable>
        )}
      </>
    )
  }
)

export default FloatingChat