(function() {

    const width = 960;
    const height = 500;
    let statesLivedData = [];
    let citiesLivedData = [];
    let countriesGeoJSONData = [];
    let countriesData = [];
    window.onload = function() {

        d3.csv("data/world-happiness-report-2021.csv")
            .then((data) => {
                countriesData = data;
                loadCountriesJSONData();
            })
    }

    function loadCountriesJSONData() {
        d3.json("data/world_countries.json")
            .then((data) => {
                countriesGeoJSONData = data;
                makeMapPlot();
            })
    }

    function makeMapPlot() {

        // define the projection type we want
        let projection = d3.geoMercator()
        .scale(130)
       .translate( [width / 2, height / 1.5]);
        
        // path generator
        let path = d3.geoPath() // converts geoJSON to SVG paths
            .projection(projection); // use AlbersUSA projection

        let color = d3.scaleThreshold()
        .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)"]);
        
        let legendText = ["100", "90", "80", "70", "60", "50", "40", "30", "20", "10"];
        
        let svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append('g')
            .attr('class', 'map');

        let tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        
        
        // Loop through each Country data value in the .csv file
        for (let i = 0; i < countriesData.length; i++) {

            // Grab Country Code
            let curCountry = countriesData[i];

            // let dataCountryCode = countriesData[i].Country_Code;
            let countryName = curCountry["Country name"]

            // Grab data value 
            let dataValue = curCountry["Ladder score"]; //countriesData[i].Overall_Score_2016;



            // Find the corresponding country inside the GeoJSON
            for (let j = 0; j < countriesGeoJSONData.features.length; j++)  {
                let geoCountryName = countriesGeoJSONData.features[j].properties.name;

                if (countryName == geoCountryName) {
                    // Copy the data value into the JSON
                    countriesGeoJSONData.features[j].properties.value = dataValue; 

                    // Stop looking through the JSON
                    break;
                }
            }
        }

        // Bind the data to the SVG and create one path per GeoJSON feature
        svg.selectAll("path")
            .data(countriesGeoJSONData.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", function(d) {

                var value = d.properties.value;

                if (value) {
                    return color(value);
                } else {
                    return "rgb(213,222,217)";
                }
            })
            .on("mouseover", function(d) {
                tooltip.transition()        
                .duration(200)      
                .style("opacity", .9);   
                    tooltip.html("<strong>Country:</strong> " + d.properties.name + "<br>" 
                               + "<strong>Happiness Score:</strong> " + Math.round(d.properties.value * 1000) / 100)
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
            })   

            // fade out tooltip on mouse out               
            .on("mouseout", function(d) {       
                tooltip.transition()        
                .duration(500)      
                .style("opacity", 0);   
            });

            var legend = d3.select("body").append("svg")
                .attr("class", "legend")
                .attr("width", 140)
                .attr("height", 200)
                .selectAll("g")
                .data(color.domain().slice().reverse())
                .enter()
                .append("g")
                .attr("transform", function(d, i) { return "translate(90," + i * 20 + ")"; });

            legend.append("rect")
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", color);

            legend.append("text")
                .data(legendText)
                .attr("x", 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .text(function(d) { return d; });


    }
    // end of make map plot

    // $(function() {
    //     $('#nav li a').click(function() {
    //         $(this).closest('li') // select the parent <li> tag
    //         .addClass('active')// add the active class
    //         .siblings() // select the siblings of the active tag
    //         .removeClass('active'); // remove the active class from the other <li>
    //     });
    // });
    
})();