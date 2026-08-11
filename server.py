from flask import Flask, send_from_directory
from pathlib import Path

BASE = Path(__file__).resolve().parent
app = Flask(__name__, static_folder='static')

@app.get('/')
def home():
    return send_from_directory(BASE, 'index.html')

@app.get('/health')
def health():
    return {'status': 'ok', 'app': 'Indo'}

@app.get('/static/<path:path>')
def static_files(path):
    return send_from_directory(BASE / 'static', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
