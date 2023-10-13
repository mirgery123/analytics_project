d3.json("/stackbarchart2/").then(function(data) {
    //console.log("entrando a stackbar2");
    //console.log("data=" + data);
    var states = [...new Set(data.map(d => d.state))];
    //console.log("states=" + states);
    loadData(states);

    function loadData(state) {
            //console.log("state=" + states);
            // Filtrar los datos para el estado seleccionado
            var filteredData = data.filter(function(d) {
            return d.state == state; });
            //console.log("filteredData=" + filteredData);
            //console.log("filteredData-length=" + filteredData.length);

            // set the dimensions and margins of the graph
            var margin = { top: 30, right: 10, bottom: 0, left: 60 };
            var width = 1800;   
            var height = filteredData.length * 25 + margin.top + margin.bottom;

            // clear previous selection and append new svg
            var svg = d3.select("#viz6")
            svg.selectAll("*").remove();
            svg.append("svg");
            svg.attr("width", width);
            svg.attr("height", height);

            // create scale
            var xScale = d3.scaleLinear()
                .domain([0, d3.max(filteredData, d => d.avg_total_net_amount)])
                .range([margin.left, width - margin.right]);
            //console.log("x_max: " + d3.max(filteredData, d => d.avg_total_net_amount))

            var yScale = d3.scaleBand()
                .domain(filteredData.map(d => d.county))
                .range([margin.top, height - margin.bottom])
                .padding(0.1);
            //console.log("yScale: " + filteredData.map(d => d.county))

        // set colorset
            var colorScale = d3.scaleOrdinal().range(d3.schemeSet1);

        // create stacks
            var stack = d3.stack()
            .keys(["cat1", "cat2"]) 
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

            var series = stack(filteredData);
            //console.log("series_orig: " + series);

        // append stacked elements
        svg.selectAll("g")
            .data(series)
            .enter().append("g")
                .attr("fill", function(d) { return colorScale(d.key); })
            .selectAll("rect")
            .data(function(d) { return d; })
            .enter().append("rect")
                .attr("y", function(d) { return yScale(d.data.county); })
                .attr("x", function(d) { return xScale(d[0]); })
                .attr("height", yScale.bandwidth())
                .attr("width", function(d) { return xScale(d[1]) - xScale(d[0]); });

        // append axis
            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0, 30)")
                .call(d3.axisTop(xScale));

            svg.append("g")
                .attr("class", "y-axis")
                .attr("transform", "translate(60, 0)")
                .call(d3.axisLeft(yScale));
        }

});
