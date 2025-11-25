# routes/chat.py
from flask import Blueprint, request, jsonify,g
from .user import login_required
from uuid import uuid4
from datetime import datetime
from app import db  
from models import ChatSession, ChatMessage  #
from llm import user_msg, assistant_msg
from agents import generate_graph_response, generate_text_response_with_history
chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')
from log import Logger

logger = Logger.get_logger()

@chat_bp.route('/create', methods=['POST'])
@login_required
def create_chat():
    data = request.get_json()
    user_id = g.current_user_id,
    print(user_id)

    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    # Generate session_id
    session_id = str(uuid4())
    created_at = datetime.utcnow()

    # Save to database
    new_session = ChatSession(user_id=user_id[0], session_id=session_id, created_at=created_at)
    db.session.add(new_session)
    db.session.commit()

    return jsonify({'session_id': session_id}), 201


@chat_bp.route('/generate', methods=['POST'])
@login_required
def generate():
    # try:
    data = request.get_json()
    print(data)
    session_id = data.get('session_id')
    concept_map = data.get('map')
    user_input = data.get('question')  # 当前输入的问题/消息

    required_fields = {
        "session_id": session_id,
        "concept_map": concept_map,
        "user_input": user_input,
    }

    missing_fields = []

    for name, value in required_fields.items():
        if value is None:
            missing_fields.append(name)

    if missing_fields:
        return jsonify({
            "error": f"Missing required fields: {', '.join(missing_fields)}"
        }), 400


    # 查找 session 是否存在
    session = ChatSession.query.filter_by(session_id=session_id).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404

    # 1. 获取历史聊天消息
    history = ChatMessage.query.filter_by(session_id=session_id).order_by(ChatMessage.created_at).all()
    messages = []
    for msg in history:
        role_msg = user_msg(msg.content) if msg.role == 'user' else assistant_msg(msg.content)
        messages.append(role_msg)

    # 2. 调用大模型
    result = generate_graph_response(user_input, concept_map, messages)
    logger.info(result)

    # reply = result.get("reply")
    # actions = result.get("actions")

    # 3. 存储用户输入和 AI 回复
    user_message = ChatMessage(
        session_id=session_id,
        role='user',
        content=user_input,
        created_at=datetime.utcnow()
    )
    assistant_message = ChatMessage(
        session_id=session_id,
        role='assistant',
        content=result,
        created_at=datetime.utcnow()
    )
    db.session.add(user_message)
    db.session.add(assistant_message)
    db.session.commit()

    return jsonify({
        "reply": result
    })

    # except Exception as e:
    #     return jsonify({"error": str(e)}), 500


@chat_bp.route('/chat', methods=['POST'])
def chat():
    """
    处理用户的纯文本聊天请求。
    - 从请求中获取 session_id 和 question。
    - 从数据库中加载历史消息。
    - 调用一个简化的纯文本生成函数，并将历史消息作为参数传入。
    - 将用户和AI的回复存储到数据库。
    """
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        user_input = data.get('question')
        print(session_id)
        print(user_input)
        if not session_id or not user_input:
            return jsonify({
                "error": "Missing required fields: 'session_id' and 'question'"
            }), 400

        session = ChatSession.query.filter_by(session_id=session_id).first()
        if not session:
            return jsonify({"error": "Session not found"}), 404

        # 1. 从数据库获取历史聊天消息
        history_db_objects = ChatMessage.query.filter_by(session_id=session_id).order_by(ChatMessage.created_at).all()
        
        # 2. 将数据库对象转换为大模型需要的格式
        messages_history = []
        for msg in history_db_objects:
            messages_history.append({"role": msg.role, "content": msg.content})

        # 3. 调用新的纯文本大模型接口，并传入历史消息
        reply = generate_text_response_with_history(user_input, messages_history)
        logger.info(reply)

        # 4. 存储用户输入和 AI 回复到数据库
        user_message = ChatMessage(
            session_id=session_id,
            role='user',
            content=user_input,
            created_at=datetime.utcnow()
        )
        assistant_message = ChatMessage(
            session_id=session_id,
            role='assistant',
            content=reply,
            created_at=datetime.utcnow()
        )
        db.session.add(user_message)
        db.session.add(assistant_message)
        db.session.commit()

        # 5. 返回纯文本回复
        return jsonify({"reply": reply})

    except Exception as e:
        logger.error(f"Error processing chat request: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500