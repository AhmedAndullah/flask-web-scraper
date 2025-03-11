from flask import Flask, render_template, request, jsonify
from scraper.scraper import fetch_html
from flask_caching import Cache
import os
import firebase_admin
from firebase_admin import credentials, firestore
import json

app = Flask(__name__)
cache = Cache(app, config={"CACHE_TYPE": "simple"})

# Initialize Firebase
firebase_credentials_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")
if not firebase_credentials_json:
    raise ValueError("Environment variable GOOGLE_APPLICATION_CREDENTIALS_JSON is not set")

# Parse the JSON string into a dictionary
try:
    firebase_credentials = json.loads(firebase_credentials_json)
except json.JSONDecodeError as e:
    raise ValueError(f"Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON: {e}")

# Initialize Firebase directly with the dictionary
cred = credentials.Certificate(firebase_credentials)
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

def detect_browser(user_agent):
    """Detect browser based on user-agent string."""
    user_agent = user_agent.lower()
    if "chrome" in user_agent and "edg" not in user_agent:
        return "chrome"
    elif "edg" in user_agent:  # Edge contains "edg" in user-agent
        return "edge"
    elif "safari" in user_agent and "chrome" not in user_agent:
        return "safari"
    elif "firefox" in user_agent:
        return "firefox"
    elif "opera" in user_agent or "opr" in user_agent:
        return "opera"
    else:
        return "edge"  # Default to Edge if unknown

@app.route("/")
@cache.cached(timeout=60)  # Refresh every 60 seconds
def index():
    browser = detect_browser(request.user_agent.string)
    print(f"Detected browser: {browser}")
    html_content = fetch_html(browser)

    # Debugging modification (using BeautifulSoup)
    from bs4 import BeautifulSoup
    modified_sources = [tag['src'] for tag in BeautifulSoup(html_content, 'html.parser').find_all(src=True)][:10]
    print("===== VERIFIED MODIFIED HTML SNIPPET =====")
    print(modified_sources)
    print("=================================")

    return render_template('index.html', html_content=html_content)

@app.route('/emergency-contact')
def emergency_contact():
    return render_template('emergency-contact.html')

# Route to get all contacts
@app.route('/get-contacts', methods=['GET'])
def get_contacts():
    contacts_ref = db.collection('contacts').get()
    contacts = [{"name": doc.to_dict()['name'], 
                 "phone": doc.to_dict()['phone'], 
                 "days": doc.to_dict()['days'], 
                 "notes": doc.to_dict().get('notes', '')} for doc in contacts_ref]
    return jsonify(contacts)

# Route to add a new contact
@app.route('/add-contact', methods=['POST'])
def add_contact():
    data = request.get_json()
    db.collection('contacts').add({
        'name': data['name'],
        'phone': data['phone'],
        'days': data['days'],
        'notes': data.get('notes', '')  # Notes are optional, default to empty string
    })
    return jsonify({"status": "success"})

# Route to delete a contact
@app.route('/delete-contact/<int:index>', methods=['DELETE'])
def delete_contact(index):
    contacts_ref = db.collection('contacts')
    docs = contacts_ref.get()
    if 0 <= index < len(docs):
        doc_id = docs[index].id
        contacts_ref.document(doc_id).delete()
        return jsonify({"status": "success"})
    else:
        return jsonify({"status": "error", "message": "Invalid index"}), 400

# ================== NEW NOTE STORAGE SYSTEM ==================

# Route to get all notes
@app.route('/get-notes', methods=['GET'])
def get_notes():
    notes_ref = db.collection('notes').get()
    notes = [{"id": doc.id, "notes": doc.to_dict().get("notes", "")} for doc in notes_ref]
    return jsonify(notes)

# Route to save a new note
@app.route('/save-notes', methods=['POST'])
def save_notes():
    data = request.get_json()
    note = data.get('notes', '')

    if not note:
        return jsonify({"status": "error", "message": "Note content is required"}), 400

    db.collection('notes').add({"notes": note})
    return jsonify({"status": "success"})

# Route to delete a note
@app.route('/delete-note/<note_id>', methods=['DELETE'])
def delete_note(note_id):
    notes_ref = db.collection('notes')
    doc = notes_ref.document(note_id).get()

    if doc.exists:
        notes_ref.document(note_id).delete()
        return jsonify({"status": "success"})
    else:
        return jsonify({"status": "error", "message": "Note not found"}), 404

if __name__ == "__main__":
    import os
    if os.name == "nt":  # Windows
        from waitress import serve
        print("Running on Windows with Waitress...")
        serve(app, host="0.0.0.0", port=8080)
    else:  # Linux/macOS (for Render)
        from gunicorn.app.wsgiapp import run
        print("Running on Render with Gunicorn...")
        run()


