class Graph {

	/**
	 * @param {Selection} svg_object - d3 selection
	 * @param {Object} margins - margians prototype
	 * @param {Number} margins.top
	 * @param {Number} margins.bottom
	 * @param {Number} margins.right
	 * @param {Number} margins.left
	 */
	constructor(svg_object, margins) {
		this.display = svg_object;
		this.width = svg_object.attr("width");
		this.height = svg_object.attr("height");
		this.margins = margins;
	};

	/**
	 * @param {Object[]} data - dataset, where each row is given by a prototype `{parameter: value ...}`
	 * @param {Object} params - prototype describing the variables to graph
	 * @param {string} params.x
	 * @param {string} params.y
	 * @returns {{x: Number[], y: Number[]}} Domain of x and y
	 */
	static domain(data, params) {
		return {
			x: d3.extent(data, (datum) => {return datum[params.x]}),
			y: d3.extent(data, (datum) => {return datum[params.y]}),
		};
	};

	/** Accepts `[min, max]` to return a function which scales an input to fit within `[min, max]`.
	 * @param {Number[]} domain - array of the form `[min, max]`, which does not neccessarily need to be a `Number[]`, can be a `Date`.
	 */
	scale_horizontal(domain) {
		let span = this.width - (this.margins.left + this.margins.right);
		/** @param {Number} value */
		let scaler = function(value) {
			let ratio = (value - domain[0]) / (domain[1] - domain[0]);
			return span * ratio;
		};
		return scaler;
	};
	/** Accepts `[min, max]` to return a function which scales an input to fit within `[max, min]`.\
	 * Flipped to fit the inversion of vertical coordiantes in HTML.
	 * @param {Number[]} domain - array of the form `[min, max]`, which does not neccessarily need to be a `Number[]`, can be a `Date`.\
	 */
	scale_vertical(domain) {
		let span = this.height - (this.margins.top + this.margins.bottom);
		/** @param {Number} value */
		let scaler = function(value) {
			let ratio = (value - domain[0]) / (domain[1] - domain[0]);
			return span * (1 - ratio);
		};
		return scaler;
	};

	/** Generates axis
	 * @param {string} type -  Takes the values "left", "right", "bottom"
	 * @param {Number[]} domain - Array of the form [min, max] (a return value from `Graph.domain()`)
	 */
	generate_axis(type, domain) {
		let range = [0, 0];
		let scale;
		if (type == "bottom") {
			range[1] = this.width - (this.margins.right + this.margins.left); // sets range on graph

			scale = d3.scaleTime().domain(domain).range(range); // axis scale

			this.display.append("g")
				.attr("class", "x-axis white-path white-text")
				.attr("transform",`translate(${this.margins.left},${this.height - this.margins.bottom})`)
				.call(d3.axisBottom().scale(scale)); // add axis object
		}
		else if (type == "left" || type == "right") {
			range[0] = this.height - (this.margins.bottom + this.margins.top); // sets range on graph

			scale = d3.scaleLinear().domain(domain).range(range); // axis scale
			let translation = (type == "left" ? this.margins.left : this.width - this.margins.right); // set translation amount (to left/right margin)
			let axis = (type == "left" ? d3.axisLeft : d3.axisRight) // set appropriate d3 axis call (left/right)

			this.display.append("g")
				.attr("class", `y-axis-${type} white-path white-text`)
				.attr("transform",`translate(${translation},${this.margins.top})`)
				.call(axis().scale(scale)); // add axis object
		}
		else {
			throw "Invalid axis type";
		};

		return scale;
	};

	/** Mutates axis
	 * @param {string} type - takes the values "left", "right", "bottom"
	 * @param {Scale} scale - axis's scale, as returned from generate_axis
	 * @param {Number[]} domain - array of the form [min, max] (a return value from `Graph.domain()`)
	 * @param {Number} duration - transition duration in miliseconds
	 */
	adjust_axis(type, scale, domain, duration) {
		scale.domain(domain); // new axis scale
		if (type == "bottom") {
			console.log(this.display.select(".x-axis"));
			this.display.select(".x-axis")
				.transition().duration(duration)
				.call(d3.axisBottom().scale(scale));
		}
		else if (type == "left" || type == "right") {
			let axis = (type == "left" ? d3.axisLeft : d3.axisRight);

			this.display.select(`.y-axis-${type}`)
				.transition().duration(duration)
				.call(axis().scale(scale));
		}
		else {
			throw "Invalid axis type";
		};
	};

};

class LineGraph extends Graph {

	/** Uses dataset to generate points as zero-length lines
	 * @param {Object[]} data - dataset, where each row is given by a prototype `{parameter: value ...}`
	 * @param {string} name - name of line, for internal use (conventionally, the name of the dataset)
	 * @param {Object} params - prototype describing the variables to graph
	 * @param {string} params.x
	 * @param {string} params.y
	 * @param {string} color - color of line
	 */
	generate_points(data, name, params, color) {
		let domain = Graph.domain(data, params);
		let scale_x = (datum) => {return this.scale_horizontal(domain.x)(datum[params.x]);};
		let scale_y = (datum) => {return this.scale_vertical(domain.y)(datum[params.y]);};
		// ^ functions which scale an input to pixel size within the SVG

		this.display.append("g").attr("class", `lines ${name}`) // generate zero-length lines
			.attr("transform", `translate(${this.margins.left},${this.margins.top})`)
			.selectAll("dot").data(data).enter().append("line")
			.attr("x1", scale_x).attr("x2", scale_x)
			.attr("y1", scale_y).attr("y2", scale_y)
			.style("stroke", color).style("opacity", 1);
	};

	/** Animates drawing of line graph
	 * @param {string} name - name of line group (set by `generate_points`) to animate
	 * @param {Number} duration - total duration of graphing animation in miliseconds
	 */
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
		};
	};

	/** Graphs a dataset. Wrapper for `generate_points` and `animate_lines`.
	 * @param {Object[]} data - dataset, where each row is given by a prototype `{parameter: value ...}`
	 * @param {string} name - name of line, for internal use (conventionally, the name of the dataset)
	 * @param {Object} params - prototype describing the variables to graph
	 * @param {string} params.x
	 * @param {string} params.y
	 * @param {Number} duration - total duration of graphing animation in miliseconds
	 */
	graph(data, name, params, duration, color) {
		this.generate_points(data, name, params, color);
		this.animate_lines(name, duration);
	};
};
