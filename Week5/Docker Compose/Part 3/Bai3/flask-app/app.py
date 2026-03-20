from flask import Flask
import socket

app = Flask(__name__)


@app.route("/")
def home():
    hostname = socket.gethostname()
    return f"<h2>Hello from Flask!</h2><p>Handled by container: <strong>{hostname}</strong></p>"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
