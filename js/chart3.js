(function() {

  let data = "no data";
  // let allYearsData = "";
  let svg = "";
  let div = "";
  let svgScatter = "";
  let toolTip = "";

  window.onload = function() {

    d3.csv("data/world-happiness-report-2021.csv")
      .then((data) => {
    
    var margin = { top: 25, right: 100, bottom: 50, left: 70 };
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var svg = d3.select("#chart3")
      .append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append("g")
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    let minGDP = d3.min(data, function(d) {
      return +d["Logged GDP per capita"];
    });
    
    let maxGDP = d3.max(data, function(d) {
      return +d["Logged GDP per capita"];
    });

    // Scale x Axis
    let xScale = d3.scaleLinear()
      .domain([minGDP, maxGDP])
      .range([0, width + 5]);

    let minHappiness = d3.min(data, function(d) {
      return +d["Ladder score"];
    });
    let maxHappiness = d3.max(data, function(d) {
      return +d["Ladder score"];
    })
    
    // Scale y axis    
    let yScale = d3.scaleLinear()
      .domain([minHappiness*10, 10*maxHappiness])
      .range([height - 25, 0]);

    // draw x axis
    svg.append("g")
    .attr('transform', 'translate(30, ' + height + ')')
    .call(d3.axisBottom()
          .scale(xScale)
          .tickFormat(d3.format("d"))
          .ticks(20)
    );
    // X axis label
    svg.append("text")
      .attr("x", width/2)
      .attr("y", height + 35)
      .text("GDP Per Capita")
    
    // draw y axis
    svg.append("g")
    .attr('transform', 'translate(30, 25)')
    .call(d3.axisLeft(yScale));
    
    // y axis label
    svg.append("text")
      .attr("x", -300)
      .attr("y", -10)//height / 2)
      .attr("transform", "rotate(-90)")
      .text("Average Happiness Score")


    ////////// make the tooltip
      
    tooltip = d3.select("#chart3")
      .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)

      tooltip.append("g")
        .attr('transform', 'translate(10,10)')
        .call(d3.axisBottom()
              .scale(xScale)
              .tickFormat(d3.format("d"))
              .ticks(5)
        );

    svg.append('g')
    .selectAll("dot")
    .data(data) 
    .enter()
    .append("circle")
      .attr("cx", function (d) { return xScale(d['Logged GDP per capita']) + 30; } )
      .attr("cy", function (d) { return yScale(d['Ladder score']*10) + 25; } )
      .attr("r", function (d) { return 10; }) //z(d.happiness); } )
      .style("fill", function (d) { return "rgb(66,146,198)"; } ) //color(d.happiness); } )
      .style("opacity", 0.5)
      .style("stroke", "white")
      .on("mouseover", function(d) {
        tooltip.transition()
          .duration(200)      
          .style("opacity", 0.9)

        tooltip.html("<strong>Country:</strong> " + d["Country name"] + "<br>" 
                    + "<strong>Happiness Score:</strong> " + Math.round(d["Ladder score"] * 1000) / 100 + "<br>"
                    + "<strong>GDP per Capita:</strong> " + (d["Logged GDP per capita"]))
                    
          .style("left", (d3.event.pageX) + "px")     
          .style("top", (d3.event.pageY - 28) + "px");    
        })   
        .on("mouseout", function(d) {       
            tooltip.transition()        
            .duration(700)      
            .style("opacity", 0);   
        });

    }
  )}
})();