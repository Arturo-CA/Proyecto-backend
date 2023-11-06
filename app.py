from flask import Flask, render_template
from database import db
from routes.routes import routes  # Importa las rutas desde el archivo routes.py

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'  # Ruta a la base de datos SQLite

db.init_app(app)

app.register_blueprint(routes)  # Registra el blueprint

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host="192.168.1.3", port=5000)
