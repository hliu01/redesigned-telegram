import sqlite3
from pathlib import Path

# get path to data folder as posixpath
datadir = Path(__file__).resolve().parents[1]
# convert to a string form
datadir = datadir.as_posix();

def makeData(dataType, country, startDate, endDate, cell):
    if startDate < "2020-01-22" and endDate > "2020-05-10":
        makeData(dataType, country, "2020-01-22", "2020-05-10", cell)
    elif startDate < "2020-01-22":
        makeData(dataType, country, "2020-01-22", endDate, cell)
    elif endDate > "2020-05-10":
        makeData(dataType, country, startDate, "2020-05-10", cell)
    else:
        if dataType == '1':
            currency(country, startDate, endDate, cell)
        else:
            covid(country, startDate, endDate, cell)


def covid(country, startDate, endDate, cell):
    db = sqlite3.connect(datadir + "/data/boop.db")
    c = db.cursor()
    print('covid ' + startDate + ":" + endDate)
    idx = c.execute('SELECT id FROM countries WHERE name="{}";'.format(country)).fetchall()[0][0]
    dataset = open('data/dataset{}.csv'.format(cell), 'w')
    dataset.write('country,date,confirmed,deaths,recovered\n')
    arr = c.execute('SELECT date, confirmed, deaths, recovered FROM data WHERE countryId="{}";'.format(idx)).fetchall()
    for entry in arr:
        if startDate <= entry[0] <= endDate:
            line = country
            for item in entry:
                line += "," + str(item)
            dataset.write(line + "\n")
    dataset.close()


def currency(country, startDate, endDate, cell):
    db = sqlite3.connect("data/boop.db")
    c = db.cursor()
    print('currency ' + startDate + ":" + endDate)
    dataset = open('data/dataset{}.csv'.format(cell), 'w')
    dataset.write('base,date,USD,EUR,GBP,JPY,CNY\n')
    arr = c.execute("SELECT * FROM currency WHERE base='{}';".format(country)).fetchall()
    arr.sort()
    for entry in arr:
        if startDate <= entry[1] <= endDate:
            line = ""
            for item in entry:
                line += "," + str(item)
            dataset.write(line[1:] + "\n")
    dataset.close()
