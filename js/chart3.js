(function() {

  let data = "no data";
  let allYearsData = "";
  let svg = "";
  let div = "";
  let svgScatter = "";
  let toolTip = "";

  window.onload = function() {

    d3.csv("data/world-happiness-report-2021.csv")
      .then((data) => {
      let csvData = data;
    
      // make dropdown
      // let dropDown = d3.select('body')
      //   .append('select')
      //   .on('change', function() {
      //     //filter data by country
      //     country = this.value;
      //     d3.selectAll("svg").remove();

      //     makeScatterPlot(csvData);
      //   });

      // let allCountries = [...new Set(data.map((row) => row["Country name"]))];

      // var dropDownSelection = dropDown.selectAll('option')
      //   .data(allCountries)
      //   .enter()
      //     .append('option')
      //     .text((d) => { return d; })
      //     .property("selected", function(d) {return d == country; });
      
      allYearsData = csvData;
      makeScatterPlot(csvData);

    })
  }

  function filterByCountry(csvData) {
    data = csvData.filter(function(d) {
      if(d["Country name"] == country){
        return d;
      }
    });
  }

  function makeScatterPlot(csvData) {
    // filterByCountry(csvData);
    data = csvData;
    
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

  // }

    ////////// make the tooltip

      let padding = {top: 10, right: 10, bottom: 10, left: 70}
      scatterWidth = 300 - padding.left - padding.right;
      scatterHeight = 300 - padding.top - padding.bottom;

      // tooltip = d3.select("body")
      //      .append("div")
      //      .attr("class", "tooltip")
      //      .style("opacity", 0);
      
      tooltip = d3.select("#chart3")
        .append("div")
          .attr("class", "tooltip")
          .style("opacity", 0)
        // .append("g")
        //   .attr('transform', 'translate(' + padding.left + ', ' + padding.top + ')');
      // svgScatter = d3.select("div")
      //   .append("svg")
      //   .attr('width', scatterWidth + padding.left + padding.right)
      //   .attr('height', scatterHeight + padding.top + padding.bottom)
      //   .style("display", "block")


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
        .attr("cx", function (d) { return xScale(d['Logged GDP per capita']); } )
        .attr("cy", function (d) { return yScale(d['Ladder score']*10); } )
        .attr("r", function (d) { return 10; }) //z(d.happiness); } )
        .style("fill", function (d) { return "rgb(66,146,198)"; } ) //color(d.happiness); } )
        .style("opacity", 0.5)
        .style("stroke", "white")
        .on("mouseover", function(d) {
          console.log(d);
          // d3.select(".tooltip")
          tooltip.transition()
            .duration(200)      
            .style("opacity", 0.9)

          console.log(d["Logged GDP per capita"]);
          tooltip.html("<strong>Country:</strong> " + d["Country name"] + "<br>" 
                      + "<strong>Happiness Score:</strong> " + Math.round(d["Ladder score"] * 1000) / 100 + "<br>"
                      + "<strong>GDP per Capita:</strong> " + (d["Logged GDP per capita"]))
                      
            .style("left", (d3.event.pageX) + "px")     
            .style("top", (d3.event.pageY - 28) + "px");    
      })   

      // fade out tooltip on mouse out               
      .on("mouseout", function(d) {       
          tooltip.transition()        
          .duration(700)      
          .style("opacity", 0);   
      });
      // .on("mouseover", mouseover )
      // .on("mousemove", mousemove )
      // .on("mouseleave", mouseleave )
  }


  // function makeScatterPlot_old(data) {
  //   let fertility_rate_data = data.map((row) => parseInt(row.fertility_rate));
  //   let life_expectancy_data = data.map((row) => parseInt(row.life_expectancy));

  //   let newMinMaxData = findMinMax(fertility_rate_data, life_expectancy_data);

  //   let scaleAndMapFuncs = drawAxes(newMinMaxData, "fertility_rate", "life_expectancy", svgScatter, 300);

  //   plotData(scaleAndMapFuncs, svgScatter);
  //   labels = ["Countries by Life Expectancy and Fertility Rate", "Fertility Rates (Avg Children per Woman)", 'Life Expectancy (years)']
  //   placements = [10, 7, 10, 20, 60, 295, 'translate(7, 200)rotate(-90)']

  //   makeLabels(svgScatter, labels, placements);
  // }

  // function plotData(mapFunctions, svgContainer) {
  //   let popData = allYearsData.map((row) => +row["pop_mlns"]);
  //   let popMinMax = d3.extent(popData);

  //   let pop_map_func = d3.scaleLinear()
  //     .domain([popMinMax[0], popMinMax[1]])
  //     .range([3, 10]);

  //   let xMap = mapFunctions.x;
  //   let yMap = mapFunctions.y;


  //   dots = svgContainer.selectAll(".dot")
  //     .data(allYearsData)
  //     .enter()
  //     .append("circle")
  //       .attr("class", (d) => d.time)
  //       .attr("cx", xMap)
  //       .attr("cy", yMap)
  //       .attr("r", (d) =>   pop_map_func(d["pop_mlns"]))
  //       .attr("fill", "steelblue")
  // }

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
      .text("GDP Per Capita")
    
    
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

  // find min and max for arrays of x and y
  // function findMinMax(x, y) {
  //   // get min/max x values
  //   let xMin = d3.min(x);
  //   let xMax = d3.max(x);
  //   // get min/max y values
  //   let yMin = d3.min(y);
  //   let yMax = d3.max(y);
  //   // return formatted min/max data as an object
  //   return {
  //     xMin : xMin,
  //     xMax : xMax,
  //     yMin : yMin,
  //     yMax : yMax
  //   }
  // }  

  // function drawAxes(limits, x, y, svgContainer, size) {
  //   // return x value from a row of data
  //   let xValue = function(d) { return +d[x]; }
  //   let xScale = "";
  // //   if(size == 300) {
  // //     xScale = d3.scaleLinear()
  // //       .domain([limits.xMin - 0.5, limits.xMax + 1]) // give domain buffer room
  // //       .range([size * 0.1, size * 0.9]);
  // //   } else {
  //     xScale = d3.scaleLinear()
  //       .domain([limits.xMin, limits.xMax]) // give domain buffer room
  //       .range([size * 0.1, size * 0.9]);
  // //   }
  //   // xMap returns a scaled x value from a row of data
  //   let xMap = function(d) { return xScale(xValue(d)); };

  //   // plot x-axis at bottom of SVG
  //   let xAxis = d3.axisBottom().scale(xScale);
  //   svgContainer.append("g")
  //     .attr('transform', 'translate(0, ' + size * .9 + ')')
  //     .attr('font-size', '5pt')
  //     .call(xAxis);

  //   // return y value from a row of data
  //   let yValue = function(d) { return +d[y]}

  //   // function to scale y
  //   let yScale = d3.scaleLinear()
  //     .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
  //     .range([size *0.1, size * 0.9]);

  //   // yMap returns a scaled y value from a row of data
  //   let yMap = function (d) { return yScale(yValue(d)); };

  //   // plot y-axis at the left of SVG
  //   let yAxis = d3.axisLeft().scale(yScale);
  //   svgContainer.append('g')
  //     .attr('transform', 'translate(' + size * 0.1 + ', 0)')
  //     .call(yAxis);

  //   // return mapping and scaling functions
  //   return {
  //     x: xMap,
  //     y: yMap,
  //     xScale: xScale,
  //     yScale: yScale
  //   };
  // }
})();