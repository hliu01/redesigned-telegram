from flask import *
from utl.dataMaker import *


app = Flask(__name__)


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
    cell = 0
    if 'cell' in request.args:
        cell = request.args['cell']
    # makeData("China", "2020-03-01", "2020-04-01", 0)
    # makeData("US", "2020-03-01", "2020-04-01", 1)
    makeData(dataType, country, startDate, endDate, cell)
    return send_from_directory('./data','dataset{}.csv'.format(cell))
    #return render_template("index.html")

#Covid data from 2/20 to 2/05 for the US
#/data?dataset=0&country=US&beginDate=2020-01-20&endDate=2020-02-05
#Exchange rate data with USD as base
#/data?dataset=1&country=USD&beginDate=2020-01-20&endDate=2020-02-05&cell=1

#?
#dataset = {0 for covid, 1 for exchange rates}
#country = {Exchange symbols USD,EUR,GBP,JPY,CNY or country names US,China,France,Italy (check original csv for spelling
#beginDate = can be any date before the endDate, a date before the first date will automatically pass as the first available date
#endDate = opposite
#optional: cell = {number for filename dataset<n>.csv, default value is 0 : dataset0.csv}

if __name__ == "__main__":
    app.debug = True
    app.run()
