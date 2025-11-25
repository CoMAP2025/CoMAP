from app.extensions import db
from datetime import datetime
from sqlalchemy import JSON
import uuid
class ChatSession(db.Model):
    __tablename__ = 'chat_sessions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(64), db.ForeignKey('users.user_id'), nullable=False)
    session_id = db.Column(db.String(64), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(64), unique=True, nullable=False)  
    email = db.Column(db.String(120), unique=True, nullable=False)
    nickname = db.Column(db.String(64), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sessions = db.relationship('ChatSession', backref='user', lazy=True)
    canvases = db.relationship('Canvas', back_populates='user', lazy=True, cascade="all, delete-orphan")

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(64), db.ForeignKey('chat_sessions.session_id'), nullable=False)
    role = db.Column(db.String(16), nullable=False)  # "user" or "assistant"
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Canvas(db.Model):
    __tablename__ = 'canvases'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), default="新建画布")
    
    # 外键，将画布与用户关联起来
    user_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    name = db.Column(db.String(100), nullable=False, default='新建画布')
    lesson_count = db.Column(db.Integer, nullable=False, default=1)
    lesson_duration = db.Column(db.Integer, nullable=False, default=45)
    subject = db.Column(db.String(50), nullable=False, default='其他')
    # 记录创建和更新时间
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联回 User 模型
    user = db.relationship('User', back_populates='canvases')

    nodes = db.relationship('CanvasNode', back_populates='canvas', lazy=True, cascade="all, delete-orphan")
    edges = db.relationship('CanvasEdge', back_populates='canvas', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Canvas {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'lesson_count': self.lesson_count,
            'lesson_duration': self.lesson_duration,
            'subject': self.subject,
            'updated_at': self.updated_at.isoformat(),
            'nodes': [node.to_dict() for node in self.nodes], # 包含卡片数据
            'edges': [edge.to_dict() for edge in self.edges]  # 包含连线数据
        }


class CanvasNode(db.Model):
    __tablename__ = 'canvas_nodes'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    canvas_id = db.Column(db.Integer, db.ForeignKey('canvases.id'), nullable=False)
    
    # 卡片数据 (JSON 格式)
    tag = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    sources = db.Column(db.JSON, nullable=True)
    position_x = db.Column(db.Float, nullable=False)
    position_y = db.Column(db.Float, nullable=False)
    
    # 关联回 Canvas
    canvas = db.relationship('Canvas', back_populates='nodes')
    
    def to_dict(self):
        return {
            'id': self.id,
            'type': 'infoNode',
            'position': { 'x': self.position_x, 'y': self.position_y },
            'data': {
                'id': self.id,
                'tag': self.tag,
                'title': self.title,
                'description': self.description,
                'sources': self.sources
            }
        }


class CanvasEdge(db.Model):
    __tablename__ = 'canvas_edges'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    canvas_id = db.Column(db.Integer, db.ForeignKey('canvases.id'), nullable=False)

    # 连线数据
    source = db.Column(db.String(36), nullable=False)
    target = db.Column(db.String(36), nullable=False)
    label = db.Column(db.String(255), nullable=True, default="关联")

    # 关联回 Canvas
    canvas = db.relationship('Canvas', back_populates='edges')

    def to_dict(self):
        return {
            'id': self.id,
            'source': self.source,
            'target': self.target,
            'label': self.label,
            'animated': True,
            'style': { 'stroke': '#9e9e9e', 'strokeWidth': 2 },
            'labelBgPadding': [8, 4],
            'labelBgBorderRadius': 4,
            'labelBgStyle': { 'fill': '#ffffff', 'color': '#333' },
            'labelStyle': { 'fill': '#333', 'fontWeight': 600 },
            'markerEnd': { 'type': 'arrowclosed' },
        }

class UserActivityLog(db.Model):
    __tablename__ = 'user_activity_log'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    canvas_id = db.Column(db.Integer, db.ForeignKey('canvases.id'), nullable=True) # 可以为空，例如创建画布的操作
    action = db.Column(db.String(50), nullable=False) # 例如 'create_node', 'update_node', 'delete_node'
    entity_type = db.Column(db.String(20), nullable=False) # 'canvas', 'node', 'edge'
    entity_id = db.Column(db.String(36), nullable=True) # 被操作的实体ID
    details = db.Column(JSON, nullable=True) # 存储具体变化，如{'old': {...}, 'new': {...}}
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'canvas_id': self.canvas_id,
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'details': self.details,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
