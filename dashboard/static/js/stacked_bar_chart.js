d3.json("/stackbarchart/").then(function(data) {

  // ---------------------------//
  //         DIMENSIONS         //
  // ---------------------------//

  var margin = { top: 40, right: 10, bottom: 30, left: 60 };
  var width = 1720;   
  var height = data.length * 25 + margin.top + margin.bottom;

  // ---------------------------//
  //          CONTAINER         //
  // ---------------------------//

  var svg = d3.select("#stackedBarChart")
    .style("height", height + margin.top + margin.bottom)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // ---------------------------//
  //          COLORSET          //
  // ---------------------------//

  // set colorset
  var colorScale = d3.scaleOrdinal().range(d3.schemeSet1);

  // ---------------------------//
  //       AXIS  AND SCALE      //
  // ---------------------------//

  // define x
  var x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.avg_total_net_amount)])
      .range([0, width]);

  // define y
  var y = d3.scaleBand()
      .domain(data.map(d => d.county))
      .range([height, 0])
      .padding(0.1);

  // ---------------------------//
  //           STACKS           //
  // ---------------------------//

  var stack = d3.stack()
    .keys(['cat1', 'cat2'])
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  var series = stack(data);

  // ---------------------------//
  //            BARS            //
  // ---------------------------//

  // create bars
  var bars = svg.selectAll(".bars")
  .data(series)
  .enter().append("g")
  .attr("fill", function(d) { return colorScale(d.key); })
  .selectAll("rect")
  .data(d => d)
  .enter().append("rect")
  .attr("x", d => x(d[0]))
  .attr("y", d => y(d.data.county))
  .attr("width", d => x(d[1]) - x(d[0]))
  .attr("height", y.bandwidth())
  .on("mouseover", showTooltip)  
  .on("mousemove", moveTooltip)  
  .on("mouseleave", hideTooltip);


  // append x-axis
  svg.append("g")
    .attr('class', 'axis')
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // append y-axis
  svg.append("g")
    .attr('class', 'axis')
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
    .attr("viewBox", [0, 0, 19, 19])
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

  var state = d3.max(data, d => d.state);
  var titleText = (state === "ALL") ? "Average Net Amount by State" : "Average Net Amount by County";

  svg.append("text")
    .attr("x", -40)
    .attr("y", -10)
    .attr("text-align", "right")
    .style("font-size", "18px")
    .text(titleText);

  // ---------------------------//
  //           TOOLTIP          //
  // ---------------------------//

  // Define the tooltip
  var tooltip = d3.select("#tooltip")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("color", "white")
    .style("position", "absolute");

  // Function to show the tooltip
  function showTooltip(event, d) {
    // Calculate position
    var tooltipX = event.pageX + 10;
    var tooltipY = event.pageY - 10;

    // Create tooltip
    d3.select("#tooltip") 
      .style("left", tooltipX + "px")
      .style("top", tooltipY + "px")
      .style("opacity", 1)
      .html("Avg Net Amount: " + (d[1] - d[0]).toLocaleString('en-US', {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0, 
      }));
  }

  // Move tooltip
  function moveTooltip(event, d) {
    var tooltipX = event.pageX;
    var tooltipY = event.pageY;

    d3.select("#tooltip")
      .style("left", tooltipX + "px")
      .style("top", tooltipY + "px");
  }

  // Hide tooltip
  function hideTooltip() {
    d3.select("#tooltip")
      .style("opacity", 0);
  }

});
