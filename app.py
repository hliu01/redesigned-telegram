from flask import Flask, render_template
from covidData.process import *

app = Flask(__name__)

arrA = arrTypeA()
arrB = arrTypeB()


@app.route("/")
def root():
    return render_template("index.html", arrA = arrA, arrB = arrB, countryDict = countryIdx, dateDict = dateIdx)

@app.route("/ok")
def cool():
    return render_template("ok.html", arrA = arrA, arrB = arrB)

if __name__ == "__main__":
    app.debug = True
    app.run()
