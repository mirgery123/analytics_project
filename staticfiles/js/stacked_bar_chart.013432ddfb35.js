d3.json("/stackbarchart/").then(function(data) {

  // ---------------------------//
  //         DIMENSIONS         //
  // ---------------------------//

    var margin = { top: 20, right: 10, bottom: 20, left: 60 };
    var width = 1700;   
    var height = data.length * 25 + margin.top + margin.bottom;
        
  // ---------------------------//
  //           COLORS           //
  // ---------------------------//

   // set colorset
    var colorScale = d3.scaleOrdinal().range(d3.schemeSet1);

  // ---------------------------//
  //       AXIS  AND SCALE      //
  // ---------------------------//

    //define x
    var x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.avg_total_net_amount)])
        .range([0, width]);

    //define y
    var y = d3.scaleBand()
        .domain(data.map(d => d.county))
        .range([margin.top, height - margin.bottom])
        .padding(0.1);

  // ---------------------------//
  //          CONTAINER         //
  // ---------------------------//

    var svg = d3.select("#viz5")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // ---------------------------//
  //           STACKS           //
  // ---------------------------//

    var stack = d3.stack()
    .keys(['cat1', 'cat2'])
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

    var series = stack(data);

  // ---------------------------//
  //           DRAWING          //
  // ---------------------------//

    // create bars
    var bars = svg.selectAll(".bars")
        .data(series)
        .enter().append("g")
        .attr("fill", function(d) { return colorScale(d.key); });

    // append bars
    bars.selectAll("rect")
        .data(d => d)
        .enter().append("rect")
        .attr("x", d => x(d[0]))
        .attr("y", d => y(d.data.county))
        .attr("width", d => x(d[1]) - x(d[0]))
        .attr("height", y.bandwidth());

    // append x-axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // append y-axis
    svg.append("g")
        .call(d3.axisLeft(y));


  // ---------------------------//
  //           LEGEND           //
  // ---------------------------//

    var legend = svg.append("g")
    .attr("class", "legend")
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(["Fraud", "Non-Fraud"])
    .enter().append("g")
    .attr("transform", function(d, i) {
        return "translate(0," + i * 20 + ")";
    });

    legend.append("rect")
    .attr("x", width - 19)
    .attr("width", 19)
    .attr("height", 19)
    .attr("fill", function(d, i) {
        return i === 0 ? "red" : "steelblue";
    });

    legend.append("text")
    .attr("x", width - 24)
    .attr("y", 11)
    .attr("dy", "0.32em")
    .text(function(d) {
        return d;
    });


  // ---------------------------//
  //            TITLE           //
  // ---------------------------//

/*     var titleText;
    if (state === "ALL") {
        titleText = "Average Net Amount by State";
    } else {
        titleText = "Average Net Amount by County";
    } */

    var titleText = "Average Net Amount by State";

    svg.append("text")
        .attr("x", 0)
        .attr("y", margin.top / 2)
        .attr("text-align", "right")
        .style("font-size", "20px")
        .text(titleText);

});