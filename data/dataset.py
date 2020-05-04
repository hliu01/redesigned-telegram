import sqlite3

DB_FILE = "boop.db"

db = sqlite3.connect(DB_FILE)
c = db.cursor()


def makeData(dataType, country, startDate, endDate, cell):
    print(startDate + ":" + endDate)
    if startDate < "2020-01-22" and endDate > "2020-04-25":
        makeData(dataType, country, "2020-01-22", "2020-04-25", cell)
    elif startDate < "2020-01-22":
        makeData(dataType, country, "2020-01-22", endDate, cell)
    elif endDate > "2020-04-25":
        makeData(dataType, country, startDate, "2020-04-25", cell)
    else:
        dataset = open('dataset{}.csv'.format(cell), 'w')
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

# makeData("World","2020-01-10","2020-02-04")
