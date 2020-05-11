// sets graph width
let graph1Container = document.getElementById("col-graph");
let graph1 = document.getElementById("graph1");
graph1.setAttribute("width", graph1Container.offsetWidth - 40);

const currency_base = "";
const currencies = [];
const covid_data = "";
const countries = [];


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
// d3.csv(
// 	"https://raw.githubusercontent.com/hliu01/redesigned-telegram/master/app/data/covidData/worldwide-aggregated.csv",
// 	parse_covid
// ).then(
// 	(data) => {
// 		let graph = new LineGraph(d3.select("#graph1"), {top: 10, bottom: 30, left: 70, right: 70});
// 		let params = {x: 'date', y: 'deaths'};
// 		let domain = Graph.domain(data, params);

// 		graph.generate_axis("bottom", domain.x);
// 		graph.generate_axis("right", domain.y);

// 		graph.graph(data, "deaths", params, duration, "white");
// 	}
// );