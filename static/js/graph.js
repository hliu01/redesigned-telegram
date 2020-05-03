class Graph {
	constructor(svg_object, margins) {
		this.display = svg_object;
		this.width = svg_object.attr("width");
		this.height = svg_object.attr("height");
		this.margins = margins;
	};

	static domain(data, params) {
		return {
			x: d3.extent(data, (datum) => {return datum[params.x]}),
			y: d3.extent(data, (datum) => {return datum[params.y]}),
		};
	};

	scale_horizontal(domain) {
		let span = this.width - (this.margins.left + this.margins.right);
		let scaler = function(value) {
			let ratio = (value - domain[0]) / (domain[1] - domain[0]);
			return span * ratio;
		};
		return scaler;
	};

	scale_vertical(domain) {
		let span = this.height - (this.margins.top + this.margins.bottom);
		let scaler = function(value) {
			let ratio = (value - domain[0]) / (domain[1] - domain[0]);
			return span * (1 - ratio);
		};
		return scaler;
	};
};

class LineGraph extends Graph {
	generate_points(data, name, params) {
		let domain = Graph.domain(data, params);
		let scale_x = (datum) => {return this.scale_horizontal(domain.x)(datum[params.x]);};
		let scale_y = (datum) => {return this.scale_vertical(domain.y)(datum[params.y]);};
		this.display.append("g").attr("class", `lines ${name}`)
			.attr("transform", `translate(${GRAPH.margins.left},${GRAPH.margins.bottom})`)
			.selectAll("dot").data(data).enter().append("line")
			.attr("x1", scale_x).attr("x2", scale_x)
			.attr("y1", scale_y).attr("y2", scale_y)
			.style("stroke", "black").style("opacity", 1);
	};

	animate_lines(name, duration) {
		let lines = this.display.node()
			.querySelectorAll(`.${name}`)[0]
			.querySelectorAll("line");
		let single_step = duration / lines.length
		let line;
		for(let i = 0; i < lines.length - 1; i++) {
			line = d3.select(lines[i]);
			line.transition().duration(single_step).delay(i * single_step)
				.attr("x2", lines[i + 1].getAttribute("x1"))
				.attr("y2", lines[i + 1].getAttribute("y1"));
		}
	};

	graph(data, name, params, duration) {
		this.generate_points(data, name, params);
		this.animate_lines(name, duration);
	};
};
