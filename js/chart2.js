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
         // .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

     
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
       .domain([minHappiness, maxHappiness])
       .range([height - 25, 0]);

     drawLineAxes(xScale, yScale, svg)

     ////////// make the tooltip

       let padding = {top: 10, right: 10, bottom: 10, left: 70}
       scatterWidth = 300 - padding.left - padding.right;
       scatterHeight = 300 - padding.top - padding.bottom;
       
       div = d3.select("#chart2")
         .append("div")
           .attr("class", "tooltip")
           
           .style("opacity", 0)
         // .append("g")
         //   .attr('transform', 'translate(' + padding.left + ', ' + padding.top + ')');
      //  svgScatter = d3.select("div")
      //    .append("svg")
      //    .attr('width', scatterWidth + padding.left + padding.right)
      //    .attr('height', scatterHeight + padding.top + padding.bottom)
      //    .style("display", "block")


       div.append("g")
           .attr('transform', 'translate(10,10)')
           .call(d3.axisBottom()
                 .scale(xScale)
                 .tickFormat(d3.format("d"))
                 .ticks(20)
           );


     // var toolTip = d3.select("div")  
     //   .append("svg")
     //     .attr('width', scatterWidth)
     //     .attr('height', scatterHeight)
       // .html("<p>the svg inside a tooltip: </p><div id='tipDiv'></div>");
     
     // define the line
     let valueLine = d3.line()
         .x(function(d) {  return xScale(d['year']) + 30})
         .y(function(d) {  return yScale(d['Life Ladder']) + 25})
     
     svg.append("path")
       .attr("class", "line")
       .attr("d", valueLine(data))
       .attr("stroke", "#1f77b4")
       .attr("stroke-width", "3")
       .style("fill", "none")
       .on("mouseover", d => {
         div.transition()
             .duration(100)
             .style("opacity", .9);
         div//.html(svgScatter)
           .style("left", (d3.event.pageX) + "px")
           .style("top", (d3.event.pageY) + "px");
       })
       .on("mouseout", d => {
           div.transition()
             .duration(100)
             .style("opacity", 0);
       })
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