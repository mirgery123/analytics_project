d3.json('/donutchart/').then(function(data) {
    // Verificar si los datos se cargaron correctamente
    if (!data) {
        console.error('No se pudieron cargar los datos.');
        return;
    }

  // ---------------------------//
  //         DIMENSIONS         //
  // ---------------------------//

    var width = 500;
    var height = 380;
    var radius = Math.min(width, height) / 2;

  // ---------------------------//
  //          COLORSET          //
  // ---------------------------//

    var color = d3.scaleOrdinal(d3.schemeSet1);

  // ---------------------------//
  //           LEGEND           //
  // ---------------------------//

    var legendDiv = d3.select("#legend");

    var legendSvg = legendDiv.append("svg")
        .attr("width", width)
        .attr("height", 50)
        .attr("viewBox", [0, 0, width, 50])
        .style("display", "block")
        .style("margin", "0 auto");

    var legendGroup = legendSvg.selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", function(d, i) {
            return "translate(" + (i * 120 + 100) + ", 20)"; // Espaciado horizontal
        });

    legendGroup.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", function(d) { return color(d.category); });

    legendGroup.append("text")
        .attr("x", 25)
        .attr("y", 15)
        .style("text-anchor", "start")
        .text(function(d) { return d.category; });

  // ---------------------------//
  //            PIE             //
  // ---------------------------//

    var svg = d3.select("#donutChart")
        .append("svg")
        .attr("width", "100%")
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


    var pie = d3.pie()
        .value(function(d) { return d.total_net_amount; });

    var data_ready = pie(data);
    //console.log("data_ready: " + data_ready);

    var arcGenerator = d3.arc()
        .innerRadius(radius / 2) 
        .outerRadius(radius);

    var arcs = svg.selectAll("arc")
        .data(data_ready)
        .enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill", function(d) { return color(d.data.category); })
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

    // Función para mostrar el tooltip
    function showTooltip(event, d) {
    var state = d.data.state;
    var category = d.data.category;
    //console.log("category: " + category);
    var provCount = d.data.prov_cnt;
    var claimCount = d.data.clm_cnt;
    var total_net_amount = d.data.total_net_amount/1000000;
    var formattedAmount = total_net_amount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0, 
    });

    var tooltipX = event.pageX;
    var tooltipY = event.pageY;

    d3.select("#tooltip") 
        .style("left", tooltipX + "px")
        .style("top", tooltipY + "px")
        .style("opacity", 1)
        .html("State: " + state + "<br>Category: " + category + "<br>No. Providers: " + provCount.toLocaleString() + "<br>No. Claims: " + claimCount.toLocaleString() + "<br>Total Net Amount: " + formattedAmount + " MM");
    }

    function moveTooltip(event, d) {
    var tooltipX = event.pageX;
    var tooltipY = event.pageY;

    d3.select("#tooltip")
        .style("left", tooltipX + "px")
        .style("top", tooltipY + "px");
    }

    function hideTooltip() {
    d3.select("#tooltip")
        .style("opacity", 0);
    }


});