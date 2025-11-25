// src/pages/DesignCanvas.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
// 所有的组件库
import CustomInfoNode from "../components/CustomInfoNode";
import FloatingChat from "../components/FloatingChat";
import CanvasHeader from "../components/CanvasHeader";
import AddNodeSidebar from "../components/AddNodeSidebar";
import NodeEditDialog from "../components/NodeEditDialog";
import AiSuggestionViewer from '../components/AiSuggestionViewer';
import OperationTips from "../components/OperationTips";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Dialog, DialogTitle, DialogContent,
  Box, Button, Typography, TextField,
  ThemeProvider, createTheme, CssBaseline, Modal, Divider, FormControlLabel,
  Switch, CircularProgress, Snackbar, Alert
} from "@mui/material";

// 导入所有需要的 Material-UI 图标
import SchoolIcon from '@mui/icons-material/School';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SportsHandballIcon from '@mui/icons-material/SportsHandball';
import TourIcon from '@mui/icons-material/Tour';
import CategoryIcon from '@mui/icons-material/Category';
import GradeIcon from '@mui/icons-material/Grade';

//导入api函数
import { createSession } from "../api/session";
import { generateLessonPlan } from '../api/lessonPlan';
import {
  fetchCanvas,
  saveCanvas as saveCanvasApi,
  updateCanvasInfo,
  createNode,
  updateNode,
  deleteNode,
  createEdge,
  updateEdge,
  deleteEdge,
  refineNode,
  correctNode,
  splitNode,
  syncNode,
  influenceNodes,
} from '../api/canva';
import { generateCardsPdf } from '../api/cardGenerator'
import { useDisplayMode } from '../context/DisplayContext';

//CSS和主题背景等设置
import Canvasbg from '../assets/bg1.jpg';
import styled from '@emotion/styled';
import "./DesignCanvas.css";

const theme = createTheme({
  palette: {
    primary: {
      main: '#42a5f5', // 蓝色
      light: '#6ec6ff',
      dark: '#1e88e5',
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
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: "'Playfair Display', 'Roboto', sans-serif",
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
});

const TAG_OPTIONS = [
  { label: "学习者", value: "学习者", icon: SchoolIcon, color: "#4CAF50" },
  { label: "策略", value: "策略", icon: LightbulbIcon, color: "#FFC107" },
  { label: "活动", value: "活动", icon: SportsHandballIcon, color: "#2196F3" },
  { label: "目标", value: "目标", icon: TourIcon, color: "#9C27B0" },
  { label: "资源", value: "资源", icon: CategoryIcon, color: "#FF5722" },
  { label: "评价", value: "评价", icon: GradeIcon, color: "#795548" },
];

const nodeTypes = { infoNode: CustomInfoNode };

function DesignCanvas() {
  //所有的节点数据
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  //所有的边数据
  const [edges, setEdges, onEdgesState] = useEdgesState([]);
  //AI给出的修改建议
  const [aiSuggestion, setAiSuggestion] = useState(null);
  //编辑数据
  const [editData, setEditData] = useState(null); // 初始化为 null
  //删除对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  //CoMAP AI是否打开
  const [chatOpen, setChatOpen] = useState(false);

  const [selectedElements, setSelectedElements] = useState([]);
  //对话的session ID
  const sessionIdRef = useRef(null);
  const chatRef = useRef();
  //整个图谱的实例
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  //编辑框是否正在加载中
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(null);

  const { showDetails, toggleDetails } = useDisplayMode();

  // 边缘标签编辑状态
  const [edgeLabelEdit, setEdgeLabelEdit] = useState({
    open: false,
    edgeId: null,
    label: '',
  });

  // Snackbar 状态 (用于普通操作反馈)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // 新增：AI 和 AI 确认对话框相关状态
  const [isAiLoading, setIsAiLoading] = useState(false); // AI 请求加载状态

  const { canvasId } = useParams();
  const [canvasInfo, setCanvasInfo] = useState(null);
  const [isCanvasInfoModalOpen, setIsCanvasInfoModalOpen] = useState(false);
  const [editCanvasData, setEditCanvasData] = useState({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenCanvasInfoModal = () => {
    setEditCanvasData(canvasInfo);
    setIsCanvasInfoModalOpen(true);
  };

  const handleCloseCanvasInfoModal = () => {
    setIsCanvasInfoModalOpen(false);
  };

  const handleUpdateCanvasInfo = async () => {
    if (!canvasId) return;
    setIsCanvasInfoModalOpen(false);
    showSnackbar('正在保存画布信息...', 'info');
    try {
      await updateCanvasInfo(canvasId, editCanvasData);
      setCanvasInfo(editCanvasData);
      showSnackbar('画布信息已更新', 'success');
    } catch (error) {
      console.error('保存画布信息失败:', error);
      showSnackbar('保存画布信息失败', 'error');
    }
  };

  const saveCanvas = useCallback(async (type) => {
    if (!canvasId || isSaving) return;

    setIsSaving(type);

    try {
      await saveCanvasApi(canvasId, { nodes, edges });
      showSnackbar(type === 'manual' ? '已手动保存' : '画布已自动保存', 'success');
    } catch (error) {
      console.error(`${type}保存失败:`, error);
      showSnackbar(`${type === 'manual' ? '手动' : '自动'}保存失败`, 'error');
    } finally {
      setIsSaving(null);
    }
  }, [canvasId, nodes, edges, isSaving, showSnackbar]);

  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      const timeoutId = setTimeout(() => {
        saveCanvas('auto');
      }, 60000);
      return () => clearTimeout(timeoutId);
    }
  }, [nodes, edges, saveCanvas]);




  const getViewportCenter = useCallback(() => {
    if (!reactFlowInstance) {
      console.warn("ReactFlow instance not available, returning a default position.");
      return { x: 50, y: 50 };
    }
    const viewport = reactFlowInstance.getViewport();
    const { x: viewportX, y: viewportY, zoom: viewportZoom } = viewport;

    const screenCenterX = window.innerWidth / 4;
    const screenCenterY = window.innerHeight / 4;

    const randomOffset = Math.random() * 50 - 10;
    const flowX = (screenCenterX - viewportX) / viewportZoom + randomOffset;
    const flowY = (screenCenterY - viewportY) / viewportZoom + randomOffset;

    return { x: flowX, y: flowY };
  }, [reactFlowInstance]);
  
  const addNode = useCallback(async(nodeData) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const newNode = { id: tempId, ...nodeData };

    // 先在前端显示
    setNodes(prev => [...prev, newNode]);
    showSnackbar(`正在添加卡片: ${nodeData.data?.title || ''}`, 'info');

    try {
      const createdNode = await createNode(canvasId, newNode);
      setNodes(prev =>
        prev.map(n =>
          n.id === tempId
            ? { ...n, id: createdNode.id, data: { ...n.data, id: createdNode.id } }
            : n
        )
      );
      showSnackbar('已成功添加卡片', 'success');
      return { ...newNode, id: createdNode.id, data: { ...newNode.data, id: createdNode.id } };
    } catch (error) {
      console.error('创建失败:', error);
      setNodes(prev => prev.filter(n => n.id !== tempId));
      showSnackbar('添加卡片失败', 'error');
      return null;
    }
  },[canvasId, setNodes, showSnackbar]);

  

  const handleAddNodeFromChat = async (nodeData) => {
    const tagOption = TAG_OPTIONS.find(opt => opt.value === nodeData.tag);
    const position = getViewportCenter();
    const newNode = {
      type: 'infoNode',
      position,
      data: {
        tag: nodeData.tag,
        title: nodeData.title,
        description: nodeData.description,
        sources: ["AI"],
        icon: tagOption ? tagOption.icon : null,
        color: tagOption ? tagOption.color : "#666",
      },
    };
    addNode(newNode);
  };

  const handleUpdateNodeFromChat = async (nodeData) => {
    // 根据传入的数据找到对应的节点ID，可能是 'card_id' 或 'id'
    const targetNodeId = nodeData.card_id || nodeData.id;

    console.log("update", nodeData);

    // 1. 查找节点，确保使用最新的 `nodes` 状态
    // `setNodes` 的回调函数会提供最新的状态，我们利用它来确保操作的原子性
    let nodeToUpdate;
    setNodes(prevNodes => {
      nodeToUpdate = prevNodes.find(n => n.id === targetNodeId);
      return prevNodes; // 不改变状态，只为了获取最新值
    });

    if (!nodeToUpdate) {
      console.error("Node to update not found with ID:", targetNodeId);
      return;
    }

    // 2. 准备更新后的数据
    // 优先使用 AI 返回的 'type'，如果不存在，则使用 'tag'
    const updatedTag = nodeData.type || nodeData.tag;
    const tagOption = TAG_OPTIONS.find(opt => opt.value === updatedTag);

    const updatedData = {
      ...nodeToUpdate.data,
      ...nodeData,
      tag: updatedTag,
      icon: tagOption ? tagOption.icon : nodeToUpdate.data.icon,
      color: tagOption ? tagOption.color : nodeToUpdate.data.color,
    };

    // 3. 乐观更新前端状态
    const updatedNodes = nodes.map(n => n.id === nodeToUpdate.id ? { ...n, data: updatedData } : n);
    setNodes(updatedNodes);
    showSnackbar('正在更新卡片...', 'info');

    try {
      const fullUpdatedNode = { ...nodeToUpdate, data: updatedData };
      await updateNode(canvasId, nodeToUpdate.id, fullUpdatedNode);
      showSnackbar('卡片更新成功', 'success');
    } catch (error) {
      console.error("Failed to update node:", error);
      // 如果后端更新失败，回滚前端状态到更新前的 `nodeToUpdate.data`
      setNodes(nodes.map(n => n.id === nodeToUpdate.id ? { ...n, data: nodeToUpdate.data } : n));
      showSnackbar('卡片更新失败', 'error');
    }
  };

  const handleOpenById = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setEditData({ id: node.id, ...node.data });
    }
  };

  const handleCloseNodeEditDialog = async () => {
    if (!editData || !editData.id) {
      setEditData(null);
      return;
    }

    const updatedNode = nodes.find(n => n.id === editData.id);
    if (!updatedNode) {
      setEditData(null);
      return;
    }

    const originalData = updatedNode.data;
    const tagOption = TAG_OPTIONS.find(opt => opt.value === editData.tag);

    const newLocalNodeData = {
      ...updatedNode.data,
      title: editData.title,
      description: editData.description,
      tag: editData.tag,
      icon: tagOption ? tagOption.icon : updatedNode.data.icon,
      color: tagOption ? tagOption.color : updatedNode.data.color,
    };

    const newLocalNode = {
      ...updatedNode,
      data: newLocalNodeData,
    };

    setNodes(prev => prev.map(n => n.id === updatedNode.id ? newLocalNode : n));
    setEditData(null);
    showSnackbar('正在更新卡片...', 'info');

    try {
      await updateNode(canvasId, updatedNode.id, newLocalNode);
      showSnackbar('卡片更新成功', 'success');
    } catch (error) {
      console.error("Failed to update node:", error);
      setNodes(prev => prev.map(n => n.id === updatedNode.id ? { ...n, data: originalData } : n));
      showSnackbar('卡片更新失败', 'error');
    }
  };


  const handleDeleteNode = useCallback(async (nodeId) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (!nodeToDelete) return;

    const nodesWithoutDeleted = nodes.filter(n => n.id !== nodeId);
    const edgesWithoutDeleted = edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    setNodes(nodesWithoutDeleted);
    setEdges(edgesWithoutDeleted);

    showSnackbar(`正在删除卡片`, 'info');

    try {
      await deleteNode(canvasId, nodeId);
      showSnackbar(`已成功删除卡片`, 'success');
    } catch (error) {
      console.error("Failed to delete node:", error);
      setNodes(prev => [...prev, nodeToDelete]);
      setEdges(prev => [...prev, ...edges.filter(e => e.source === nodeId || e.target === nodeId)]);
      showSnackbar("删除卡片失败", "error");
    }
  }, [setNodes, setEdges, showSnackbar, canvasId, nodes, edges]);

  const handleConfirmDelete = () => {
    if (editData?.id) {
      handleDeleteNode(editData.id);
    }
    setDeleteDialogOpen(false);
    setEditData(null);
  };

  const handleOpenDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  // =========================================================
  // 新增: 教学设计边关系预定义库
  // 格式: { sourceTag: 起始节点标签, targetTag: 目标节点标签, label: 边标签 }
  const predefinedEdges = [
    { sourceTag: "资源", targetTag: "活动", label: "支持" },
    { sourceTag: "目标", targetTag: "活动", label: "引导" },
    { sourceTag: "策略", targetTag: "活动", label: "组织" },
    { sourceTag: "评价", targetTag: "活动", label: "衡量" },
    { sourceTag: "策略", targetTag: "资源", label: "利用" },
    { sourceTag: "评价", targetTag: "目标", label: "检验" },
    { sourceTag: "策略", targetTag: "评价", label: "指导" },
    { sourceTag: "学习者", targetTag: "策略", label: "影响" },
    { sourceTag: "学习者", targetTag: "目标", label: "影响" },
    { sourceTag: "学习者", targetTag: "活动", label: "影响" },
  ];
  // =========================================================

  // =========================================================
  // 修改: onConnect 函数，添加自动匹配标签的逻辑
  const onConnect = useCallback(async (params) => {
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);

    let edgeLabel = "关联"; // 默认标签

    // 查找匹配的预定义关系
    if (sourceNode && targetNode) {
      const matchingEdges = predefinedEdges.filter(
        (edge) => edge.sourceTag === sourceNode.data.tag && edge.targetTag === targetNode.data.tag
      );

      if (matchingEdges.length === 1) {
        edgeLabel = matchingEdges[0].label;
      } else if (matchingEdges.length > 1) {
        edgeLabel = matchingEdges[0].label;
      }
    }

    const newEdge = {
      ...params,
      label: edgeLabel, // 使用匹配到的标签
      animated: true,
      style: { stroke: '#9e9e9e', strokeWidth: 2 },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      labelBgStyle: { fill: '#ffffff', color: '#333' },
      labelStyle: { fill: '#333', fontWeight: 600 },
      markerEnd: { type: 'arrowclosed' },
    };
    const tempId = `temp_e_${Date.now()}`;
    const tempEdgeWithId = { ...newEdge, id: tempId };
    setEdges(eds => addEdge(tempEdgeWithId, eds));
    showSnackbar(`正在添加${edgeLabel}关联...`, 'info');

    try {
      const createdEdge = await createEdge(canvasId, newEdge);
      setEdges(eds => eds.map(e => e.id === tempId ? { ...e, id: createdEdge.id } : e));
      showSnackbar(`已成功添加${edgeLabel}关联`, 'success');
    } catch (error) {
      console.error("Failed to create edge:", error);
      setEdges(eds => eds.filter(e => e.id !== tempId));
      showSnackbar("添加关联失败", "error");
    }
  }, [setEdges, showSnackbar, canvasId, nodes]);
  // =========================================================

  const handleEdgeLabelChange = (event) => {
    setEdgeLabelEdit(prev => ({ ...prev, label: event.target.value }));
  };

  const handleEdgeLabelSubmit = async () => {
    if (!edgeLabelEdit.edgeId) return;

    const edgeToUpdate = edges.find(e => e.id === edgeLabelEdit.edgeId);
    if (!edgeToUpdate) return;

    const originalLabel = edgeToUpdate.label;

    setEdges(eds => eds.map(edge => {
      if (edge.id === edgeLabelEdit.edgeId) {
        return { ...edge, label: edgeLabelEdit.label };
      }
      return edge;
    }));
    setEdgeLabelEdit({ open: false, edgeId: null, label: '' });
    showSnackbar('正在更新关联标签...', 'info');

    try {
      const updatedEdgeData = { ...edgeToUpdate, label: edgeLabelEdit.label };
      await updateEdge(canvasId, edgeToUpdate.id, updatedEdgeData);
      showSnackbar(`关联标签已更新`, 'success');
    } catch (error) {
      console.error("Failed to update edge:", error);
      setEdges(eds => eds.map(e => e.id === edgeToUpdate.id ? { ...e, label: originalLabel } : e));
      showSnackbar("更新关联标签失败", "error");
    }
  };

  const handleEdgeLabelCancel = () => {
    setEdgeLabelEdit({ open: false, edgeId: null, label: '' });
  };

  const handleEdgeLabelDelete = () => {
    const edgeToDelete = edges.find(e => e.id === edgeLabelEdit.edgeId);
    if (edgeToDelete) {
      handleDeleteEdge(edgeToDelete);
    }
    handleEdgeLabelCancel();
  };

  const handleDeleteEdge = useCallback(async (edge) => {
    const originalEdges = [...edges];
    setEdges(prev => prev.filter(e => e.id !== edge.id));
    showSnackbar(`正在删除关联`, 'info');

    try {
      await deleteEdge(canvasId, edge.id);
      showSnackbar(`已成功删除关联`, 'success');
    } catch (error) {
      console.error("Failed to delete edge:", error);
      setEdges(originalEdges);
      showSnackbar("删除关联失败", "error");
    }
  }, [setEdges, showSnackbar, canvasId, edges]);

  const onEdgeClick = (event, edge) => {
    event.stopPropagation();
    setEdgeLabelEdit({
      open: true,
      edgeId: edge.id,
      label: edge.label,
    });
  };

  const prevSelectionRef = useRef({ nodes: [], edges: [] });
  const handleSelectionChange = useCallback((selection) => {
    const newSelection = selection || { nodes: [], edges: [] };
    const prevNodes = prevSelectionRef.current.nodes.map(n => n.id).sort();
    const newNodes = newSelection.nodes.map(n => n.id).sort();
    const prevEdges = prevSelectionRef.current.edges.map(e => e.id).sort();
    const newEdges = newSelection.edges.map(e => e.id).sort();

    const isSameNodes = prevNodes.length === newNodes.length && prevNodes.every((id, i) => id === newNodes[i]);
    const isSameEdges = prevEdges.length === newEdges.length && prevEdges.every((id, i) => id === newEdges[i]);

    if (!isSameNodes || !isSameEdges) {
      prevSelectionRef.current = newSelection;
      setSelectedElements([...newSelection.nodes, ...newSelection.edges]);
    }
  }, []);

  useEffect(() => {
  const fetchCanvasData = async () => {
    if (!canvasId) {
      console.error("Canvas ID is missing!");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchCanvas(canvasId);
      setCanvasInfo(data);

      // =========================================================
      // 修改: 如果画布为空，则一次性创建六张卡片并更新状态（带临时ID替换逻辑）
      if (!data.nodes || data.nodes.length === 0) {
        const position = getViewportCenter();
        const newNode = {
          type: 'infoNode',
          position,
          data: {
            tag: "学习者",
            title:  `学习者特征卡片`,
            description:  "单击以输入你面向的学习者群体",
            sources: ["教师"],
            icon: SchoolIcon, 
            color: "#4CAF50"
          },
        };
        addNode(newNode);
      } else {
        setNodes(data.nodes);
        setEdges(data.edges);
      }
      // =========================================================
    } catch (error) {
      console.error("Failed to fetch canvas data:", error);
      showSnackbar("获取画布数据失败，请重试。", "error");
    } finally {
      setIsLoading(false);
    }
  };
  fetchCanvasData();
}, [canvasId, showSnackbar, setNodes, setEdges, setCanvasInfo]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 's') {
          event.preventDefault();
          saveCanvas('manual');
        }
      }

      const activeElement = document.activeElement;
      const isInputFocused = activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.classList.contains('ql-editor');

      if (event.key === "Delete" && !isInputFocused) {
        if (editData) {
          setDeleteDialogOpen(true);
          return;
        }
        selectedElements?.forEach(el => {
          if (el.source && el.target) {
            handleDeleteEdge(el);
          } else {
            handleDeleteNode(el.id);
          }
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElements, handleDeleteEdge, handleDeleteNode, editData, saveCanvas]);


  const handleOpenChatDialog = async () => {
    try {
      const res = await createSession({ user_id: "testuser" });
      sessionIdRef.current = res.session_id;
      chatRef.current?.clearHistory();
      chatRef.current?.startNewConversation();
      chatRef.current?.addMessage({ role: "ai", content: "欢迎使用对话辅助创建和修改教学地图..." });
      setChatOpen(true);
      showSnackbar('已开启对话辅助', 'info');
    } catch (error) {
      console.error("Failed to create session:", error);
      showSnackbar('无法开启对话辅助，请稍后再试', 'error');
    }
  };

  const handleDownload = async () => {
    if (isDownloading) {
      return;
    }
    setIsDownloading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 1;
      });
    }, 50);

    try {
      await generateLessonPlan({ nodes, edges });
      setProgress(100);
      setTimeout(() => {
        setIsDownloading(false);
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error('教案下载失败:', error);
      clearInterval(interval);
      setProgress(0);
      setIsDownloading(false);
      showSnackbar('教案下载失败，请稍后再试。', 'error');
    }
  };

  const handleExport = async () => {
    // 获取当前的 nodes 数据，例如从 Vuex Store 或组件状态中

    if (!nodes || nodes.length === 0) {
      showSnackbar("图谱中没有节点数据，无法生成卡片。", "error");
      return;
    }

    try {
      await generateCardsPdf({ nodes: nodes });
      // 可选：下载成功后给用户一个提示
      showSnackbar("卡片已生成并开始下载！", "error");
    } catch (error) {
      // 捕获并处理错误
      showSnackbar("生成卡片失败，请稍后重试。", "error");
      console.error(error);
    }
  }

  const handleAIAction = async (action, prompt) => {
    if (!editData) {
      showSnackbar("请先选择一个节点", "warning");
      return;
    }

    setIsAiLoading(true);
    const nodeId = editData.id;

    // Find the full original node from the `nodes` state to get its position and type.
    const originalNode = nodes.find(n => n.id === nodeId);
    if (!originalNode) {
      console.error("Could not find the original node to perform AI action on.");
      showSnackbar("操作失败：找不到原始卡片。", "error");
      setIsAiLoading(false);
      return;
    }

    // This was the fix: Use the complete originalNode, not the incomplete editData
    const currentNodeData = originalNode.data;

    const connectedEdges = edges.filter((edge) => edge.source === nodeId || edge.target === nodeId);
    const connectedNodeIds = connectedEdges.map((edge) => (edge.source === nodeId ? edge.target : edge.source));
    const connectedNodes = nodes.filter((n) => connectedNodeIds.includes(n.id));
    console.log(connectedNodes)
    showSnackbar(`正在执行 AI ${action} 操作...`, 'info');

    let apiResponse;
    try {
      // ... (the switch statement remains the same)
      switch (action) {
        case "refine":
          apiResponse = await refineNode(canvasId, nodeId, currentNodeData, prompt);
          break;
        case "correct":
          apiResponse = await correctNode(canvasId, nodeId, currentNodeData, prompt);
          break;
        case "split":
          apiResponse = await splitNode(canvasId, nodeId, currentNodeData, prompt);
          break;
        case "sync":
          // 关键修改: 在发送请求前检查 connectedNodeIds 是否为空
          if (!connectedNodeIds || connectedNodeIds.length === 0) {
            showSnackbar("该操作需要有相连卡片才可以执行", "error");
            // 提前终止，不执行 API 请求
            return;
          }
          apiResponse = await syncNode(canvasId, nodeId, currentNodeData, prompt, connectedNodeIds);
          break;

        case "influence":
          // 关键修改: 在发送请求前检查 connectedNodeIds 是否为空
          if (!connectedNodeIds || connectedNodeIds.length === 0) {
            showSnackbar("该操作需要有相连卡片才可以执行", "error");
            // 提前终止，不执行 API 请求
            return;
          }
          apiResponse = await influenceNodes(canvasId, nodeId, currentNodeData, prompt, connectedNodeIds);
          break;
        default:
          setIsAiLoading(false);
          return;
      }


      if (apiResponse && apiResponse.status === "failure") {
        showSnackbar(apiResponse.message || "AI 操作失败", "error");
        setIsAiLoading(false);
        return;
      }

      // --- This section now correctly constructs valid node objects ---
      if (action === "split") {
        const { old_node_id, new_nodes } = apiResponse;
        const position = originalNode.position;
        const newNodesWithFlowData = new_nodes.map((n, index) => ({
          id: n.id,
          type: n.tag, // Use your defined node type
          tag: n.tag,
          position: { x: position.x + (index * 220), y: position.y + 120 },
          title: n.title,
          description: n.description
        }));
        setAiSuggestion({ action, nodeId: old_node_id, changes: { deleteNodeId: old_node_id, createNodes: newNodesWithFlowData } });
      } else if (apiResponse.new_node) {
        const updatedNodeData = apiResponse.new_node;
        setAiSuggestion({
          action,
          nodeId: updatedNodeData.id,
          changes: {
            updateNode: { ...originalNode, data: updatedNodeData } // Merge into the full originalNode
          }
        });
      } else if (apiResponse.new_nodes) {
        const updatedNodesData = apiResponse.new_nodes;
        setAiSuggestion({
          action,
          nodeId: editData.id,
          changes: {
            updateNodes: updatedNodesData.map(un => {
              const existingNode = nodes.find(n => n.id === un.id);
              return existingNode ? { ...existingNode, data: un } : null;
            }).filter(n => n),
          }
        });
      }

      showSnackbar("AI 建议已生成，请确认。", "success");

    } catch (error) {
      console.error("AI 动作失败:", error);
      showSnackbar("AI 操作失败，请稍后重试。", "error");
    } finally {
      setIsAiLoading(false);
    }
  };


  const handleApplySuggestion = async () => {
    if (!aiSuggestion) return;

    const { action, changes } = aiSuggestion;

    try {
      if (action === "split") {
        const nodeIdToDelete = changes.deleteNodeId;

        // 1. 调用统一的 handleDeleteNode 函数来删除旧节点
        // 异步调用，确保后端也同步删除
        await handleDeleteNode(nodeIdToDelete); // 等待删除操作完成，再进行下一步

        // 2. 遍历 changes.createNodes，为每个新节点调用 handleAddNodeFromChat
        // 这个函数会负责在后端创建新节点并同步到前端
        for (const newNodeData of changes.createNodes) {
          await handleAddNodeFromChat(newNodeData);
        }
        showSnackbar(`AI已成功将卡片分裂为新卡片`, 'success');

      } else if (action === "refine" || action === "correct" || action === "sync") {
        const updatedNodeData = changes.updateNode.data;
        // 调用统一的 handleUpdateNodeFromChat 函数来更新节点
        await handleUpdateNodeFromChat(updatedNodeData);
        showSnackbar(`AI已成功更新卡片`, 'success');

      } else if (action === "influence") {
        const updatedNodesData = changes.updateNodes.map(node => node.data);
        console.log(updatedNodesData)
        // 遍历所有受影响的节点，并调用统一的更新函数
        for (const nodeData of updatedNodesData) {
          await handleUpdateNodeFromChat(nodeData);
        }
        showSnackbar(`AI已成功更新所有关联卡片`, 'success');

      } else {
        console.warn(`Unknown AI action: ${action}`);
      }
    } catch (error) {
      console.error(`Error handling AI action '${action}':`, error);
      showSnackbar("处理AI响应时发生错误", "error");
    }

    // 2. **THE FIX**: Also update the `editData` state to keep the dialog in sync
    if (action === "split") {
      // After a split, the original node is gone, so close the dialog.
      setEditData(null);
    } else if (action === "refine" || action === "correct" || action === "sync") {
      // For a simple update, refresh `editData` with the new node's data.
      const updatedNode = changes.updateNode;
      setEditData({ id: updatedNode.id, ...updatedNode.data });
    } else if (action === "influence") {
      // Find the node we were originally editing from the list of updated nodes.
      const primaryUpdatedNode = changes.updateNodes.find(n => n.id === aiSuggestion.nodeId);
      if (primaryUpdatedNode) {
        setEditData({ id: primaryUpdatedNode.id, ...primaryUpdatedNode.data });
      } else {
        // Failsafe: if we can't find it for some reason, close the dialog.
        setEditData(null);
      }
    }

    // 3. Clean up the suggestion state
    setAiSuggestion(null);
    showSnackbar("AI 建议已应用到画布。", "success");
  };

  const handleCancelSuggestion = () => {
    setAiSuggestion(null);
    showSnackbar("已取消 AI 建议。", "info");
  };

  const onNodeClick = useCallback((event, node) => {
    handleOpenById(node.id);
  }, [handleOpenById]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
        <CanvasHeader
          canvasInfo={canvasInfo}
          isSaving={isSaving}
          isDownloading={isDownloading}
          progress={progress}
          onOpenChat={handleOpenChatDialog}
          onDownload={handleDownload}
          onExport={handleExport}
          onOpenCanvasInfoModal={handleOpenCanvasInfoModal}
          onUpdateCanvasInfo={handleUpdateCanvasInfo}
          onCloseCanvasInfoModal={handleCloseCanvasInfoModal}
          isCanvasInfoModalOpen={isCanvasInfoModalOpen}
          editCanvasData={editCanvasData}
          setEditCanvasData={setEditCanvasData}
        />
        <OperationTips />

        <Box sx={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showDetails}
                onChange={toggleDetails}
                color="primary"
              />
            }
            label="显示详情"
          />
        </Box>

        <Box sx={{ display: 'flex', flexGrow: 1 }}>
          <AddNodeSidebar getViewportCenter={getViewportCenter} onAddNode={addNode} theme={theme} />

          <Box
            ref={reactFlowWrapper}
            sx={{
              flexGrow: 1,
              position: "relative",
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
              backgroundImage: `url(${Canvasbg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'repeat',
            }}
          >
            {isLoading ? (
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 4, borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.7)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                <CircularProgress color="primary" />
                <Typography>正在加载画布...</Typography>
              </Box>
            ) : nodes.length === 0 ? (
              <Box sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                p: 4,
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.7)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                maxWidth: '600px'
              }}>
                <Typography variant="h6" gutterBottom>画布暂时为空哦~</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>您可以点击侧边栏的选项来新建卡片或使用对话方式辅助构建。</Typography>
              </Box>
            ) : (
              <ReactFlowProvider>
                <ReactFlow
                  className="my-react-flow-container"
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesState}
                  onConnect={onConnect}
                  onSelectionChange={handleSelectionChange}
                  onEdgeClick={onEdgeClick}
                  onNodeClick={onNodeClick}
                  onEdgeContextMenu={(e, edge) => {
                    e.preventDefault();
                    handleDeleteEdge(edge);
                  }}
                  connectionMode="loose"
                  onInit={setReactFlowInstance}
                >
                  <Background gap={16} size={1} variant="dots" color="rgba(255, 255, 255, 0.4)" />
                  <Controls showInteractive={false} />
                  <MiniMap
                    nodeColor={(n) => {
                      const tagOption = TAG_OPTIONS.find(opt => opt.value === n.data.tag);
                      return tagOption ? tagOption.color : '#bdbdbd';
                    }}
                    nodeStrokeWidth={2}
                    nodeBorderRadius={5}
                  />
                </ReactFlow>
              </ReactFlowProvider>
            )}
          </Box>
        </Box>

        {editData && (
          <NodeEditDialog
            open={!!editData}
            editData={editData}
            setEditData={setEditData}
            onClose={handleCloseNodeEditDialog}
            onDelete={handleOpenDeleteDialog}
            onAIAction={handleAIAction}
            isAiLoading={isAiLoading}
          />
        )}

        <Modal open={!!aiSuggestion} onClose={handleCancelSuggestion}>
          <Box sx={{
            p: 4,
            width: { xs: '90%', md: 600, lg: 700 },
            bgcolor: 'background.paper',
            margin: 'auto',
            mt: '10%',
            borderRadius: 2,
            boxShadow: 24,
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" gutterBottom>
              ✨ AI 优化建议
            </Typography>
            <Divider />

            {/* 2. Replace the old <div> with the new component */}
            <Box sx={{ my: 3, overflowY: 'auto', flexGrow: 1 }}>
              {aiSuggestion && (
                <AiSuggestionViewer
                  suggestion={aiSuggestion}
                  originalNodes={nodes}
                />
              )}
            </Box>

            <Divider />
            <Box sx={{ mt: 2, alignSelf: 'flex-end' }}>
              <Button onClick={handleCancelSuggestion} variant="text" sx={{ mr: 1 }}>
                取消
              </Button>
              <Button onClick={handleApplySuggestion} variant="contained" color="inherit">
                应用建议
              </Button>
            </Box>
          </Box>
        </Modal>

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs">
          <DialogTitle>确认删除</DialogTitle>
          <DialogContent>
            <Typography>确定要删除这个卡片吗？删除后不可恢复。</Typography>
            <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
              <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">取消</Button>
              <Button
                color="error"
                variant="contained"
                onClick={handleConfirmDelete}
              >
                删除
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        <Dialog open={edgeLabelEdit.open} onClose={handleEdgeLabelCancel} maxWidth="s">
          <DialogTitle>编辑标签</DialogTitle>
          <DialogContent sx={{ minWidth: 400, p: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              color="inherit"
              id="edge-label"
              label="标签内容"
              type="text"
              fullWidth
              variant="outlined"
              value={edgeLabelEdit.label}
              onChange={handleEdgeLabelChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleEdgeLabelSubmit();
                }
              }}
            />
            <Box mt={2} display="flex" justifyContent="space-between">
              <Button
                onClick={handleEdgeLabelDelete}
                color="error"
              >
                删除
              </Button>
              <Box display="flex" gap={1}>
                <Button onClick={handleEdgeLabelCancel} color="inherit">
                  取消
                </Button>
                <Button onClick={handleEdgeLabelSubmit} variant="contained" color="success">
                  保存
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>

        <FloatingChat
          ref={chatRef}
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          onOpen={() => setChatOpen(true)}
          sessionId={sessionIdRef.current}
          cases={nodes.map(n => n.data)}
          showSnackbar={showSnackbar}
          canvasInfo={canvasInfo}
          onActions={(actions) => {
            actions.forEach(action => {
              if (action.option === "add") {
                handleAddNodeFromChat({
                  tag: action.type,
                  title: action.title,
                  description: action.description,
                  sources: ["AI"],
                });
              } else if (action.option === "modify") {
                handleUpdateNodeFromChat({
                  card_id: action.card_id,
                  title: action.title,
                  description: action.description,
                  type: action.type,
                });
              }
            });
          }}
        />
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // 位置改到中上方
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default DesignCanvas;