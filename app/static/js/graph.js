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
		this.data = [];
	};

	/** Associates dataset with graph
	 * @param {Object[]} data - dataset, where each row is given by `{date: ..., param: ...}`
	 * @param {string} name - dataset name
	 * @param {name} axis - takes the values "left", "right"
	 */
	add_data(data, name, axis) {
		this.data.push({
			data: data,
			axis: axis,
			name: name
		});
	};

	/** Determines the overall domain of the variables on a particular axis.
	 * @param {string} axis - takes the values "left", "right", "bottom"
	 */
	axis_domain(axis) {
		let limits = [];
		for (let i = 0; i < this.data.length; i++) {
			if (axis == "bottom") {
				let extent = d3.extent(this.data[i].data, (datum) => {return datum.date});
				limits.push(extent[0]);
				limits.push(extent[1]);
			}
			else if (this.data[i].axis == axis) {
				let extent = d3.extent(this.data[i].data, (datum) => {return datum.param});
				limits.push(extent[0]);
				limits.push(extent[1]);
			};
		};
		return d3.extent(limits);
	}

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
	 * @param {Number[]} domain - array of the form `[min, max]`, which does not neccessarily need to be a `Number[]`, can be a `Date`.\
	 */
	scale_vertical(domain) {
		let span = this.height - (this.margins.top + this.margins.bottom);
		/** @param {Number} value */
		let scaler = function(value) {
			let ratio = (value - domain[0]) / (domain[1] - domain[0]);
			return span * (1 - ratio); // ratio flipped to fit inversion of vertical coordinates in HTML
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
				.attr("class", "bottom-axis white-path white-text")
				.attr("transform",`translate(${this.margins.left},${this.height - this.margins.bottom})`)
				.call(d3.axisBottom(scale)); // add axis object
		}
		else if (type == "left" || type == "right") {
			range[0] = this.height - (this.margins.bottom + this.margins.top); // sets range on graph

			scale = d3.scaleLinear().domain(domain).range(range); // axis scale
			let translation = (type == "left" ? this.margins.left : this.width - this.margins.right); // set translation amount (to left/right margin)
			let axis = (type == "left" ? d3.axisLeft : d3.axisRight) // set appropriate d3 axis call (left/right)

			this.display.append("g")
				.attr("class", `${type}-axis white-path white-text`)
				.attr("transform",`translate(${translation},${this.margins.top})`)
				.call(axis(scale)); // add axis object
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
		scale.domain(domain); // new scale domain
		let calls = {
			bottom: d3.axisBottom,
			right: d3.axisRight,
			left: d3.axisLeft
		};
		if (type in calls) {
			this.display.select(`.${type}-axis`)
				.transition().duration(duration)
				.call(calls[type](scale)); // gives axis new scale
		}
		else {
			throw "Invalid axis type";
		};
	};

};

class LineGraph extends Graph {

	/** Uses the `data` member to generate sets of zero-length lines, to be animated into line segments
	 * @param {string} color - color of line
	 */
	generate_points(color) {
		let bottom_domain = this.axis_domain("bottom");
		let left_domain = this.axis_domain("left");
		let right_domain = this.axis_domain("right");

		let scale_x = (datum) => {return this.scale_horizontal(bottom_domain)(datum.date)};
		let scale_vertical = {};
		if (left_domain[1]) {
			scale_vertical.left = (datum) => {return this.scale_vertical(left_domain)(datum.param)};
		};
		if (right_domain[1]) {
			scale_vertical.right = (datum) => {return this.scale_vertical(right_domain)(datum.param)};
		};
		for (let i = 0; i < this.data.length; i++) {
			this.display.append("g")
				.attr("class", `lines ${this.data[i].name.replace(" ", "_")}`)
				.attr("transform", `translate(${this.margins.left},${this.margins.top})`)
				.selectAll("dot").data(this.data[i].data).enter().append("line")
				.attr("x1", scale_x).attr("x2", scale_x)
				.attr("y1", scale_vertical[this.data[i].axis]).attr("y2", scale_vertical[this.data[i].axis])
				.style("stroke", color).style("opacity", 1);
		}

	}

	/** Uses the `data` member to generate axes
	 */
	generate_axes() {
		let bottom_domain = this.axis_domain("bottom");
		let left_domain = this.axis_domain("left");
		let right_domain = this.axis_domain("right");

		this.generate_axis("bottom", bottom_domain);
		this.generate_axis("left", left_domain);
		this.generate_axis("right", right_domain);
	}

	/** Animates drawing of line graph
	 * @param {string} name - name of line group (set by `generate_points`) to animate
	 * @param {Number} duration - total duration of graphing animation in miliseconds
	 */
	animate_lines(name, duration) {
		let lines = this.display.node()
			.querySelectorAll(`.${name.replace(" ","_")}`)[0]
			.querySelectorAll("line"); // gets lines as normal DOM objects
		let single_step = duration / lines.length
		let line = d3.select(lines[0]);
		let header = this.display.select(`.${name.replace(" ","_")}`).append("text")
			.attr("class", "small").style("fill", "white")
			.attr("dy", "0.2em")
			.attr("x", line.attr("x1")).attr("y", line.attr("y1"))
			.text(name);

		for(let i = 0; i < lines.length - 1; i++) {
			line = d3.select(lines[i]);
			line.transition().duration(single_step).delay(i * single_step)
				.attr("x2", lines[i + 1].getAttribute("x1")) // moves line endpoint to next line
				.attr("y2", lines[i + 1].getAttribute("y1"));
			header.transition().duration(single_step).delay(i * single_step)
				.attr("x", lines[i + 1].getAttribute("x1")) // moves line endpoint to next line
				.attr("y", lines[i + 1].getAttribute("y1"));
		};
	};

	graph_all(duration, color) {
		this.generate_points(color);
		for (let i = 0; i < this.data.length; i++) {
			this.animate_lines(this.data[i].name, duration);
		}
	}
};
