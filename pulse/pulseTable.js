'use strict'

if (!d3.chart) d3.chart = {}

d3.chart.table = function() {
	var g
	var data
	var margin = {top: 20, right: 30, bottom: 30, left: 40},
			tableWidth = 600 - margin.left - margin.right,
			tableHeight = 500 - margin.top - margin.bottom

	var dispatch = d3.dispatch(chart, "clicked")

	function chart(container) {
		g = container
		console.log(g)
		update()
	}

	chart.update = update

	function update() {
		var table = g.attr("width", tableWidth + margin.left + margin.right)
				.attr("height", tableHeight + margin.top + margin.bottom)

		var headerGrp = table.append("table").attr("class", "headerGrp")
		var headerRow = headerGrp.append("thead")

		var rowsDiv = table.append("div").attr("class", "table-scroll")
			.attr("width", tableWidth)
		var rowsGrp = rowsDiv.append("table").attr("class", "rowsGrp")

		var indexFieldWidth = 60,
				transcriptFieldWidth = 140,
				proteinFieldWidth = 105,
				probabilityFieldWidth = 70

		var	fieldHeight = 30
		var previousSort = null
		refreshTable(null)

		function refreshTable(sortOn) {
			console.log(sortOn)
			table.selectAll("th").remove()
			table.selectAll("tr").remove()

			// Draw header
			var header = headerRow.selectAll("thead")
				.data(d3.keys(data[0]))
				.enter().append("th")
				.attr("class", (d, i) => "header" + i)
				.on("click", function(d, i) {
					refreshTable(d)
				})
				.text(d => d)

			// start filling the table
			var rows = rowsGrp.selectAll("g.row")
				.data(data)
				.enter().append("tr")
				.attr("class", "row")

			var cells = rows.selectAll("td")
				.data(d => d3.values(d))
				.enter().append("td")
				.attr("class", (d, i) => "cell" + i)
				.append("text")
				.text(d => d)

			// Let's reformat some of the columns by index value
			// Might be best to move this CSS
			// Column 0
			headerGrp.selectAll(".header0")
				.attr("width", indexFieldWidth)
			rowsGrp.selectAll(".cell0")
				.attr("width", indexFieldWidth)

			// Column 1
			headerGrp.selectAll(".header1")
				.attr("width", transcriptFieldWidth)
			rowsGrp.selectAll(".cell1")
				.attr("width", transcriptFieldWidth)

			// Column 2
			headerGrp.selectAll(".header2")
				.attr("width", proteinFieldWidth)
			rowsGrp.selectAll(".cell2")
				.attr("width", proteinFieldWidth)

			// Column 3
			headerGrp.selectAll(".header3")
				.attr("width", probabilityFieldWidth)
			rowsGrp.selectAll(".cell3")
				.attr("width", probabilityFieldWidth)

			if (sortOn !== null) {
				if (sortOn != previousSort) {
					rows.sort((a, b) => sort(a[sortOn], b[sortOn], previousSort))
					previousSort = sortOn
				}
				else {
					rows.sort((a, b) => sort(a[sortOn], b[sortOn], previousSort))
					previousSort = null
				}
				rows.selectAll("td").select("text").text(String)

			}
		}			

		function sort(a, b, previousSort) {
			if (typeof a == "string" && previousSort == null) {
				return a.localeCompare(b)
			} 
			else if (typeof a == "string" && (previousSort == "transcript" || previousSort == "protein")) {
				return b.localeCompare(a)
			}
			else if (typeof a == "number" && previousSort == null) {
				return a > b ? 1 : a == b ? 0 : -1
			}
			else if (typeof a == "number" && (previousSort == "index" || previousSort == "probability")) {
				return b > a ? 1 : a == b ? 0 : -1
			}
		}

	}

	chart.data = function(value) {
		if (!arguments.length) return data
		data = value
		return chart
	}

	chart.width = function(value) {
		if(!arguments.length) return tableWidth
		tableWidth = value
		return chart
	}

	chart.height = function(value) {
		if(!arguments.length) return tableHeight
		tableHeight = value
		return chart
	}

	// returns dispatch method bound to chart (target) 
	// with "on" name
	return d3.rebind(chart, dispatch, "on")
}