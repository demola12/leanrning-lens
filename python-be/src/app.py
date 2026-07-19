from flask import Flask, request, jsonify
import os
import tempfile
import opendataloader_pdf

app = Flask(__name__)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/extract", methods=["POST"])
def extract_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No PDF file provided"}), 400

    pdf_file = request.files["file"]

    with tempfile.TemporaryDirectory() as tmpdir:
        input_pdf = os.path.join(tmpdir, pdf_file.filename)
        output_dir = os.path.join(tmpdir, "output")

        os.makedirs(output_dir, exist_ok=True)

        pdf_file.save(input_pdf)

        try:
            result = opendataloader_pdf.convert(
                input_path=[input_pdf],
                output_dir=output_dir,
                format="markdown,json"
            )

            return jsonify({
                "status": "success",
                "result": result
            })

        except Exception as e:
            return jsonify({
                "error": str(e)
            }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)