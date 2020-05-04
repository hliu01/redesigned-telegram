from flask import *
from data.dataset import *

app = Flask(__name__)

makeData("China", "2020-03-01", "2020-04-01", 0)


@app.route("/")
def root():
    return render_template("index.html")


@app.route("/a")
def oneChart():
    #makeData("China", "2020-03-01", "2020-04-01", 0)
    return render_template("index.html")

@app.route("/b")
def twocharts():
    #makeData("China", "2020-03-01", "2020-04-01", 0)
    #makeData("US", "2020-03-01", "2020-04-01", 1)
    return render_template("index.html")



# @app.route("/changedofnow")
# def chanedfornow():
#     return render_template("index.html")

# @app.route("/ok")
# def cool():
#     return render_template("ok.html")

if __name__ == "__main__":
    app.debug = True
    app.run()
