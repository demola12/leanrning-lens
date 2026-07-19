from flask import Flask, request, jsonify
import ollama
import base64
import os
import tempfile

app = Flask(__name__)


def encode_image(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def analyze_image(image_path):

    image_base64 = encode_image(image_path)

    response = ollama.chat(
        model="qwen2.5vl:3b",
        messages=[
            {
                "role": "user",
                "content": """
Extract all text from this document image.

Requirements:
- Return markdown format.
- Preserve headings.
- Extract tables if present.
- Describe important images.
- Include page structure.
""",
                "images": [image_base64]
            }
        ]
    )

    return response["message"]["content"]


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok"
    })


@app.route("/analyze", methods=["POST"])
def analyze():

    if "file" not in request.files:
        return jsonify({
            "error": "No image uploaded"
        }), 400

    image = request.files["file"]

    with tempfile.TemporaryDirectory() as tmp:

        image_path = os.path.join(
            tmp,
            image.filename
        )

        image.save(image_path)

        try:
            markdown = analyze_image(image_path)

            return jsonify({
                "status": "success",
                "markdown": markdown
            })

        except Exception as e:

            return jsonify({
                "status": "error",
                "message": str(e)
            }), 500


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000
    )