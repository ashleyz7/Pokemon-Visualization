'use strict';

(function() {

  let data = "no data";
  let svgContainer = ""; // keep SVG reference in global scope
  let gSelected = 'all'
  let lSelected = 'all'

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 1500)
      .attr('height', 1500);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("pokemon.csv")
      .then((data) => makeScatterPlot(data));

    
  }

  // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = csvData // assign data as global variable
   

    // get arrays of fertility rate data and life Expectancy data
    let total_data = data.map((row) => parseFloat(row["Total"]));
    let sp_data = data.map((row) => parseFloat(row["Sp. Def"]));

    // find data limits
    let axesLimits = findMinMax(sp_data, total_data);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "Sp. Def", "Total");

    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

    // draw title and axes labels
    makeLabels();
}

  // make title and axes labels
  function makeLabels() {
    svgContainer.append('text')
        .attr('x', 50)
        .attr('y', 30)
        .style('font-size', '14pt')
        .text("Pokemon: Special Defense vs Total Stats");

    svgContainer.append('text')
      .attr('x', 500)
      .attr('y', 530)
      .style('font-size', '10pt')
      .text('Sp.Def');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .style('font-size', '10pt')
      .text('Total');
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {

    // mapping functions
    let xMap = map.x;
    let yMap = map.y;

    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    const colors = {
        "Bug": "#4E79A7",
        "Dark": "#A0CBE8",
        "Electric": "#F28E2B",
        "Fairy": "#FFBE&D",
        "Fighting": "#59A14F",
        "Fire": "#8CD17D",
        "Ghost": "#B6992D",
        "Grass": "#499894",
        "Ground": "#86BCB6",
        "Ice": "#86BCB6",
        "Normal": "#E15759",
        "Poison": "#FF9D9A",
        "Psychic": "#79706E",
        "Steel": "#BAB0AC",
        "Water": "#D37295"
    }
    

    // append data to SVG and plot as points
    var dots = svgContainer.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', 7)
        .attr('fill', (d) => {return colors[d['Type 1']]})
        .attr('stroke', "#4E79A7")
        // .attr('data-legend', (d) => {return d['Type 1']})
        // add tooltip functionality to points
        .on("mouseover", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", .9)
          div.html( d['Name'] + '<br/>' + d['Type 1'] + '<br/>' + d['Type 2'])
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY) + "px");
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });

    
    // Legend
    var size = 15;

    var legendTitle = svgContainer.append('text')
                                    .attr('x', 1000)
                                    .attr('y', 80)
                                    .text("Type 1");

    var legend = svgContainer.selectAll('rect')
            .data(Object.keys(colors))
            .enter()
            .append('rect')
            .attr('x', 1000)
            .attr('y',function(d, i) {return 90 + i * (size + 3.5)})
            .attr('width', size)
            .attr('height', size)
            .style('fill', function(d) { return colors[d]});

   
    var label = svgContainer.selectAll('textLabel')
            .data(Object.keys(colors))
            .enter()
            .append('text')
            .attr('x', 1000 + size * 1.5)
            .attr('y', function(d, i) {return 100 + i * (size + 3.75) })
            .style('fill', 'black')
            .text(function(d) {return d})
           
    // drop down box for filter generation
    var gDropDown = d3.select("#filter").append("select")
                    .attr("name", "generation");

    // var options = dropDown.selectAll("option")
    //   .data(d3.map(data, function(d) {return d['Generation'];}).keys())
    //   .enter()
    //   .append("option")
    //   .text(function(d) {return d;})
    //   .attr('value', function(d) {return d;});

    var defaultOption = gDropDown.append('option')
                                .text('All')
                                .attr('value', 'all')
                                .enter();

    var options = gDropDown.selectAll("option.generation")
                          .data(d3.map(data, function(d) {return d['Generation'];}).keys())
                          .enter()
                          .append("option")
                          .classed('generation', true)
                          .text(function(d) {return d;})
                          .attr('value', function(d) {return d;});

    // drop down box for filter legendary
    var lDropDown = d3.select("#box").append("select")
                    .attr("name", "legendary");


    var defaultOption = lDropDown.append('option')
                                .text('All')
                                .attr('value', 'all')
                                .enter();

    var options = lDropDown.selectAll("option.legendary")
                          .data(d3.map(data, function(d) {return d['Legendary'];}).keys())
                          .enter()
                          .append("option")
                          .classed('legendary', true)
                          .text(function(d) {return d;})
                          .attr('value', function(d) {return d;});


    gDropDown.on("change", function() {
          gSelected = this.value;
          var displayOthers = this.checked ? "inline" : "none";
          var display = this.checked ? "none" : "inline";
    

    
    if (gSelected == 'all' && lSelected == 'all') {
        dots.attr('display', display)

      } else if (gSelected != 'all' && lSelected == 'all') {
        dots
        .filter(function(d) {return gSelected != d['Generation'];})
        .attr("display", displayOthers);
              
        dots
        .filter(function(d) {return gSelected == d['Generation'];})
        .attr("display", display);

      } else {
        console.log(displayOthers)
        console.log(lSelected)
        console.log(gSelected)
        dots
        .filter(function(d) {return d => ((d['Generation'] != gSelected) && (d['Legendary'] != lSelected));})
        .attr("display", displayOthers);
              
        dots
        .filter(function(d) {return d => ((d['Generation'] == gSelected) && (d['Legendary'] == lSelected));})
        .attr("display", display);       
      }            
    });




    lDropDown.on("change", function() {
          lSelected = this.value;
          var displayOthers = this.checked ? "inline" : "none";
          var display = this.checked ? "none" : "inline";

          
    
    if (lSelected == 'all' && lSelected == 'all') {
        dots.attr('display', display)

      } else if (gSelected == 'all' && lSelected != 'all'){
        dots
        .filter(function(d) {return lSelected != d['Legendary'];})
        .attr("display", displayOthers);
              
        dots
        .filter(function(d) {return lSelected == d['Legendary'];})
        .attr("display", display);
        

      } else {
        console.log(displayOthers)
        console.log(lSelected)
        console.log(gSelected)
        dots
        .filter(function(d) {return ((d['Generation'] != gSelected) && (d['Legendary'] != lSelected));})
        .attr("display", displayOthers);
              
        dots
        .filter(function(d) {return ((d['Generation'] == gSelected) && (d['Legendary'] == lSelected));})
        .attr("display", display);     
      }
 
    });

 
}
    

  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 5, limits.xMax + 5]) // give domain buffer room
      .range([50, 950]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 500)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
      .range([50, 500]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
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

  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }




})();
