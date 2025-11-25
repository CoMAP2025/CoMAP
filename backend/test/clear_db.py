# clear_db.py
import sys
import os

# 确保 Python 能够找到 app 模块
# 如果你的文件在 backend/clear_db.py，这行代码是必须的
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from app import create_app
from app.extensions import db
from models import Canvas

# 创建应用实例
app = create_app()

with app.app_context():
    try:
        # 清空 Map 表
        num_rows_deleted = db.session.query(Canvas).delete()
        db.session.commit()
        print(f"✅ Successfully deleted {num_rows_deleted} rows from the maps table.")
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ An error occurred: {e}")