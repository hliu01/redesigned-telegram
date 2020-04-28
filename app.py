import csv
from flask import Flask, render_template, jsonify
app = Flask(__name__)


@app.route("/")
def root():
    return render_template("index.html")

if __name__ == "__main__":
    app.debug = True
    app.run()
