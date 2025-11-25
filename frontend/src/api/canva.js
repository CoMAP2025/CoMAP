// src/api/canva.js
import api from "./index"; // 假设这是你的 axios 实例

/**
 * 获取当前用户的所有画布列表
 * GET /map/
 * @returns {Promise<Array>} 返回画布列表
 */
export const fetchUserCanvases = async () => {
  const response = await api.get("/map/");
  return response.data;
};

/**
 * 创建一个新的画布
 * POST /map/create
 * @param {object} canvasData - 包含画布初始信息的对象 (name, lessonCount, etc.)
 * @returns {Promise<Object>} 返回新画布的信息
 */
export const createNewCanvas = async (canvasData) => {
  const response = await api.post("/map/create", canvasData);
  return response.data;
};

/**
 * 获取指定画布的所有数据（包含节点和连线）
 * GET /map/<int:canvasId>
 * @param {number} canvasId - 画布ID
 * @returns {Promise<Object>} 返回包含画布所有信息的对象
 */
export const fetchCanvas = async (canvasId) => {
  const response = await api.get(`/map/${canvasId}`);
  return response.data;
};

/**
 * 保存整个画布的状态（节点和连线），用于自动保存
 * POST /map/<int:canvasId>/save
 * @param {number} canvasId - 画布ID
 * @param {object} data - 包含 nodes 和 edges 的对象
 * @returns {Promise<Object>} 返回保存结果
 */
export const saveCanvas = async (canvasId, data) => {
  const response = await api.post(`/map/${canvasId}/save`, data);
  return response.data;
};

/**
 * 更新画布元数据（名称、课时等）
 * PUT /map/<int:canvasId>/info
 * @param {number} canvasId - 画布ID
 * @param {object} info - 包含要更新的画布信息的对象
 * @returns {Promise<Object>} 返回更新后的画布信息
 */
export const updateCanvasInfo = async (canvasId, info) => {
  const response = await api.put(`/map/${canvasId}/info`, info);
  return response.data;
};

/**
 * 创建一个新的节点
 * POST /map/<int:canvasId>/nodes
 * @param {number} canvasId - 画布ID
 * @param {object} nodeData - 新节点的数据
 * @returns {Promise<Object>} 返回创建的节点信息
 */
export const createNode = async (canvasId, nodeData) => {
  const response = await api.post(`/map/${canvasId}/nodes`, nodeData);
  return response.data;
};

/**
 * 更新一个节点
 * PUT /map/<int:canvasId>/nodes/<string:nodeId>
 * @param {number} canvasId - 画布ID
 * @param {string} nodeId - 节点ID
 * @param {object} nodeData - 更新后的节点数据
 * @returns {Promise<Object>} 返回更新后的节点信息
 */
export const updateNode = async (canvasId, nodeId, nodeData) => {
  const response = await api.put(`/map/${canvasId}/nodes/${nodeId}`, nodeData);
  return response.data;
};

/**
 * 删除一个节点
 * DELETE /map/<int:canvasId>/nodes/<string:nodeId>
 * @param {number} canvasId - 画布ID
 * @param {string} nodeId - 节点ID
 * @returns {Promise<void>}
 */
export const deleteNode = async (canvasId, nodeId) => {
  const response = await api.delete(`/map/${canvasId}/nodes/${nodeId}`);
  return response.data;
};

/**
 * 创建一个新的连线
 * POST /map/<int:canvasId>/edges
 * @param {number} canvasId - 画布ID
 * @param {object} edgeData - 新连线的数据
 * @returns {Promise<Object>} 返回创建的连线信息
 */
export const createEdge = async (canvasId, edgeData) => {
  const response = await api.post(`/map/${canvasId}/edges`, edgeData);
  return response.data;
};

/**
 * 更新一个连线（例如，修改标签）
 * PUT /map/<int:canvasId>/edges/<string:edgeId>
 * @param {number} canvasId - 画布ID
 * @param {string} edgeId - 连线ID
 * @param {object} edgeData - 更新后的连线数据
 * @returns {Promise<Object>} 返回更新后的连线信息
 */
export const updateEdge = async (canvasId, edgeId, edgeData) => {
  const response = await api.put(`/map/${canvasId}/edges/${edgeId}`, edgeData);
  return response.data;
};

/**
 * 删除一个连线
 * DELETE /map/<int:canvasId>/edges/<string:edgeId>
 * @param {number} canvasId - 画布ID
 * @param {string} edgeId - 连线ID
 * @returns {Promise<void>}
 */
export const deleteEdge = async (canvasId, edgeId) => {
  const response = await api.delete(`/map/${canvasId}/edges/${edgeId}`);
  return response.data;
};

/**
 * AI细化节点
 * POST /map/<int:canvasId>/nodes/<string:nodeId>/ai/refine
 * @param {number} canvasId - 画布ID
 * @param {string} nodeId - 节点ID
 * @param {object} currentNode - 当前节点的完整数据 {id, title, description, tag}
 * @param {string} prompt - 细化指令
 * @returns {Promise<Object>} 返回AI细化建议的节点数据 { new_node: { ... } }
 */
export const refineNode = async (canvasId, nodeId, currentNode, prompt) => {
  const response = await api.post(`/map/${canvasId}/nodes/${nodeId}/ai/refine`, {
    current_node: currentNode,
    prompt: prompt,
  });
  return response.data;
};

/**
 * AI纠正节点
 * POST /map/<int:canvasId>/nodes/<string:nodeId>/ai/correct
 * @param {number} canvasId - 画布ID
 * @param {string} nodeId - 节点ID
 * @param {object} currentNode - 当前节点的完整数据 {id, title, description, tag}
 * @param {string} prompt - 纠正指令
 * @returns {Promise<Object>} 返回AI纠正建议的节点数据 { new_node: { ... } }
 */
export const correctNode = async (canvasId, nodeId, currentNode, prompt) => {
  const response = await api.post(`/map/${canvasId}/nodes/${nodeId}/ai/correct`, {
    current_node: currentNode,
    prompt: prompt,
  });
  return response.data;
};

/**
 * AI分裂节点
 * POST /map/<int:canvasId>/nodes/<string:nodeId>/ai/split
 * @param {number} canvasId - 画布ID
 * @param {string} nodeId - 节点ID
 * @param {object} currentNode - 当前节点的完整数据 {id, title, description, tag}
 * @param {string} prompt - 分裂指令
 * @returns {Promise<Object>} 返回AI分裂建议的数据 { old_node_id: '...', new_nodes: [{...}, {...}] }
 */
export const splitNode = async (canvasId, nodeId, currentNode, prompt) => {
  const response = await api.post(`/map/${canvasId}/nodes/${nodeId}/ai/split`, {
    current_node: currentNode,
    prompt: prompt,
  });
  return response.data;
};

/**
 * AI同步节点
 * POST /map/<int:canvasId>/nodes/<string:nodeId>/ai/sync
 * @param {number} canvasId - 画布ID
 * @param {string} nodeId - 节点ID
 * @param {object} currentNode - 当前节点的完整数据 {id, title, description, tag}
 * @param {string} prompt - 同步指令
 * @param {object[]} connectedNodes - 相连节点的完整数据列表
 * @returns {Promise<Object>} 返回AI同步建议的节点数据 { new_node: { ... } }
 */
export const syncNode = async (canvasId, nodeId, currentNode, prompt, connectedNodes) => {
  const response = await api.post(`/map/${canvasId}/nodes/${nodeId}/ai/sync`, {
    current_node: currentNode,
    prompt: prompt,
    connected_node_ids: connectedNodes,
  });
  return response.data;
};

/**
 * AI影响相连节点
 * POST /map/<int:canvasId>/nodes/<string:nodeId>/ai/influence
 * @param {number} canvasId - 画布ID
 * @param {string} nodeId - 节点ID（影响源）
 * @param {object} currentNode - 当前节点的完整数据 {id, title, description, tag}
 * @param {string} prompt - 影响指令
 * @param {object[]} connectedNodes - 受影响的相连节点完整数据列表
 * @returns {Promise<Object>} 返回AI影响建议的节点列表数据 { new_nodes: [{...}, {...}] }
 */
export const influenceNodes = async (canvasId, nodeId, currentNode, prompt, connectedNodes) => {
  const response = await api.post(`/map/${canvasId}/nodes/${nodeId}/ai/influence`, {
    current_node: currentNode,
    prompt: prompt,
    connected_node_ids: connectedNodes,
  });
  return response.data;
};

/**
 * 提交AI更改
 * POST /map/<int:canvasId>/ai/commit
 * @param {number} canvasId - 画布ID
 * @param {object} changes - 包含所有AI更改的对象
 * @param {object[]} [changes.nodes_to_update] - 需要更新的节点列表
 * @param {object[]} [changes.nodes_to_create] - 需要新增的节点列表 (含position)
 * @param {string} [changes.node_to_delete_id] - 需要删除的节点ID
 * @returns {Promise<Object>} 返回提交结果
 */
export const commitAIChanges = async (canvasId, changes) => {
  const response = await api.post(`/map/${canvasId}/ai/commit`, { changes });
  return response.data;
};