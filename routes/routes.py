# routes.py
from flask import Blueprint, jsonify, request
from models import GPSData  # Asegúrate de importar los modelos adecuados
from database import db  # Importa la instancia de la base de datos
from sqlalchemy.exc import SQLAlchemyError

routes = Blueprint('routes', __name__)

# Otras rutas y vistas que no están relacionadas con la API de GPS

# Ruta para recibir datos de GPS (POST request)
@routes.route('/gps', methods=['POST'])
def receive_gps_data():

    try:
        data = request.get_json()

        # Asegúrate de que los datos de latitud y longitud están presentes en la solicitud JSON
        latitude = data.get('lat')
        longitude = data.get('lon')

        if latitude is None or longitude is None:
            return jsonify({'error': 'Datos invalidos'}), 400

        gps_data = GPSData(latitude=latitude, longitude=longitude)

        db.session.add(gps_data)
        db.session.commit()
        return jsonify({'message': 'Datos guardados correctamente'}), 201



    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Ruta para obtener los datos de GPS (GET request)
@routes.route('/gps', methods=['GET'])
def get_gps_data():
    try:
        # Consulta la base de datos para obtener los datos de GPS más recientes
        latest_gps_data = db.session.query(GPSData).order_by(GPSData.id.desc()).first()

        if latest_gps_data:
            gps_data = {
                'latitude': latest_gps_data.latitude,
                'longitude': latest_gps_data.longitude
            }
            return jsonify(gps_data)
        else:
            return jsonify({'error': 'No se encontraron datos de GPS'}), 404
    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500
