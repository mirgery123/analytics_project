d3.json("/allstates/").then(function(data) {
    var states = [...new Set(data.map(d => d.state))];
    states.unshift("ALL");
    states.unshift("--");

    var select = d3.select("#estadoCombo");

    // Añadir las opciones
    select.selectAll("option")
        .data(states)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

    // Establecer la opción predeterminada
    //var lastselectedState = "ALL";
    //select.property("value", lastselectedState);

});

document.addEventListener("DOMContentLoaded", function () {
    var estadoCombo = document.getElementById("estadoCombo");
    var estadoComboForm = document.getElementById("estadoComboForm");

    estadoCombo.addEventListener("change", function () {
        console.log("submit_value: " + document.getElementById("estadoCombo").value);
        estadoComboForm.submit();
    });
});
