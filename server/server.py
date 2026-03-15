from rag_chatbot import ask_monument
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from PIL import Image
import numpy as np
import io
import math

app = Flask(__name__)
CORS(app)

model = tf.keras.models.load_model('../models/my_model.h5')

class_names = [
    'Ajanta Caves', 'Charar-E- Sharif', 'Chhota_Imambara', 'Ellora Caves',
    'Fatehpur Sikri', 'Gateway of India', 'Hawa mahal', 'Humayun_s Tomb',
    'India_gate', 'Khajuraho', 'Sun Temple Konark', 'alai_darwaza',
    'alai_minar', 'basilica_of_bom_jesus', 'charminar', 'golden temple',
    'iron_pillar', 'jamali_kamali_tomb', 'lotus_temple', 'mysore_palace',
    'qutub_minar', 'tajmahal', 'tanjavur temple', 'victoria memorial'
]

destination_mapping = {
    "tajmahal": "Taj Mahal, India",
    "golden temple": "Golden Temple, India",
    "India_gate": "India Gate, India",
    "Hawa mahal": "Hawa Mahal, India",
}

# ---------------- HOME ----------------
@app.route("/")
def home():
    return "✅ Flask backend is running!"


# ---------------- IMAGE PREPROCESS ----------------
def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((224, 224))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0
    return img_array


# ---------------- PREDICT ROUTE ----------------
@app.route('/predict-destination', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        img_bytes = file.read()
        processed_image = preprocess_image(img_bytes)

        prediction_scores = model.predict(processed_image)
        predicted_index = np.argmax(prediction_scores, axis=1)[0]
        predicted_label_raw = class_names[predicted_index]

        predicted_destination = destination_mapping.get(
            predicted_label_raw,
            predicted_label_raw.replace('_', ' ').title()
        )

        return jsonify({'ok': True, 'destination': predicted_destination})

    except Exception as e:
        print(e)
        return jsonify({'error': 'Failed to process image'}), 500


# ---------------- GEMINI ABOUT ----------------
@app.route("/gemini-about", methods=["POST"])
def gemini_about():
    data = request.get_json()
    destination = data.get("destination")

    if not destination:
        return jsonify({"ok": False, "error": "No destination provided"})

    # Temporary static response (replace later with Gemini)
    return jsonify({
        "ok": True,
        "data": f"{destination} is one of the most famous heritage destinations in India known for its historical and architectural beauty."
    })


# ---------------- GEMINI TRANSPORT ----------------
@app.route("/gemini-transport", methods=["POST"])
def gemini_transport():
    data = request.get_json()
    destination = data.get("destination")
    transport_type = data.get("type")

    if not destination or not transport_type:
        return jsonify({"ok": False, "error": "Missing data"})

    # Temporary coordinates (Taj Mahal area)
    return jsonify({
        "ok": True,
        "place": {
            "name": f"Nearest {transport_type.title()}",
            "lat": 27.1751,
            "lng": 78.0421
        }
    })


# ---------------- DISTANCE CALCULATION ----------------
@app.route("/distance", methods=["POST"])
def distance():
    data = request.get_json()
    from_coords = data.get("from")
    to_coords = data.get("to")

    if not from_coords or not to_coords:
        return jsonify({"ok": False, "error": "Missing coordinates"})

    # Simple dummy calculation
    lat1 = from_coords["lat"]
    lng1 = from_coords["lng"]
    lat2 = to_coords["lat"]
    lng2 = to_coords["lng"]

    # Rough distance formula
    distance_km = round(
        math.sqrt((lat1 - lat2)**2 + (lng1 - lng2)**2) * 111,
        2
    )

    duration_min = round(distance_km * 2)  # assume ~30km/hr avg

    return jsonify({
        "ok": True,
        "distance_km": distance_km,
        "duration_min": duration_min
    })


# ---------------- CHAT ROUTE ----------------
@app.route("/chat", methods=["POST"])
def chat():
    data = request.json

    monument = data.get("monument")
    user_question = data.get("question")

    if not monument:
        return jsonify({"error": "Monument is required"}), 400

    if not user_question:
        user_question = f"Tell me about {monument}"

    answer = ask_monument(monument, user_question)

    return jsonify({"answer": answer})


# ---------------- MAIN ----------------
if __name__ == '__main__':
    app.run(debug=True, port=8000)