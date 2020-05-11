// sets graph width
let graph1Container = document.getElementById("col-graph");
let graph1 = document.getElementById("graph1");
graph1.setAttribute("width", graph1Container.offsetWidth - 40);

var currency_base = "";
var currencies = [];
var covid_data = "";
var countries = [];

const date_parse = d3.timeParse("%Y-%m-%d");
const parse_covid = function(datum) {
	return {
		date: date_parse(datum.date),
		confirmed: parseInt(datum.confirmed),
		recovered: parseInt(datum.recovered),
		deaths: parseInt(datum.deaths)
	};
}
const duration = 10000;
const datasets = [];

const read_all = function(requests, callback) {
	for (let i = 0; i < requests.length; i++) {
		requests[i] = d3.csv(requests[i], parse_covid);
	}
	Promise.all(requests).then((values) => {
		callback(values);
	})
};
read_all(
	["https://raw.githubusercontent.com/hliu01/redesigned-telegram/master/app/data/covidData/worldwide-aggregated.csv"],
	(data) => {
		let graph = new LineGraph(d3.select("#graph1"), {top: 10, bottom: 30, left: 70, right: 70});
		let params = {x: 'date', y: 'deaths'};
		let domain = Graph.domain(data[0], params);

		graph.generate_axis("bottom", domain.x);
		graph.generate_axis("right", domain.y);

		graph.graph(data[0], "deaths", params, duration, "white");
	}
)

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
				});
			}
			// adds comparison currencies
			if (datasetSide == "right") {
				currencyButtons[i].addEventListener("click", function(e) {
					currencies.push(currencyButtons[i].getAttribute("value"));
					d3.select("#options-menu")
						.attr("hidden", true);
					revealRightDataset();
				});
			}
		}
	}
	else if (keyword == "Covid") {
		for (let i = 0; i < covidChoices.length; i+=1) {
			if (!(covid_data == covidChoices[i] || countries.includes(covidChoices[i]))) {
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
				});
			}
			// adds comparison currencies
			if (datasetSide == "right") {
				countryButtons[i].addEventListener("click", function(e) {
					countries.push(countryButtons[i].getAttribute("value"));
					d3.select("#options-menu")
						.attr("hidden", true);
					revealRightDataset();
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
