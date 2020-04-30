import csv
from flask import Flask, render_template, jsonify
import os

app = Flask(__name__)


@app.route("/")
def root():
    return render_template("index.html")

@app.route("/ok")
def cool():
    return render_template("ok.html")

if __name__ == "__main__":
    app.debug = True
    app.run()
