from flask import *
#from data.dataset import *
import sqlite3

app = Flask(__name__)

#makeData(0, "China", "2020-03-01", "2020-04-01", 0)


@app.route("/")
def root():
    return render_template("index.html")


@app.route("/data")
def getData():
    print(request.args)
    dataType = request.args['dataset']
    country = request.args['country']
    startDate = request.args['beginDate']
    endDate = request.args['endDate']
    #makeData("China", "2020-03-01", "2020-04-01", 0)
    #makeData("US", "2020-03-01", "2020-04-01", 1)
    makeData(0, country, startDate, endDate, 0)
    return render_template("index.html")



def makeData(dataType, country, startDate, endDate, cell):
    db = sqlite3.connect("data/boop.db")
    c = db.cursor()
    print(startDate + ":" + endDate)
    if startDate < "2020-01-22" and endDate > "2020-04-25":
        makeData(dataType, country, "2020-01-22", "2020-04-25", cell)
    elif startDate < "2020-01-22":
        makeData(dataType, country, "2020-01-22", endDate, cell)
    elif endDate > "2020-04-25":
        makeData(dataType, country, startDate, "2020-04-25", cell)
    else:
        dataset = open('data/dataset{}.csv'.format(cell), 'w')
        dataset.write('country,date,confirmed,deaths,recovered\n')
        idx = c.execute('SELECT id FROM countries WHERE name="{}";'.format(country)).fetchall()[0][0]
        arr = c.execute('SELECT date, confirmed, deaths, recovered FROM data WHERE countryId="{}";'.format(idx)).fetchall()
        for entry in arr:
            if entry[0] >= startDate and entry[0] <= endDate:
                line = country
                for item in entry:
                    line += "," + str(item)
                dataset.write(line + "\n")
        dataset.close()

if __name__ == "__main__":
    app.debug = True
    app.run()
