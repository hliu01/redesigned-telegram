from flask import *
from data.dataset import *

app = Flask(__name__)

makeData("China", "2020-03-01", "2020-04-01", 0)


@app.route("/")
def root():
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
