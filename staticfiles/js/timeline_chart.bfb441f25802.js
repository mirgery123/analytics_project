d3.json('/timeline_chart/').then(function(data) {


  // ---------------------------//
  //         DIMENSIONS         //
  // ---------------------------//

    var width = 2030;
    var height = 300;
    var margin = { top: 40, right: 20, bottom: 30, left: 50 };

    //console.log("Count: " + data.map(d => d.fraud_prov_count));

  // ---------------------------//
  //          CONTAINER         //
  // ---------------------------//

    var svg = d3.select("#timelineChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);
        

  // ---------------------------//
  //       AXIS  AND SCALE      //
  // ---------------------------//

    var x = d3.scaleBand()
    .domain(data.map(function(d) { return d.month; }))
    .range([margin.left, width - margin.right])
    .padding(0.1);

    var y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return d.fraud_prov_count; })])
    .nice()
    .range([height - margin.bottom, margin.top]);

    var line = d3.line()
    .x(function(d) { return x(d.month) + x.bandwidth() / 2; })
    .y(function(d) { return y(d.fraud_prov_count); });

    svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line)

    svg.selectAll("circle")
    .data(data)
    .enter()
    .append("svg:circle")
    .attr('cx', function(d) { return x(d.month) + x.bandwidth() / 2; })
    .attr('cy', d => y(d.fraud_prov_count))
    .attr('r', 3)
    .attr('fill', 'steelblue')
    .on("mouseover", showTooltip)  
    .on("mousemove", moveTooltip)  
    .on("mouseleave", hideTooltip); 

    svg.append("g")
    .style('font-size', '18px')
    .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    .call(d3.axisBottom(x));

    svg.append("g")
    .style('font-size', '18px')
    .attr("transform", "translate(" + margin.left + ",0)")
    .call(d3.axisLeft(y));


  // ---------------------------//
  //            TITLE           //
  // ---------------------------//

    var titleText = "Potential Fraudulent Providers In Time";

    svg.append("text")
    .attr("x", margin.right)
    .attr("y", 15)
    .attr("text-align", "right")
    .style("font-size", "20px")
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
  var provCount = d.fraud_prov_count;
  //console.log("provCount: " + provCount);
  //console.log("d: " + d);

  //calculate position
  var tooltipX = event.pageX;
  var tooltipY = event.pageY;

  d3.select("#tooltip") 
    .style("left", tooltipX + "px")
    .style("top", tooltipY + "px")
    .style("opacity", 1)
    .html("Count: " + provCount);
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