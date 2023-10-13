d3.json('/timeline_chart/').then(function(data) {

    //var selectedState = getSelectedState;
    //console.log("selectedState_from_timeline" + selectedState);

    // Tamaño del gráfico
    var width = 1800;
    var height = 200;

    // Margen
    var margin = { top: 20, right: 20, bottom: 30, left: 40 };

    // Crear el lienzo SVG
    var svg = d3.select("#chart5")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Escalas X e Y
    var x = d3.scaleBand()
        .domain(data.map(function(d) { return d.month; }))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.fraud_prov_count; })])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Crear la línea
    var line = d3.line()
        .x(function(d) { return x(d.month) + x.bandwidth() / 2; })
        .y(function(d) { return y(d.fraud_prov_count); });

    // Agregar la línea al gráfico
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Agregar ejes X e Y
    svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(y));

/*     // Agregar etiquetas
    svg.append("text")
        .attr("x", width - 100)
        .attr("y", height - 1)
        .text("Claim Month");

    svg.append("text")
        .attr("x", -(height - 10))
        .attr("y", 8)
        .attr("transform", "rotate(-90)")
        .text("Count"); */

});