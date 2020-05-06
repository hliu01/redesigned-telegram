

import sqlite3   #enable control of an sqlite database
import csv       #facilitate CSV I/O
import urllib.request
import json

countryIdx = {'World': 0}
with open('app/covidData/countries-aggregated.csv') as f:
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
        #print(row)
        command = 'INSERT INTO data(countryID, date, confirmed, deaths, recovered) VALUES(' + str(countryIdx[row['country']]) + ', \"'+ row['date'] + '\", ' + row['confirmed'] + ', ' + row['deaths'] + ', ' + row['recovered'] + ');'
        #print(command)
        c.execute(command)

with open('covidData/worldwide-aggregated.csv', newline='\n') as worldwide:
    reader = csv.DictReader(worldwide)
    for row in reader:
        command = 'INSERT INTO data(countryID, date, confirmed, deaths, recovered) VALUES(0, \"' + row['date'] + '\", ' + row['confirmed'] + ', ' + row['deaths'] + ', ' + row['recovered'] + ');'
        #print(command)
        c.execute(command)

end_date = '2020-04-25'
currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY']
req_url = 'https://api.exchangeratesapi.io/history?start_at=2020-01-22&end_at=2020-04-25&symbols=USD,GBP,JPY,CNY'



c.execute('CREATE TABLE IF NOT EXISTS currency(base text, date text , USD integer, EUR integer, GBP integer, JPY integer, CNY integer);')
#c.execute('INSERT INTO currency(base,date,USD,EUR,GBP,JPY,CNY) VALUES(')
for code in currencies:
    if code == 'EUR':
        data = json.loads(urllib.request.urlopen(req_url).read())['rates']
        for date in data:
            c.execute('INSERT INTO currency(base,date,USD,EUR,GBP,JPY,CNY) VALUES(\"{}\",\"{}\",{},{},{},{},{});'.format('EUR',date,data[date]['USD'],1,data[date]['GBP'],data[date]['JPY'],data[date]['CNY']))
    else:
        data = json.loads(urllib.request.urlopen(req_url + ',EUR&base=' + code).read())['rates']
        for date in data:
            c.execute('INSERT INTO currency(base,date,USD,EUR,GBP,JPY,CNY) VALUES(\"{}\",\"{}\",{},{},{},{},{});'.format(code, date, data[date]['USD'], data[date]['EUR'], data[date]['GBP'], data[date]['JPY'], data[date]['CNY']))


db.commit()
