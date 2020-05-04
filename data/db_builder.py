

import sqlite3   #enable control of an sqlite database
import csv       #facilitate CSV I/O


countryIdx = {'World': 0}
with open('covidData/countries-aggregated.csv') as f:
    for line in f.readlines():
        name=line.split(',')[1]
        if name != 'country' and name not in countryIdx.keys():
            countryIdx[name] = len(countryIdx)

DB_FILE = "boop.db"

db = sqlite3.connect(DB_FILE) #open if file exists, otherwise create
c = db.cursor()   #facilitate db ops

c.execute('CREATE TABLE IF NOT EXISTS countries(name text, id integer primary key);')
c.execute('CREATE TABLE IF NOT EXISTS data(countryID integer, date blob, confirmed integer, deaths integer , recovered integer);')
c.execute('INSERT OR REPLACE INTO countries(name , id) VALUES("World",0);')
with open('covidData/countries-aggregated.csv', newline='\n') as countries:
    reader = csv.DictReader(countries)
    for row in reader:
        countryCommand = 'INSERT OR REPLACE INTO countries(name, id) VALUES(\"' + row['country'] + '\", ' + str(countryIdx[row['country']]) + ');'
        c.execute(countryCommand)
        command = 'INSERT INTO data(countryID, date, confirmed, deaths, recovered) VALUES(' + str(countryIdx[row['country']]) + ', \"'+ row['date'] + '\", ' + row['confirmed'] + ', ' + row['Deaths'] + ', ' + row['Recovered'] + ');'
        print(command)
        c.execute(command)





with open('covidData/worldwide-aggregated.csv', newline='\n') as worldwide:
    reader = csv.DictReader(worldwide)
    for row in reader:
        command = 'INSERT INTO data(countryID, date, confirmed, deaths, recovered) VALUES(0, \"' + row['date'] + '\", ' + row['confirmed'] + ', ' + row['Deaths'] + ', ' + row['Recovered'] + ');'
        print(command)
        c.execute(command)

db.commit()