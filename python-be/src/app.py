import glob
import json

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
        print(output_dir)
        try:
            result = opendataloader_pdf.convert(
                input_path=[input_pdf],
                output_dir=output_dir,
                format="markdown,json"
            )
            print("Result:", result)
            print("Output files:", os.listdir(output_dir))
            md_files = glob.glob(os.path.join(output_dir, "*.md"))
            json_files = glob.glob(os.path.join(output_dir, "*.json"))
            with open(json_files[0], "r", encoding="utf-8") as f:
                data = json.load(f)
            with open(md_files[0], "r", encoding="utf-8") as f:
                markdown = f.read()
            return jsonify({
                "status": "success",
                "result": result,
                "data": data,
                "markdown": markdown
            })

        except Exception as e:
            return jsonify({
                "error": str(e)
            }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)