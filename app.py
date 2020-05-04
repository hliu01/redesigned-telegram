from flask import *
# from static.covidData.process import *
import os
import csv

app = Flask(__name__)

# arrA = arrTypeA()
# arrB = arrTypeB()

@app.route("/")
def root():
    return render_template("index.html")

# @app.route("/changedofnow")
# def chanedfornow():
#     return render_template("index.html", arrA = arrA, arrB = arrB, countryDict = countryIdx, dateDict = dateIdx)

# @app.route("/ok")
# def cool():
#     return render_template("ok.html", arrA = arrA, arrB = arrB)

if __name__ == "__main__":
    app.debug = True
    app.run()
