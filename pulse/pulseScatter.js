'use strict'

if (!d3.chart) d3.chart = {}

d3.chart.scatter = function() {
	var g
	var data
	var rect
	var xaxis
	var yaxis
	var drawnData
	var clickData
	var objects
	var margin = { top: 50, right: 30, bottom: 50, left: 50}
	var width = scatterWidth - margin.left - margin.right,
			height = scatterHeight - margin.top - margin.bottom

	var xCat = "index",
			xLabel = "protein number",
			yCat = "probability",
			yLabel = "probability"

	var dispatch = d3.dispatch(chart, "clicked")

	function chart(container) {
		g = container

		// Build box for chart
		rect = g.append("rect")
			.attr("width", width)
			.attr("height", height)

		g.append("g")
			.classed("x axis", true)

		g.append("g")
			.classed("y axis", true)

		update()
	}

	chart.update = update
	chart.showProteins = showProteins

	function showProteins(filteredData) {
		var clickData = {
			isActive: false
		}
		console.log("showProteins clicked")
	}

	function update() {

		// x axis
		var xMax = d3.max(data, d => d[xCat]) * 1.05,
				xMin = d3.min(data, d => d[xCat]),
				xMin = xMin > 0 ? 0 : xMin

		var xScale = d3.scale.linear().range([0, width]).nice()
		xScale.domain([xMin, xMax])

		var xAxis = d3.svg.axis()
											.scale(xScale)
											.orient("bottom")

		var xg = g.select(".x.axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis)
			.append("text")
				.classed("label", true)
				.attr("text-anchor", "end")
				.attr("x", width)
				.attr("y", margin.bottom - 10)
				.text(xLabel)


		// y axis
		var yMax = d3.max(data, d => d[yCat]) * 1.05,
				yMax = yMax < 1 ? 1 : yMax,
				yMin = d3.min(data, d => d[yCat]),
				yMin = yMin > 0 ? 0 : yMin

		var yScale = d3.scale.linear().range([height, 0])
		yScale.domain([yMin, yMax])

		var yAxis = d3.svg.axis()
											.scale(yScale)
											.orient("left")

		var yg = g.select(".y.axis")
			 .call(yAxis)
			.append("text")
			 .classed("label", true)
			 .attr("text-anchor", "end")
			 .attr("y", -margin.left)
			 .attr("dy", ".75em")
			 .attr("transform", "rotate(-90)")
			 .text(yCat)

		// Initialize zoom behaviour
		var zoomBehavior = d3.behavior.zoom()
					.x(xScale)
					.y(yScale)
					.scaleExtent([0, 500])
					.on("zoom", zoom)

		g.call(zoomBehavior)

		objects = g.append("svg")
			.classed("objects", true)
			.attr("width", width)
			.attr("height", height)

		g.append("svg:line")
			.classed("axisLine hAxisLine", true)
			.attr("x1", 0)
			.attr("y1", 0)
			.attr("x2", width)
			.attr("y2", 0)
			.attr("transform", "translate(0," + scatterWidth + ")")

		objects.append("svg:line")
			.classed("axisLine vAxisLine", true)
			.attr("x1", 0)
			.attr("y1", 0)
			.attr("x2", 0)
			.attr("y2", scatterHeight)

		// Initialize tooltip
		var tip = d3.tip()
								.attr("class", "d3-tip")
								.offset([-10, 0])
								.html(
									d => "transcript: " + d["transcript"] + "<br>" 
									+ "protein: " + d["protein"] + "<br>" 
									+ yCat + ": " + d[yCat]
								)

		g.call(tip)

		clickData = {
			isActive: false,
			prevClicked: new Set()
		}

		drawnData = objects.selectAll(".dot")
				.data(data)
			.enter().append("circle")
				.classed("dot", true)
				.attr("r", 2)
				.attr("transform", transform)
				.on("mouseover", tip.show)
				.on("mouseout", tip.hide)
				.on("click", d => showSameProteins(d, clickData))

		function showSameProteins(d, clickData) {

			// if clickData set has clicked protein, then don't highlight
			// if (clickData.prevClicked.has(d)) {
			//   objects.selectAll(".dot")
			//     .filter(p => d["protein"] )
			// }

			// hasn't been clicked before
			if (!clickData.isActive) {
				objects.selectAll(".dot")
						.filter(p => d["protein"] !== p["protein"])
						.attr("r", 0.25)
				objects.selectAll(".dot")
						.filter(p => d["protein"] === p["protein"])
						.transition().duration(1500).attr("r", 3)
				clickData.isActive = !clickData.isActive
			} else { // has been clicked before
				objects.selectAll(".dot")
						.transition().duration(500)
						.attr("r", 2)
				clickData.isActive = !clickData.isActive
			}
		}

		d3.select("#xAxis").on("click", change)
		d3.select("#resetSelection").on("click", resetSelection)

		function resetSelection() {
			objects.selectAll(".dot").transition().duration(500).attr("r", 2)
		}

		// Reset zoom
		function change() {
			xCat = "index"
			xMax = d3.max(data, d => d[xCat])
			xMin = d3.min(data, d => d[xCat])

			zoomBehavior.x(xScale.domain([xMin, xMax]))
						 .y(yScale.domain([yMin, yMax]))

			var svg = d3.select("#scatter").transition()

			svg.select(".x.axis")
				.duration(750)
				.call(xAxis)
				.select(".label")
				.text(xLabel)

			objects.selectAll(".dot")
				.transition()
				.duration(1000)
				.attr("transform", transform)
		}

		function zoom() {
			g.select(".x.axis").call(xAxis)
			g.select(".y.axis").call(yAxis)

			g.selectAll(".dot")
					.attr("transform", transform)
		}

		function transform(d) {
			return "translate(" + xScale(d[xCat]) + "," + yScale(d[yCat]) + ")"
		}
	}


	//combination getter and setter for the data attribute of the global chart variable
	chart.data = function(value) {
		if(!arguments.length) return data;
		data = value;
		return chart;
	}
		
	//combination getter and setter for the width attribute of the global chart variable
	chart.width = function(value) {
		if(!arguments.length) return width;
		width = value;
		return chart;
	}
		
	//combination getter and setter for the height attribute of the global chart variable
	chart.height = function(value) {
		if(!arguments.length) return height;
		height = value;
		return chart;
	}

	return d3.rebind(chart, dispatch, "on")
}