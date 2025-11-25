from flask import Blueprint, request, jsonify, g, send_file
from .user import login_required
from models import Canvas, db, CanvasNode, CanvasEdge, UserActivityLog
from datetime import datetime
import uuid
from sqlalchemy import or_
from agents import AIAgents  # 导入AI核心逻辑类

# 蓝图定义
map_bp = Blueprint('map', __name__, url_prefix='/api/map')

# 实例化AI Agent
ai_agents = AIAgents()

def log_activity(user_id, canvas_id, action, entity_type, entity_id=None, details=None):
    """
    增强的日志记录函数，记录更详尽的details信息。
    :param user_id: 用户ID
    :param canvas_id: 画布ID
    :param action: 操作类型（如 'create_node', 'ai_suggest_refine', 'ai_commit_update'）
    :param entity_type: 实体类型（如 'canvas', 'node', 'edge'）
    :param entity_id: 实体ID
    :param details: 包含操作前后的详细数据，例如 {'old_data': ..., 'new_data': ...}
    """
    log = UserActivityLog(
        user_id=user_id,
        canvas_id=canvas_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
        timestamp=datetime.utcnow()
    )
    db.session.add(log)
    db.session.commit()


def _get_canvas_and_check_permission(canvasId):
    """辅助函数，用于获取画布并验证权限"""
    canvas = Canvas.query.get_or_404(canvasId)
    if canvas.user_id != g.current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    return canvas

def _get_node_and_canvas(canvasId, nodeId):
    """辅助函数，用于获取节点和画布并验证权限"""
    canvas = _get_canvas_and_check_permission(canvasId)
    if isinstance(canvas, tuple):  # 检查是否返回了错误响应
        return canvas, None
    node = CanvasNode.query.filter_by(id=nodeId, canvas_id=canvasId).first_or_404()
    return node, canvas

# ====================================================================
# === 画布 (Canvas) 的 CRUD 路由
# ====================================================================
from agents import generate_printable_cards

@map_bp.route('/generate_cards_pdf', methods=['POST'])
@login_required
def generate_cards_pdf():
    """
    接收教学图谱数据，生成并返回一个包含所有节点卡片的PDF文件。
    """
    data = request.get_json()
    if not data or 'nodes' not in data:
        return jsonify({"error": "Invalid data, 'nodes' field is required."}), 400

    nodes = data.get('nodes', [])

    try:
        # 调用核心函数，生成PDF文件的内存流
        pdf_stream = generate_printable_cards(nodes)
        
        # 返回PDF文件
        return send_file(
            pdf_stream,
            as_attachment=True,
            download_name=f"教学卡片_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
            mimetype="application/pdf"
        )
    except Exception as e:
        # 错误处理，如果生成PDF失败，返回错误信息
        print(f"Error generating PDF: {e}")
        return jsonify({"error": "Failed to generate PDF cards."}), 500

@map_bp.route('/', methods=['GET'])
@login_required
def get_user_canvases():
    user_id = g.current_user_id
    canvases = Canvas.query.filter_by(user_id=user_id).order_by(Canvas.updated_at.desc()).all()
    canvases_list = [canvas.to_dict() for canvas in canvases]
    return jsonify(canvases_list), 200

# 创建新画布
@map_bp.route('/create', methods=['POST'])
@login_required
def create_map():
    data = request.json
    name = data.get('name', '新建画布')
    lesson_count = data.get('lessonCount', 1)
    lesson_duration = data.get('lessonDuration', 45)
    subject = data.get('subject', '其他')

    new_map = Canvas(
        user_id=g.current_user_id,
        name=name,
        lesson_count=lesson_count,
        lesson_duration=lesson_duration,
        subject=subject,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.session.add(new_map)
    db.session.commit()

    log_activity(
        user_id=g.current_user_id,
        canvas_id=new_map.id,
        action='create',
        entity_type='canvas',
        entity_id=str(new_map.id),
        details={
            'name': new_map.name,
            'subject': new_map.subject
        }
    )
    
    return jsonify({
        "message": "Map created successfully",
        "map_id": new_map.id
    }), 201

# 获取指定画布所有数据
@map_bp.route('/<int:canvasId>', methods=['GET'])
@login_required
def get_canvas_data(canvasId):
    canvas = Canvas.query.get_or_404(canvasId)
    if canvas.user_id != g.current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    return jsonify(canvas.to_dict())

# 保存整个画布
@map_bp.route('/<int:canvasId>/save', methods=['POST'])
@login_required
def save_canvas_state(canvasId):
    canvas = Canvas.query.get_or_404(canvasId)
    if canvas.user_id != g.current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.json
    old_info = canvas.to_dict()
    CanvasNode.query.filter_by(canvas_id=canvasId).delete()
    CanvasEdge.query.filter_by(canvas_id=canvasId).delete()
    
    nodes_data = request.json.get('nodes', [])
    edges_data = request.json.get('edges', [])

    for node_data in nodes_data:
        node_id = node_data.get('id', str(uuid.uuid4()))
        new_node = CanvasNode(
            id=node_id,
            canvas_id=canvasId,
            tag=node_data['data']['tag'],
            title=node_data['data']['title'],
            description=node_data['data']['description'],
            sources=node_data['data'].get('sources', []),
            position_x=node_data['position']['x'],
            position_y=node_data['position']['y'],
        )
        db.session.add(new_node)
    
    for edge_data in edges_data:
        edge_id = edge_data.get('id', str(uuid.uuid4()))
        new_edge = CanvasEdge(
            id=edge_id,
            canvas_id=canvasId,
            source=edge_data['source'],
            target=edge_data['target'],
            label=edge_data.get('label', '关联'),
        )
        db.session.add(new_edge)
    
    db.session.commit()

    new_info = canvas.to_dict()
    log_activity(
        user_id=g.current_user_id,
        canvas_id=canvasId,
        action='update_info',
        entity_type='canvas',
        entity_id=str(canvasId),
        details={
            'old': {k: old_info[k] for k in data.keys() if k in old_info},
            'new': {k: new_info[k] for k in data.keys() if k in new_info},
        }
    )
    return jsonify({'message': 'Canvas saved successfully'}), 200

# 更新画布信息
@map_bp.route('/<int:canvasId>/info', methods=['PUT'])
@login_required
def update_canvas_info(canvasId):
    canvas = Canvas.query.get_or_404(canvasId)
    if canvas.user_id != g.current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    old_info = canvas.to_dict()
    canvas.name = data.get('name', canvas.name)
    canvas.lesson_count = data.get('lesson_count', canvas.lesson_count)
    canvas.lesson_duration = data.get('lesson_duration', canvas.lesson_duration)
    canvas.subject = data.get('subject', canvas.subject)
    db.session.commit()

    new_info = canvas.to_dict()
    log_activity(
        user_id=g.current_user_id,
        canvas_id=canvasId,
        action='update_info',
        entity_type='canvas',
        entity_id=str(canvasId),
        details={
            'old': {k: old_info[k] for k in data.keys() if k in old_info},
            'new': {k: new_info[k] for k in data.keys() if k in new_info},
        }
    )

    return jsonify(canvas.to_dict()), 200

# 创建新节点
@map_bp.route('/<int:canvasId>/nodes', methods=['POST'])
@login_required
def create_node(canvasId):
    canvas = Canvas.query.get_or_404(canvasId)
    if canvas.user_id != g.current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.json
    position_data = data.get('position', {'x': 0, 'y': 0})
    data_content = data.get('data', {})

    new_node = CanvasNode(
        canvas_id=canvasId,
        tag=data_content.get('tag', ''),
        title=data_content.get('title', ''),
        description=data_content.get('description', ''),
        sources=data_content.get('sources', []),
        position_x=position_data['x'],
        position_y=position_data['y']
    )
    db.session.add(new_node)
    db.session.commit()

    log_activity(
        user_id=g.current_user_id,
        canvas_id=canvasId,
        action='create',
        entity_type='node',
        entity_id=new_node.id,
        details={
            'title': new_node.title,
            'tag': new_node.tag
        }
    )
    return jsonify(new_node.to_dict()), 201

# 更新节点
@map_bp.route('/<int:canvasId>/nodes/<string:nodeId>', methods=['PUT'])
@login_required
def update_node(canvasId, nodeId):
    node = CanvasNode.query.filter_by(id=nodeId, canvas_id=canvasId).first_or_404()
    canvas = Canvas.query.get_or_404(canvasId)
    if canvas.user_id != g.current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    old_data = node.to_dict()
    node.title = data['data']['title']
    node.tag = data['data']['tag']
    node.description = data['data']['description']
    node.position_x = data['position']['x']
    node.position_y = data['position']['y']
    db.session.commit()

    new_data = node.to_dict()
    log_activity(
        user_id=g.current_user_id,
        canvas_id=canvasId,
        action='update',
        entity_type='node',
        entity_id=node.id,
        details={
            'old': old_data,
            'new': new_data,
        }
    )
    return jsonify(node.to_dict()), 200

# 删除节点
@map_bp.route('/<int:canvasId>/nodes/<string:nodeId>', methods=['DELETE'])
@login_required
def delete_node(canvasId, nodeId):
    node = CanvasNode.query.filter_by(id=nodeId, canvas_id=canvasId).first_or_404()
    canvas = Canvas.query.get_or_404(canvasId)
    if canvas.user_id != g.current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    deleted_node_data = node.to_dict()
    db.session.delete(node)
    CanvasEdge.query.filter((CanvasEdge.source == nodeId) | (CanvasEdge.target == nodeId)).delete()
    db.session.commit()
    log_activity(
        user_id=g.current_user_id,
        canvas_id=canvasId,
        action='delete',
        entity_type='node',
        entity_id=nodeId,
        details={'deleted_data': deleted_node_data}
    )
    return '', 204

# 创建新边
@map_bp.route('/<int:canvasId>/edges', methods=['POST'])
@login_required
def create_edge(canvasId):
    canvas = Canvas.query.get_or_404(canvasId)
    if canvas.user_id != g.current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    new_edge = CanvasEdge(
        canvas_id=canvasId,
        source=data['source'],
        target=data['target'],
        label=data.get('label', '关联')
    )
    db.session.add(new_edge)
    db.session.commit()
    log_activity(
        user_id=g.current_user_id,
        canvas_id=canvasId,
        action='create',
        entity_type='edge',
        entity_id=new_edge.id,
        details={'source': new_edge.source, 'target': new_edge.target, 'label': new_edge.label}
    )
    return jsonify(new_edge.to_dict()), 201

# 更新边
@map_bp.route('/<int:canvasId>/edges/<string:edgeId>', methods=['PUT'])
@login_required
def update_edge(canvasId, edgeId):
    edge = CanvasEdge.query.filter_by(id=edgeId, canvas_id=canvasId).first_or_404()
    canvas = Canvas.query.get_or_404(canvasId)
    if canvas.user_id != g.current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
        
    data = request.json
    old_label = edge.label
    edge.label = data.get('label', edge.label)
    db.session.commit()
    new_label = edge.label
    log_activity(
        user_id=g.current_user_id,
        canvas_id=canvasId,
        action='update',
        entity_type='edge',
        entity_id=edge.id,
        details={'old_label': old_label, 'new_label': new_label}
    )
    return jsonify(edge.to_dict()), 200

# 删除边
@map_bp.route('/<int:canvasId>/edges/<string:edgeId>', methods=['DELETE'])
@login_required
def delete_edge(canvasId, edgeId):
    edge = CanvasEdge.query.filter_by(id=edgeId, canvas_id=canvasId).first_or_404()
    canvas = Canvas.query.get_or_404(canvasId)
    if canvas.user_id != g.current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    deleted_edge_data = edge.to_dict()
    db.session.delete(edge)
    db.session.commit()
    log_activity(
        user_id=g.current_user_id,
        canvas_id=canvasId,
        action='delete',
        entity_type='edge',
        entity_id=edgeId,
        details={'deleted_data': deleted_edge_data}
    )
    return '', 204

@map_bp.route('/map-lesson-plan', methods=['POST'])
def generate_lesson_plan_route():
    try:
        data = request.get_json()
        nodes = data.get('nodes', [])
        edges = data.get('edges', []) 

        if not nodes:
            return {'error': '画布为空，请先创建内容。'}, 400

        # 这里需要导入 agents 模块
        from agents import generate_lesson_plan_with_tables
        # 调用主功能函数
        word_doc_stream = generate_lesson_plan_with_tables(nodes, edges)


        return send_file(
            word_doc_stream,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name='教学设计教案.docx'
        )
    except Exception as e:
        print(f"生成教案时发生错误: {e}")
        return {'error': f'生成教案失败，请稍后重试。错误信息: {str(e)}'}, 500

# ====================================================================
# === AI 交互的建议路由 (只返回数据，不提交数据库更改)
# ====================================================================

@map_bp.route('/<int:canvasId>/nodes/<string:nodeId>/ai/refine', methods=['POST'])
@login_required
def ai_refine_node(canvasId, nodeId):
    """对指定卡片进行AI细化，仅返回建议数据"""
    data = request.json
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({'error': '提示词不能为空'}), 400
    
    node, canvas = _get_node_and_canvas(canvasId, nodeId)
    if isinstance(node, tuple): return node

    ai_result = ai_agents.refine_agent(node.to_dict(), prompt)
    
    log_activity(g.current_user_id, canvasId, 'ai_suggest_refine', 'node', nodeId, {'prompt': prompt, 'target_node_id': nodeId})
    return jsonify(ai_result), 200

@map_bp.route('/<int:canvasId>/nodes/<string:nodeId>/ai/correct', methods=['POST'])
@login_required
def ai_correct_node(canvasId, nodeId):
    """对指定卡片进行AI纠正，仅返回建议数据"""
    data = request.json
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({'error': '提示词不能为空'}), 400

    node, canvas = _get_node_and_canvas(canvasId, nodeId)
    if isinstance(node, tuple): return node

    ai_result = ai_agents.correct_agent(node.to_dict(), prompt)
    
    log_activity(g.current_user_id, canvasId, 'ai_suggest_correct', 'node', nodeId, {'prompt': prompt, 'target_node_id': nodeId})
    return jsonify(ai_result), 200

@map_bp.route('/<int:canvasId>/nodes/<string:nodeId>/ai/split', methods=['POST'])
@login_required
def ai_split_node(canvasId, nodeId):
    """将指定卡片进行AI分裂，仅返回建议数据"""
    data = request.json
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({'error': '提示词不能为空'}), 400

    node, canvas = _get_node_and_canvas(canvasId, nodeId)
    if isinstance(node, tuple): return node

    ai_result = ai_agents.split_agent(node.to_dict(), prompt)
    
    log_activity(g.current_user_id, canvasId, 'ai_suggest_split', 'node', nodeId, {'prompt': prompt, 'target_node_id': nodeId})
    return jsonify(ai_result), 200
        
@map_bp.route('/<int:canvasId>/nodes/<string:nodeId>/ai/sync', methods=['POST'])
@login_required
def ai_sync_node(canvasId, nodeId):
    """根据相连节点列表内容同步当前节点，仅返回建议数据"""
    data = request.json
    prompt = data.get('prompt')
    connected_node_ids = data.get('connected_node_ids', [])
    
    if not connected_node_ids:
        return jsonify({'error': '同步操作需要指定相连节点ID列表。'}), 400
    
    current_node, canvas = _get_node_and_canvas(canvasId, nodeId)
    if isinstance(current_node, tuple): return current_node
    
    connected_nodes = CanvasNode.query.filter(
        CanvasNode.id.in_(connected_node_ids),
        CanvasNode.canvas_id == canvasId
    ).all()
    
    if len(connected_nodes) != len(connected_node_ids):
        return jsonify({'error': '部分相连节点未找到或不属于当前画布。'}), 404
        
    connected_nodes_dicts = [n.to_dict() for n in connected_nodes]
    
    ai_result = ai_agents.sync_agent(current_node.to_dict(), connected_nodes_dicts, prompt)
    
    log_activity(g.current_user_id, canvasId, 'ai_suggest_sync', 'node', nodeId, {'prompt': prompt, 'target_node_id': nodeId, 'connected_node_ids': connected_node_ids})
    return jsonify(ai_result), 200

@map_bp.route('/<int:canvasId>/nodes/<string:nodeId>/ai/influence', methods=['POST'])
@login_required
def ai_influence_node(canvasId, nodeId):
    """根据当前节点内容影响更新相连节点列表，仅返回建议数据"""
    data = request.json
    prompt = data.get('prompt')
    connected_node_ids = data.get('connected_node_ids', [])
    
    if not connected_node_ids:
        return jsonify({'error': '影响操作需要指定相连节点ID列表。'}), 400

    current_node, canvas = _get_node_and_canvas(canvasId, nodeId)
    if isinstance(current_node, tuple): return current_node
    
    connected_nodes = CanvasNode.query.filter(
        CanvasNode.id.in_(connected_node_ids),
        CanvasNode.canvas_id == canvasId
    ).all()
    
    if len(connected_nodes) != len(connected_node_ids):
        return jsonify({'error': '部分相连节点未找到或不属于当前画布。'}), 404
    
    connected_nodes_dicts = [n.to_dict() for n in connected_nodes]
    
    ai_result = ai_agents.influence_agent(current_node.to_dict(), connected_nodes_dicts, prompt)
    
    log_activity(g.current_user_id, canvasId, 'ai_suggest_influence', 'node', nodeId, {'prompt': prompt, 'source_node_id': nodeId, 'connected_node_ids': connected_node_ids})
    return jsonify(ai_result), 200

# ====================================================================
# === 统一的AI更改提交接口
# ====================================================================

@map_bp.route('/<int:canvasId>/ai/commit', methods=['POST'])
@login_required
def commit_ai_changes(canvasId):
    """
    接收前端确认后的AI更改，并提交到数据库。
    """
    canvas = _get_canvas_and_check_permission(canvasId)
    if isinstance(canvas, tuple): return canvas
    
    data = request.json
    changes = data.get('changes', {})
    
    nodes_to_update_data = changes.get('nodes_to_update', [])
    nodes_to_create_data = changes.get('nodes_to_create', [])
    node_to_delete_id = changes.get('node_to_delete_id')
    
    # 1. 更新现有节点
    for updated_node_data in nodes_to_update_data:
        node_id = updated_node_data.get('id')
        node = CanvasNode.query.filter_by(id=node_id, canvas_id=canvasId).first()
        if node:
            old_data = node.to_dict()
            node.title = updated_node_data.get('title', node.title)
            node.description = updated_node_data.get('description', node.description)
            log_activity(g.current_user_id, canvasId, 'ai_commit_update', 'node', node_id, {'old_data': old_data, 'new_data': node.to_dict()})

    # 2. 创建新节点 (针对 split 操作)
    if nodes_to_create_data:
        for new_node_data in nodes_to_create_data:
            node_data = new_node_data['data']
            new_node_db = CanvasNode(
                id=str(uuid.uuid4()), # 确保使用新的UUID，防止与ai_suggest中的临时ID冲突
                canvas_id=canvasId,
                tag=node_data['tag'],
                title=node_data['title'],
                description=node_data['description'],
                sources=node_data.get('sources', []),
                position_x=new_node_data['position']['x'],
                position_y=new_node_data['position']['y'],
            )
            db.session.add(new_node_db)
            log_activity(g.current_user_id, canvasId, 'ai_commit_create', 'node', new_node_db.id, {'new_data': new_node_db.to_dict()})

    # 3. 删除旧节点 (针对 split 操作)
    if node_to_delete_id:
        node = CanvasNode.query.filter_by(id=node_to_delete_id, canvas_id=canvasId).first()
        if node:
            deleted_node_data = node.to_dict()
            db.session.delete(node)
            CanvasEdge.query.filter(or_(CanvasEdge.source == node_to_delete_id, CanvasEdge.target == node_to_delete_id)).delete()
            log_activity(g.current_user_id, canvasId, 'ai_commit_delete', 'node', node_to_delete_id, {'deleted_data': deleted_node_data})

    # 统一提交所有更改
    db.session.commit()
    
    return jsonify({'status': 'success', 'message': 'AI更改已成功提交。'}), 200