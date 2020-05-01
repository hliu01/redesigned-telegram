import json

countryData = open("./covidData/countries-aggregated.csv", "r").readlines()[1:]
worldData = open("./covidData/worldwide-aggregated.csv", "r").readlines()[1:]

#countryData = open("countries-aggregated.csv", "r").readlines()[1:]
#worldData = open("worldwide-aggregated.csv", "r").readlines()[1:]

countryIdx = {0: "World"}
dateIdx = {}
dateXcountry = []
countryXdate = []
def addCountryName(name):
    if name not in countryIdx.values():
        countryIdx[len(countryIdx)] = name
    return list(countryIdx.keys())[list(countryIdx.values()).index(name)]


def addDate(date):
    if date not in dateIdx.values():
        dateIdx[len(dateIdx)] = date
    return list(dateIdx.keys())[list(dateIdx.values()).index(date)]


def arrTypeA():

    date = ""
    counter = -1
    for line in countryData:
        # seperates into array without \n
        line = line[:-1].split(',')
        if line[0] != date:
            # update date (line of new array data will be entered)
            date = line[0]
            counter += 1
            # seperates world date for the date without \n
            worldLine = worldData[counter][:-1].split(',')
            entry = []
            entry.append(date)
            entry.append(worldLine[1:4])
            for x in range(186):
                entry.append('')
            dateXcountry.append(entry)
        idx = addCountryName(line[1]) + 1
        if dateXcountry[counter][idx] != '':
            # should be empty
            print('wat', end=' ')
            # print(counter,idx,end=' ')
            # print(countryIdx[idx])
        else:
            dateXcountry[counter][idx] = line[2:5]

    #for boop in dateXcountry:
        #print(boop)
    return dateXcountry

def arrTypeB():

    # other type
    entry = ['World']
    for x in range(95):
        entry.append('')
    countryXdate.append(entry)
    counter = 0
    for worldLine in worldData:
        worldLine = worldLine[:-1].split(',')
        counter += 1
        countryXdate[0][counter] = worldLine[1:4]

    for line in countryData:
        # seperates into array without \n
        line = line[:-1].split(',')
        if addCountryName(line[1]) + 1 > len(countryXdate):
            # create new line with the country
            entry = [line[1]]
            for x in range(95):
                entry.append('')
            countryXdate.append(entry)
        idx = addDate(line[0]) + 1

        if countryXdate[addCountryName(line[1])][idx] != '':
            # should be empty
            print('wat')
        else:
            countryXdate[addCountryName(line[1])][idx] = line[2:5]

    #for beep in countryXdate:
        #print(beep)
    return countryXdate
