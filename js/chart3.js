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
       let dropDown = d3.select('body')
         .append('select')
         .on('change', function() {
           //filter data by country
           country = this.value;
           d3.selectAll("svg > *").remove();

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
       makeScatterPlot(csvData)

     })
   }

   function filterByCountry(csvData) {
     data = csvData.filter(function(d) {
       if(d["location"] == country){
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
       return +d["time"];
     });
     maxYear = d3.max(data, function(d) {
       return +d["time"];
     });

     // Scale x Axis
     let xScale = d3.scaleLinear()
       .domain([minYear, maxYear])
       .range([0, width + 50]);

     minPop = d3.min(data, function(d) {
       return +d["pop_mlns"];
     });
     maxPop = d3.max(data, function(d) {
       return +d["pop_mlns"];
     })

     // Scale y axis    
     let yScale = d3.scaleLinear()
       .domain([minPop, maxPop])
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
       svgScatter = d3.select("div")
         .append("svg")
         .attr('width', scatterWidth + padding.left + padding.right)
         .attr('height', scatterHeight + padding.top + padding.bottom)
         .style("display", "block")


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
         .x(function(d) {  return xScale(d.time) + 30})
         .y(function(d) {  return yScale(d.pop_mlns) + 25})
     
     svg.append("path")
       .attr("class", "line")
       .attr("d", valueLine(data))
       .attr("stroke", "#1f77b4")
       .attr("stroke-width", "1")
       .on("mouseover", d => {
         div.transition()
             .duration(100)
             .style("opacity", .9);
             svgScatter.append()
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


   function makeScatterPlot(data) {
     let fertility_rate_data = data.map((row) => parseInt(row.fertility_rate));
     let life_expectancy_data = data.map((row) => parseInt(row.life_expectancy));
 
     let newMinMaxData = findMinMax(fertility_rate_data, life_expectancy_data);
 
     let scaleAndMapFuncs = drawAxes(newMinMaxData, "fertility_rate", "life_expectancy", svgScatter, 300);
 
     plotData(scaleAndMapFuncs, svgScatter);
     labels = ["Countries by Life Expectancy and Fertility Rate", "Fertility Rates (Avg Children per Woman)", 'Life Expectancy (years)']
     placements = [10, 7, 10, 20, 60, 295, 'translate(7, 200)rotate(-90)']
 
     makeLabels(svgScatter, labels, placements);
   }

   function plotData(mapFunctions, svgContainer) {
     let popData = allYearsData.map((row) => +row["pop_mlns"]);
     let popMinMax = d3.extent(popData);
 
     let pop_map_func = d3.scaleLinear()
       .domain([popMinMax[0], popMinMax[1]])
       .range([3, 10]);
 
     let xMap = mapFunctions.x;
     let yMap = mapFunctions.y;
 
 
     dots = svgContainer.selectAll(".dot")
       .data(allYearsData)
       .enter()
       .append("circle")
         .attr("class", (d) => d.time)
         .attr("cx", xMap)
         .attr("cy", yMap)
         .attr("r", (d) =>   pop_map_func(d["pop_mlns"]))
         .attr("fill", "steelblue")
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
       .text("Average Population Size (millions)")

   }

   // find min and max for arrays of x and y
   function findMinMax(x, y) {
     // get min/max x values
     let xMin = d3.min(x);
     let xMax = d3.max(x);
     // get min/max y values
     let yMin = d3.min(y);
     let yMax = d3.max(y);
     // return formatted min/max data as an object
     return {
       xMin : xMin,
       xMax : xMax,
       yMin : yMin,
       yMax : yMax
     }
   }  

   function makeLabels(svgContainer, labels, place) {
     placements = [14, 10, 100, 40, 130, 490, 'translate(15, 300)rotate(-90)']
 
     svgContainer.append('text')
       .attr('x', place[2])
       .attr('y', place[3])
       .style('font-size', place[0] + 'pt')
       .text(labels[0]);
     // svgContainer.append('text')
     //   .attr('x', place[4])
     //   .attr('y', place[5])
     //   .style('font-size', place[1] + 'pt')
     //   .text(labels[1]);
 
     svgContainer.append('text')
       .attr('transform', place[6])
       .style('font-size', place[1] + 'pt')
       .text(labels[2]);
   }

   function drawAxes(limits, x, y, svgContainer, size) {
     // return x value from a row of data
     let xValue = function(d) { return +d[x]; }
     let xScale = "";
     if(size == 300) {
       xScale = d3.scaleLinear()
         .domain([limits.xMin - 0.5, limits.xMax + 1]) // give domain buffer room
         .range([size * 0.1, size * 0.9]);
     } else {
       xScale = d3.scaleLinear()
         .domain([limits.xMin, limits.xMax]) // give domain buffer room
         .range([size * 0.1, size * 0.9]);
     }
     // xMap returns a scaled x value from a row of data
     let xMap = function(d) { return xScale(xValue(d)); };
 
     // plot x-axis at bottom of SVG
     let xAxis = d3.axisBottom().scale(xScale);
     svgContainer.append("g")
       .attr('transform', 'translate(0, ' + size * .9 + ')')
       .attr('font-size', '5pt')
       .call(xAxis);
 
     // return y value from a row of data
     let yValue = function(d) { return +d[y]}
 
     // function to scale y
     let yScale = d3.scaleLinear()
       .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
       .range([size *0.1, size * 0.9]);
 
     // yMap returns a scaled y value from a row of data
     let yMap = function (d) { return yScale(yValue(d)); };
 
     // plot y-axis at the left of SVG
     let yAxis = d3.axisLeft().scale(yScale);
     svgContainer.append('g')
       .attr('transform', 'translate(' + size * 0.1 + ', 0)')
       .call(yAxis);
 
     // return mapping and scaling functions
     return {
       x: xMap,
       y: yMap,
       xScale: xScale,
       yScale: yScale
     };
   }
 })();