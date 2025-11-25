# export_data.py
from app import create_app
from app.extensions import db
from models import User, ChatSession, ChatMessage, Canvas, UserActivityLog
import json

def export_user_data(email, output_path):
    user = User.query.filter_by(email=email).first()
    if not user:
        raise ValueError(f"用户 {email} 不存在")

    sessions = ChatSession.query.filter_by(user_id=user.user_id).all()
    session_ids = [s.session_id for s in sessions]
    chat_messages = ChatMessage.query.filter(ChatMessage.session_id.in_(session_ids)).all()
    canvases = Canvas.query.filter_by(user_id=user.user_id).all()
    activity_logs = UserActivityLog.query.filter_by(user_id=user.user_id).all()

    data = {
        "user": {
            "id": user.id,
            "user_id": user.user_id,
            "email": user.email,
            "nickname": user.nickname,
            "created_at": user.created_at.isoformat() if user.created_at else None
        },
        "chat_sessions": [
            {"session_id": s.session_id, "created_at": s.created_at.isoformat() if s.created_at else None}
            for s in sessions
        ],
        "chat_messages": [
            {"session_id": m.session_id, "role": m.role, "content": m.content,
             "created_at": m.created_at.isoformat() if m.created_at else None}
            for m in chat_messages
        ],
        "canvases": [c.to_dict() for c in canvases],
        "activity_logs": [log.to_dict() for log in activity_logs]
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    print(f"导出成功：{output_path}")

def print_all_activity_logs():
    logs = UserActivityLog.query.all()
    print(f"总共有 {len(logs)} 条记录")
    for log in logs:
        print(log.to_dict())

def print_all_user():
    users = User.query.all()
    print(f"总共有 {len(users)} 个用户")
    for user in users:
        print(user.user_id, user.id,user.email, user.nickname, user.created_at)

if __name__ == "__main__":
    app = create_app()  # 你项目里的工厂方法
    with app.app_context():  # 手动推入上下文
        export_user_data("2720454825@qq.com", "user_data.json")
