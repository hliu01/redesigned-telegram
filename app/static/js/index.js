// sets graph width
let graph1Container = document.getElementById("col-graph");
let graph1 = document.getElementById("graph1");
graph1.setAttribute("width", graph1Container.offsetWidth - 40);

// EXAMPLES AS DEFAULT
// SET BY USER IN PRODUCTION
var currency_base = "USD";
var currencies = [];
const covid_param = "confirmed";
var countries = [];
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
}

main();

const covidChoices = ["US",
	"Germany",
	"United Kingdom",
	"France",
	"Italy",
	"Japan",
	"China"];

const currencyChoices = {"USD":"United States Dollar",
	"EUR":"Euro",
	"GBP":"British Pounds",
	"JPY":"Japanese Yen",
	"CNY":"Chinese Yuan"};

// event listeners to spawn selections options
// for left
var left = document.getElementById("left-dataset").getElementsByTagName('a');
left[0].addEventListener("click", function() {
	revealSelections(left[0].innerHTML, "left")
});
left[1].addEventListener("click", function() {
	revealSelections(left[1].innerHTML, "left")
});
// for right
var right = document.getElementById("right-dataset").getElementsByTagName('a');
right[0].addEventListener("click", function() {
	revealSelections(left[0].innerHTML, "right")
});
right[1].addEventListener("click", function() {
	revealSelections(left[1].innerHTML, "right")
});

// creates menus depending on which selections is clicked
const revealSelections = function(keyword, datasetSide) {
	//unhides options-menu
	d3.select("#options-menu")
		.attr("hidden", null)
		.select("button")
			.text(keyword)
			.enter();
	d3.select("#options-menu")
		.selectAll('a')
		.remove();
	// adds options to option menu; assigns values
	if (keyword == "Currency"){
		let currencyKeys = Object.keys(currencyChoices);
		for (let i = 0; i < currencyKeys.length; i+=1) {
			if (!(currency_base == currencyKeys[i] || currencies.includes(currencyKeys[i]))) {
				d3.select("#options-menu")
					.select("div")
					.append("a")
					.text(currencyChoices[currencyKeys[i]])
					.attr("class", "dropdown-item")
					.attr("value", currencyKeys[i]);
			}
		}
		var currencyButtons = document.getElementById("options-menu").getElementsByTagName("a");
		for (let i = 0; i < currencyButtons.length; i += 1) {
			// sets baseline currency
			if (datasetSide == "left") {
				currencyButtons[i].addEventListener("click", function(e) {
					currency_base = currencyButtons[i].getAttribute("value");
					d3.select("#options-menu")
						.attr("hidden", true);
					revealRightDataset();
					main();
				});
			}
			// adds comparison currencies
			if (datasetSide == "right") {
				currencyButtons[i].addEventListener("click", function(e) {
					currencies.push(currencyButtons[i].getAttribute("value"));
					d3.select("#options-menu")
						.attr("hidden", true);
					revealRightDataset();
					main();
				});
			}
		}
	}
	else if (keyword == "Covid") {
		for (let i = 0; i < covidChoices.length; i+=1) {
			if (!(countries.includes(covidChoices[i]))) {
				d3.select("#options-menu")
					.select("div")
					.append("a")
					.text(covidChoices[i])
					.attr("class", "dropdown-item")
					.attr("value", covidChoices[i]);
			}
		}
		var countryButtons = document.getElementById("options-menu").getElementsByTagName("a");
		for (let i = 0; i < countryButtons.length; i += 1) {
			// sets baseline country
			if (datasetSide == "left") {
				countryButtons[i].addEventListener("click", function(e) {
					covid_data = countryButtons[i].getAttribute("value");
					d3.select("#options-menu")
						.attr("hidden", true);
					revealRightDataset();
					main();
				});
			}
			// adds comparison currencies
			if (datasetSide == "right") {
				countryButtons[i].addEventListener("click", function(e) {
					countries.push(countryButtons[i].getAttribute("value"));
					d3.select("#options-menu")
						.attr("hidden", true);
					revealRightDataset();
					main();
				});
			}
		}
		}
}

// function to reveal Right Dataset and build options
const revealRightDataset = function() {
	d3.select("#right-dataset")
		.attr("hidden", null);
}
