from flask import Flask, g, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from .extensions import db
# from blueprints.user import get_current_user_id
from models import *
def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)
    # app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://autopbl:abcd1234@localhost/autopbl_test'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///comap.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'your-secret-key-that-should-be-kept-secret' 
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # 或 'Strict'
    app.config['SESSION_COOKIE_SECURE'] = False
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
        print("✅ Database initialized.")
    from .routes import bp_list
    for item in bp_list:
        app.register_blueprint(item)
    @app.before_request
    def load_user_to_g():
        g.current_user_id = session.get('user_id')
    return app