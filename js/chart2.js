(function() {

   let data = "no data";
   let allYearsData = "";
   let svg = "";
   let div = "";
   let svgScatter = "";
   let toolTip = "";
   let country = 'Australia'; // set default to Australia

   window.onload = function() {

     d3.csv("data/world-happiness-report.csv")
       .then((data) => {
       let csvData = data;
     
       // make dropdown
       let dropDown = d3.select('#chart2')
         .append('select')
         .on('change', function() {
           //filter data by country
           country = this.value;
           d3.selectAll("svg").remove();

           makeLineGraph(csvData);
         });

       let allCountries = [...new Set(data.map((row) => row["Country name"]))];

       var dropDownSelection = dropDown.selectAll('option')
         .data(allCountries)
         .enter()
           .append('option')
           .text((d) => { return d; })
           .property("selected", function(d) {return d == country; });
       
       allYearsData = csvData;
       makeLineGraph(csvData);
      //  makeScatterPlot(csvData)

     })
   }

   function filterByCountry(csvData) {
     data = csvData.filter(function(d) {
       if(d["Country name"] == country){
         return d;
       }
     });
   }
 
   function makeLineGraph(csvData) {
     filterByCountry(csvData);
     
     let margin = { top: 25, right: 100, bottom: 50, left: 70 };
     width = 900 - margin.left - margin.right;
     height = 500 - margin.top - margin.bottom;

     svg = d3.select("#chart2")
       .append("svg")
         .attr('width', width + margin.left + margin.right)
         .attr('height', height + margin.top + margin.bottom)
       .append("g")
         .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

     
     minYear = d3.min(data, function(d) {
       return +d["year"];
     });
     maxYear = d3.max(data, function(d) {
       return +d["year"];
     });

     // Scale x Axis
     let xScale = d3.scaleLinear()
       .domain([minYear, maxYear])
       .range([0, width + 50]);

     minHappiness = d3.min(data, function(d) {
       return +d["Life Ladder"];
     });
     maxHappiness = d3.max(data, function(d) {
       return +d["Life Ladder"];
     })

     // Scale y axis    
     let yScale = d3.scaleLinear()
       .domain([minHappiness*10, maxHappiness*10])
       .range([height - 25, 0]);

     drawLineAxes(xScale, yScale, svg)

     ////////// make the tooltip

       let padding = {top: 10, right: 10, bottom: 10, left: 70}
       scatterWidth = 300 - padding.left - padding.right;
       scatterHeight = 300 - padding.top - padding.bottom;
       
       tooltip = d3.select("#chart2")
         .append("div")
           .attr("class", "tooltip")
           .style("opacity", 0)

      tooltip.append("g")
           .attr('transform', 'translate(10,10)')
         //   .call(d3.axisBottom()
         //         .scale(xScale)
         //         .tickFormat(d3.format("d"))
         //         .ticks(20)
         //   );

     
     // define the line
     let valueLine = d3.line()
         .x(function(d) {  return xScale(d['year']) + 30})
         .y(function(d) {  return yScale(d['Life Ladder']*10) + 25})
     
      svg.append("path")
       .attr("class", "line")
       .attr("d", valueLine(data))
       .attr("stroke", "#1f77b4")
       .attr("stroke-width", "3")
       .style("fill", "none")
      //  .on("mouseover", function(d) {
      //     console.log(d)
      //    tooltip.transition()
      //        .duration(100)
      //        .style("opacity", .9);
      //    tooltip.html("<strong>Happiness Score:</strong> " + d["Ladder score"])// + Math.round(d["Ladder score"] * 1000) / 100 + "<br>") //.html(svgScatter)
      //      .style("left", (d3.event.pageX) + "px")
      //      .style("top", (d3.event.pageY) + "px");
      //  })
      //  .on("mouseout", d => {
      //      tooltip.transition()
      //        .duration(100)
      //        .style("opacity", 0);
      //  })

      svg.append('g')
         .selectAll("dot")
         .data(data) 
         .enter()
         .append("circle")
            .attr("cx", function (d) { return xScale(d['year'])+30; } )
            .attr("cy", function (d) { return yScale(d['Life Ladder']*10) + 25; } )
            .attr("r", function (d) { return 7.5; }) //z(d.happiness); } )
            .style("fill", function (d) { return "rgb(8,48,107)"; } ) //color(d.happiness); } )
            .style("opacity", 0.5)
            .style("stroke", "black")
            .on("mouseover", function(d) {
            tooltip.transition()
               .duration(200)      
               .style("opacity", 0.9)

            tooltip.html("<strong>Country:</strong> " + country + "<br>" 
                        + "<strong>Year:</strong> " + d["year"] + "<br>"
                        + "<strong>Happiness Score:</strong> " + Math.round(d["Life Ladder"] * 1000) / 100 + "<br>")
                        
               .style("left", (d3.event.pageX) + "px")     
               .style("top", (d3.event.pageY - 28) + "px");    
            })   
            .on("mouseout", function(d) {       
                  tooltip.transition()        
                  .duration(700)      
                  .style("opacity", 0);   
            });
   }
 
   function drawLineAxes(xScale, yScale, element) {
     // Draw x axis
     element.append("g")
     .attr('transform', 'translate(30, ' + height + ')')
     .call(d3.axisBottom()
           .scale(xScale)
           .tickFormat(d3.format("d"))
           .ticks(20)
     );
 
     // X axis label
     element.append("text")
       .attr("x", width/1.75)
       .attr("y", height + 35)
       .text("Year")
     
     
     // draw y axis
     element.append("g")
     .attr('transform', 'translate(30, 25)')
     .call(d3.axisLeft(yScale));
     
     // y axis label
     element.append("text")
       .attr("x", -300)
       .attr("y", -10)//height / 2)
       .attr("transform", "rotate(-90)")
       .text("Average Happiness Score")

   }

 })();