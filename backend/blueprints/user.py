from flask import Blueprint, request, jsonify,session, g
from app import db  
from uuid import uuid4
from datetime import datetime
from models import User
from functools import wraps
user_bp = Blueprint('user', __name__, url_prefix='/api/user')

@user_bp.route('/login', methods=['POST'])
def login():
    """
    根据用户输入的 email 进行登录。
    如果 email 存在，则获取 user_id；如果不存在，则创建新用户。
    """
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    # 1. 检查 email 是否已存在
    user = User.query.filter_by(email=email).first()
    
    if not user:
        # 2. 如果用户不存在，则创建新用户
        user_id = str(uuid4()) # 生成一个唯一的 user_id
        # 使用 email 的前缀作为默认昵称
        nickname = email.split('@')[0] if '@' in email else email
        
        try:
            new_user = User(
                user_id=user_id,
                email=email,
                nickname=nickname,
                created_at=datetime.utcnow()
            )
            db.session.add(new_user)
            db.session.commit()
            user = new_user
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Failed to create user: {str(e)}"}), 500
    
    # 3. 将 user_id 存入 Session
    session['user_id'] = user.user_id
    
    return jsonify({"message": "Login successful", "user_id": user.user_id}), 200

def login_required(f):
    """一个简单的装饰器，用于保护需要登录的接口"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # 关键修改：直接检查 session 中是否存在 user_id
        if not session.get('user_id'):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function

@user_bp.route('/logout', methods=['POST'])
@login_required
def logout_user():
    session.pop('user_id', None)
    g.current_user_id = None
    return jsonify({"message": "Logout successful"}), 200
