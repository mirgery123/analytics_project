d3.json('/simplechart/').then(function(data) {

  // ---------------------------//
  //         DIMENSIONS         //
  // ---------------------------//

    // Create the chart
    var width = 500;
    var height = 450;

  // ---------------------------//
  //          CONTAINER         //
  // ---------------------------//

    var svg = d3.select('#simpleBarChart')
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);


    var margin = {top: 40, right: 20, bottom: 50, left: 60};
    var width = +svg.attr('width') - margin.left - margin.right;
    var height = +svg.attr('height') - margin.top - margin.bottom;
    
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // ---------------------------//
  //          COLORSET          //
  // ---------------------------//

    var myColor = d3.scaleOrdinal()
    .range(d3.schemeSet1);

  // ---------------------------//
  //       AXIS  AND SCALE      //
  // ---------------------------//
  
    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
    var y = d3.scaleLinear().rangeRound([height, 0]);
  
    x.domain(data.map(function(d) { return d.gender; }));
    y.domain([0, d3.max(data, function(d) { return d.count; })]);

    // Add X axis label:
    svg.append("text")
    .attr('class', 'axis')
    .attr("text-anchor", "end")
    .attr("x", width + 50)
    .attr("y", height + 80)
    .text("Gender");

    // Add Y axis label:
    svg.append("text")
    .attr('class', 'axis')
    .attr("text-anchor", "end")
    .attr("x", 0)
    .attr("y", 20)
    .text("Claim Count")
    .attr("text-anchor", "start")
  
    g.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x));
  
    g.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('count Count');

  // ---------------------------//
  //            BARS            //
  // ---------------------------//
  
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('x', function(d) { return x(d.gender); })
      .attr('y', function(d) { return y(d.count); })
      .attr('width', x.bandwidth())
      .attr('height', function(d) { return height - y(d.count); })
      .style("fill", function(d){ return myColor(d)})
      .on("mouseover", showTooltip)  
      .on("mousemove", moveTooltip)  
      .on("mouseleave", hideTooltip); 

  // ---------------------------//
  //           TOOLTIP          //
  // ---------------------------//

    d3.select("#tooltip")
    .append("div")
      .style("opacity", 0)
      .attr("id", "tooltip")
      .attr("class", "tooltip")
      .style("background-color", "black")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("color", "white");

    // Show tooltip
    function showTooltip(event, d) {
    var state = d.state;
    var gender = d.gender;
    var count = d.count;
    var per_fraud = d.percent;

    // Calculate position
    var tooltipX = event.pageX;
    var tooltipY = event.pageY;

    // Create tooltip
    d3.select("#tooltip") 
      .style("left", tooltipX + "px")
      .style("top", tooltipY + "px")
      .style("opacity", 1)
      .html("State: " + state + "<br>Gender: " + gender + "<br>No. Claims: " + count.toLocaleString() + "<br>%Fraud: " + per_fraud.toLocaleString());
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
