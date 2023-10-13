
d3.json('/bubblechart/').then(function(mydata) {

  // ---------------------------//
  //         DIMENSIONS         //
  // ---------------------------//

  // set the dimensions and margins of the graph
  var margin = { top: 40, right: 150, bottom: 60, left: 30 };
  width = 500 - margin.left - margin.right;
  height = 450 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#chart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

  // ---------------------------//
  //       AXIS  AND SCALE      //
  // ---------------------------//

  // Add X axis
  var x = d3.scaleLinear()
    .domain([0, 320])
    .range([0, width]);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(3));

  // Add X axis label:
    svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + 50)
    .text("Provider Count");

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 100])
    .range([height, 0]);
    svg.append("g")
    .call(d3.axisLeft(y));

  // Add Y axis label:
    svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", 0)
    .attr("y", -20)
    .text("% Potential Fraud")
    .attr("text-anchor", "start")

  // Add a scale for bubble size
  var z = d3.scaleSqrt()
    .domain([0, 10000])
    .range([2, 24]);

  // Add a scale for bubble color
  var myColor = d3.scaleOrdinal()
    .domain(["1-10", "11-20", "21-30", "31-40", "41-50", "51-54"])
    .range(d3.schemeSet1);

  // ---------------------------//
  //      TOOLTIP               //
  // ---------------------------//

  // Añade un elemento de tooltip al HTML donde mostrarás el nombre del estado. Este elemento debe estar oculto inicialmente.
    d3.select("#chart2_tooltip")
    .append("div")
      .style("opacity", 0)
      .attr("id", "tooltip")
      .attr("class", "tooltip")
      .style("background-color", "black")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("color", "white");

  // Función para mostrar el tooltip
  function showTooltip(event, d) {
    // Obtén el nombre del estado (asegúrate de tener esta propiedad en tus datos)
    var stateName = d.state;
    //console.log("state: " + stateName);
    var statePercent = d.percent;
    var formattedPercent = (statePercent).toFixed(2) + "%";
    var providerCount = d.prov_count;
    var claimCount = d.claim_count;
        var total_net_amount = d.total_net_amount/1000000;
    var formattedAmount = total_net_amount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0, // Omitir decimales
        maximumFractionDigits: 0, // Omitir decimales
    });

    // Calcula la posición del tooltip en relación con el mouse
    var tooltipX = event.pageX;
    var tooltipY = event.pageY;

    // Crea y muestra el tooltip
    d3.select("#tooltip") 
      .style("left", tooltipX + "px")
      .style("top", tooltipY + "px")
      .style("opacity", 1)
      .html("State: " + stateName + "<br> % Fraud: " + formattedPercent + "<br> No. Providers: " + providerCount + "<br> No. Claims: " + claimCount.toLocaleString() + "<br>Total Net Amount: " + formattedAmount + " MM");
  }

  // Función para mover el tooltip con el mouse
  function moveTooltip(event, d) {
    var tooltipX = event.pageX;
    var tooltipY = event.pageY;

    d3.select("#tooltip")
      .style("left", tooltipX + "px")
      .style("top", tooltipY + "px");
  }

  // Función para ocultar el tooltip
  function hideTooltip() {
    d3.select("#tooltip")
      .style("opacity", 0);
  }

  // ---------------------------//
  //       HIGHLIGHT GROUP      //
  // ---------------------------//
  // What to do when one group is hovered
  var highlight = function(event, d){
    //console.log("region:" + d)
    // reduce opacity of all groups
      d3.selectAll(".bubbles")
        .style("opacity", .05)
        .filter(function (data) {
          return data.region === d;
        })
        .style("opacity", 1);
    }
  
    // And when it is not hovered anymore
    var noHighlight = function(){
      d3.selectAll(".bubbles").style("opacity", 1)
    }


  // ---------------------------//
  //       CIRCLES              //
  // ---------------------------//

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(mydata)
    .enter()
    .append("circle")
    .attr("class", function (d) { return "bubbles " + d.region })
    .attr("cx", function (d) { return x(d.prov_count); })
    .attr("cy", function (d) { return y(d.percent); })
    .attr("r", function (d) { return z(d.claim_count); })
    .style("fill", function (d) { return myColor(d.region); })
    .on("mouseover", showTooltip)  
    .on("mousemove", moveTooltip)  
    .on("mouseleave", hideTooltip); 

    //console.log("state: " + mydata.map(d => d.state));
    //console.log("state2: " + mydata.map(function(d) { return d.state; }));

  // ---------------------------//
  //           LEGEND           //
  // ---------------------------//

  // Add legend: circles
  var valuesToShow = [100, 1000, 10000]
  // Horizontal position
  var xCircle = 390
  var xLabel = 440
  // Vertical position
  var yCircle = 100
  var legendCircles = svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("circle")
    .attr("cx", xCircle)
    .attr("cy", function (d) { return height - yCircle - z(d) })
    .attr("r", function (d) { return z(d) })
    .style("fill", "none")
    .attr("stroke", "black")

  // Add legend: segments
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("line")
    .attr('x1', function (d) { return xCircle + z(d) })
    .attr('x2', xLabel)
    .attr('y1', function (d) { return height - yCircle - z(d) })
    .attr('y2', function (d) { return height - yCircle - z(d) })
    .attr('stroke', 'black')
    .style('stroke-dasharray', ('2,2'))

  // Add legend: labels
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("text")
    .attr('x', xLabel)
    .attr('y', function (d) { return height - yCircle - z(d) })
    .text(function (d) { return d })
    .style("font-size", 10)
    .attr('alignment-baseline', 'middle')

  // Legend title
  svg.append("text")
    .attr('x', xCircle)
    .attr("y", height - yCircle + 30)
    .text("Claim Count")
    .attr("text-anchor", "middle")

  // Add one dot in the legend for each name.
  var size = 20
  var allgroups = ["1-10", "11-20", "21-30", "31-40", "41-50", "51-54"]
  svg.selectAll("myrect")
    .data(allgroups)
    .enter()
    .append("circle")
    .attr("cx", 390)
    .attr("cy", function (d, i) { return 10 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 7)
    .style("fill", function (d) { return myColor(d) })
    .on("mouseover", highlight)
    .on("mouseleave", noHighlight)


  // Add labels beside legend dots
  svg.selectAll("mylabels")
    .data(allgroups)
    .enter()
    .append("text")
    .attr("x", 390 + size * .8)
    .attr("y", function (d, i) { return i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function (d) { return myColor(d) })
    .text(function (d) { return d })
    .attr("text-anchor", "left")


});