// sets graph width
let graph1Container = document.getElementById("col-graph");
let graph1 = document.getElementById("graph1");
graph1.setAttribute("width", graph1Container.offsetWidth - 40);

// EXAMPLES AS DEFAULT
// SET BY USER IN PRODUCTION
var currency_base = "USD";
const currencies = [];
var covid_param = "confirmed";
const countries = [];
const start = "2020-01-20";
const end = "2020-04-20";

const parseDate = d3.timeParse("%Y-%m-%d");
/** Returns function that parses date and desired dependent from dataset
 * @param {string} param - desired dependent variable
 */
const parse_param = function(param) {
	return (datum) => {
		return {
			date: parseDate(datum.date),
			param: parseFloat(datum[param])
		};
	};
};
const parse_covid = function(datum) {
	return {
		date: date_parse(datum.date),
		confirmed: parseInt(datum.confirmed),
		recovered: parseInt(datum.recovered),
		deaths: parseInt(datum.deaths)
	};
};


/** Uses constants to generate requests for data
 */
const generate_requests = function() {
	/** Returns an appropriately formatted request for data
	 * @param {string} dataset - takes the values "covid" or "currency"
	 * @param {string} member - named appropriately to the dataset
	 * @param {string} start_time - formatted YYYY-MM-DD
	 * @param {string} end_time - formatted YYYY-MM-DD
	 */
	let format_url = function(dataset, member, start_time, end_time, cell=0) {
		if (dataset != "covid" && dataset != "currency") {
			throw "Invalid dataset";
		};
		return `/data?dataset=${dataset == "covid" ? 0 : 1}&country=${member}&beginDate=${start_time}&endDate=${end_time}&cell=${cell}`;
	};

	let currency_requests = [];
	for (let i = 0; i < currencies.length; i++) {
		currency_requests.push({
			url: format_url("currency", currency_base, start, end, i),
			param: currencies[i]
		});
	};

	let covid_requests = [];
	for (let i = 0; i < countries.length; i++) {
		covid_requests.push({
			url: format_url("covid", countries[i], start, end, i),
			param: covid_param
		})
	}

	return {
		covid: covid_requests,
		currency: currency_requests
	}
}

/**
 *
 * @param {Object[]} requests - array of objects
 * @param {string} requests[].url - request url
 * @param {string} requests[].param - independent variable
 * @param {(data) => {}} callback
 */
const read_all = function(requests, callback) {
	for (let i = 0; i < requests.length; i++) {
		requests[i] = d3.csv(requests[i].url, parse_param(requests[i].param));
	};
	Promise.all(requests).then((values) => {
		callback(values);
	});
};

main = function() {
	let duration = 10000;
	let requests = generate_requests();
	let graph = new LineGraph(d3.select("#graph1"), {top: 10, bottom: 30, left: 70, right: 70});

	read_all(
		requests.covid,
		(covid_data) => {
			read_all(
				requests.currency,
				(currency_data) => {
					for (let i in covid_data) {
						graph.add_data(covid_data[i], countries[i], "left");
					};
					for (let i in currency_data) {
						graph.add_data(currency_data[i], currencies[i], "right");
					};
					graph.generate_axes()
					graph.graph_all(duration, "white");
				}
			)
		}
	);

	document.getElementById("graph1").innerHTML = "";
}

const covidChoices = ["United States",
	"Germany",
	"United Kingdom",
	"France",
	"Italy",
	"Japan",
	"China"];

const currencyChoices = {
	"USD":"United States Dollar",
	"EUR":"Euro",
	"GBP":"British Pounds",
	"JPY":"Japanese Yen",
	"CNY":"Chinese Yuan"};

const parameterChoices = {
	'deaths':'Deaths',
	'confirmed':'Confirmed Cases',
	'recovered':'Recovered'
}

// creates options based on the input
// #*-input-col and one of the constants *Choices
const createCheckboxesOf = function(sideID, choices) {
	// determine which array is being used
	var choiceIDs;
	if (choices[0] == undefined) {
		choiceIDs = Object.keys(choices);
	}
	else {
		choiceIDs = choices;
	}
	var choicelabels = Object.values(choices);

	// select in input selections
	// choose depending on side
	// create form-check
	// create form-input
	// create form-label

	d3.select(sideID)
		.select(".input-options")
		.selectAll("div")
		// creates outer form check block
		.data(choiceIDs).enter()
		.append("div")
			.attr("class", "form-check")
			.attr("checked", "false")
			// creates actual checkbox
			.append("input")
				.attr("class", "form-check-input")
				.attr("type", "checkbox")
				.attr("id", function(d) {
					return d;
				});
	// attaches labels to checkboxes
	d3.select(sideID)
		.select(".input-options")
		.selectAll("div")
		.append("label")
			.attr("class", "form-check-label")
			.attr("for",function(d) {
				return d;
			});
	// attaches text in labels
	d3.select(sideID)
		.select(".input-options")
		.selectAll("label")
		.data(choicelabels)
		.text(function (d) {
			return d;
		});
	// adds Event listeners to check boxes
	for (let choice in choiceIDs) {
		temp = document.getElementById(choiceIDs[choice]).parentElement;
		if (choices == currencyChoices){
			temp.addEventListener("mousedown", function(e) {
				if (currencies.includes(choiceIDs[choice])) {
					//swaps last element with this element
					currencies[currencies.indexOf(choiceIDs[choice])] = currencies[currencies.length - 1];
					// removes this element
					currencies.pop();
				}
				else {
					currencies.push(choiceIDs[choice]);
				}
			})
		}
		if (choices == covidChoices){
			temp.addEventListener("mousedown", function(e) {
				if (countries.includes(choiceIDs[choice])) {
					//swaps last element with this element
					countries[countries.indexOf(choiceIDs[choice])] = countries[countries.length - 1];
					// removes this element
					countries.pop();
				}
				else {
					countries.push(choiceIDs[choice]);
				}
			})
		}
	}
}

const createDropRights = function (dropRightTag, choices) {
	var choiceIDs = Object.keys(choices);
	var choicelabels = Object.values(choices);
	//creating tag
	d3.select(dropRightTag)
		.select(".dropdown-menu")
		.selectAll("a")
		.data(choiceIDs).enter()
		.append("a")
			.attr("class", "dropdown-item")
			.attr("id", function(d) {
				return d;
			})
	d3.select(dropRightTag)
		.select(".dropdown-menu")
		.selectAll("a")
		.data(choicelabels)
		.text(function(d){
			return d;
		})
	// adding event listeners
	for (let choice in choiceIDs) {
		if (dropRightTag == "#dropdownCurrency") {
			temp = document.getElementById(choiceIDs[choice]);
			temp.addEventListener("click", function(e) {
				currency_base=choiceIDs[choice];
			})
		}
		else if (dropRightTag == "#dropdownParameter") {
			temp = document.getElementById(choiceIDs[choice]);
			temp.addEventListener("click", function(e) {
				covid_param=choiceIDs[choice];
			})
		}
	}
}

// fills in checkboxes
// fills in area for checkboxes
const fillInButtons = function() {
	createDropRights("#dropdownCurrency", currencyChoices);
	createDropRights("#dropdownParameter", parameterChoices);
	createCheckboxesOf("#left-input-col", covidChoices);
	createCheckboxesOf("#right-input-col", currencyChoices);
}

fillInButtons()

const graphButton = document.getElementById("graph-button");
graphButton.addEventListener("click", function(e) {
	main();
})
