from app import create_app,db 
from datetime import timedelta
from flask_migrate import Migrate
app = create_app()
app.secret_key = 'avgaophgasoga9103cxfnj09'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)

if __name__ == '__main__':


    migrate = Migrate(app, db)
    app.run(debug=True,port="5000",host="0.0.0.0")