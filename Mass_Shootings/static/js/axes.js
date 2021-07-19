function a() {  
  $('acontent').empty();

  // Define svg width and height
  var svgWidth = 1000;
  var svgHeight = 700;

  // Set margins for scatter
  var margin = { top: 20, right: 40, bottom: 90, left: 100 };
  
  // Define scatter width and height (svg area - margins)
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper, append SVG that holds the chart
  // https://medium.com/@louisemoxy/a-simple-way-to-make-d3-js-charts-svgs-responsive-7afb04bc2e4b
  var svg = d3.select("acontent")
    .append("svg")
    //.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    // Append the scatter group and shift the group by left and top margins
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);  

  var chosenXAxis = "race";
  var chosenYAxis = "count";

  //--- X-SCALE function - updates xScale upon axis change ---//
  function xScale(xdata, chosenXAxis) {
    var xBandScale = d3.scaleBand()
      .domain(xdata.map(d => d[chosenXAxis]))
      .range([0, width])
      .padding(0.1);
    // create scales
    return xBandScale;
  }
  //--- Y-SCALE function - updates yScale upon axis change ---//
  function yScale(ydata, chosenYAxis) {
    //create scales
    var yLinearScale = d3.scaleLinear()
      .domain([ d3.min(ydata, d => d[chosenYAxis] - 2),
                d3.max(ydata, d => d[chosenYAxis]) + 2 ])
      .range([height, 0]);
    return yLinearScale;
  }
  //--- X-AXIS RENDER function - updates bottom axis upon axis change ---//
  function renderXaxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
    return xAxis;
  }
  //--- Y-AXIS RENDER function - updates left axis upon axis change ---//
  function renderYaxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    return yAxis;
  }
  
  d3.json("/api/mass_shootings").then((massData, err) => {
    if (err) throw err;
    console.log(massData);
  
    // Get race incidences count
    var allRaces = [];
    var races = massData.map(d => d.race);

    var cnt = races.filter((v) => (v === "White")).length;
    allRaces.push({race:"White", count: cnt});
    cnt = races.filter((v) => (v === "Black")).length;
    allRaces.push({race:"Black", count: cnt});
    cnt = races.filter((v) => (v === "Latino")).length;
    allRaces.push({race:"Latino", count: cnt});   
    cnt = races.filter((v) => (v === "Native American")).length;
    allRaces.push({race:"Native American", count: cnt});    
    cnt = races.filter((v) => (v === "Asian")).length;
    allRaces.push({race:"Asian", count: cnt});    
    cnt = races.filter((v) => (v === "Unknown")).length;
    allRaces.push({race:"Unknown", count: cnt});    
    cnt = races.filter((v) => (v === "Other")).length;
    allRaces.push({race:"Other", count: cnt});    
    cnt = races.filter((v) => (v === "Unclear")).length;
    allRaces.push({race:"Unclear", count: cnt});    
    
    allRaces.sort(({count:a}, {count:b}) => b-a);
    console.log(allRaces);

    // Get age incidences count
    var allAges = [];
    var ages = massData.map(d => d.age_of_shooter);

    var cnt = ages.filter((v) => (v >= 10 && v < 20)).length;
    allAges.push({agebin:"10-19", count: cnt});
    var cnt = ages.filter((v) => (v >= 20 && v < 30)).length;
    allAges.push({agebin:"20-29", count: cnt});
    var cnt = ages.filter((v) => (v >= 30 && v < 40)).length;
    allAges.push({agebin:"30-39", count: cnt});
    var cnt = ages.filter((v) => (v >= 40 && v < 50)).length;
    allAges.push({agebin:"40-49", count: cnt});
    var cnt = ages.filter((v) => (v >= 50 && v < 60)).length;
    allAges.push({agebin:"50-59", count: cnt});
    var cnt = ages.filter((v) => (v >= 60 && v < 70)).length;
    allAges.push({agebin:"60-69", count: cnt});
    var cnt = ages.filter((v) => (v == "Unknown")).length;
    allAges.push({agebin:"Unknown", count: cnt});
    
    allAges.sort(({agebin:a}, {agebin:b}) => b-a);
    console.log(allAges);
    
    // Create x axis scale with padding
    var xBandScale = xScale(allRaces, chosenXAxis);
    // Create a linear scale for the vertical axis
    var yLinearScale = yScale(allRaces, chosenYAxis);
    
    // Create two new functions passing our scales in as arguments
    // These will be used to create the chart's axes
    var bottomAxis = d3.axisBottom(xBandScale);
    var leftAxis = d3.axisLeft(yLinearScale).ticks(10);

    // Append two SVG group elements to the chartGroup area,
    // and create the bottom and left axes inside of them
    var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    var yAxis = chartGroup.append("g")
      .call(leftAxis);

    // Create one rectagle group - linear and band scales to position each rect in the chart
    var rectangleGroup = chartGroup.selectAll("rect")
      .data(allRaces)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xBandScale(d.race))
      .attr("y", d => yLinearScale(d.count))
      .attr("width", xBandScale.bandwidth())
      .attr("height", d => height - yLinearScale(d.count))

    // Create x axis label
    var xLabelGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 10})`)    
    var raceLabel = xLabelGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "race") // value to grab for event listener
      .classed("active", true)
      .attr("class", "axisText")
      .text("Shooter Race");
    var agebinLabel = xLabelGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "agebin") // value to grab for event listener 
      .classed("inactive", true)
      .text("Shooter Age");

    // Create y axis label
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Number of Incidences");

    // x axis event listener
    xLabelGroup.selectAll("text").on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      console.log(value);

      if (value !== chosenXAxis) {
        chosenXAxis = value;
        console.log(chosenXAxis);
        if (chosenXAxis == "race") {
          // update xScale and axis
          xBandScale = xScale(allRaces, chosenXAxis);
          xAxis = renderXaxis(xBandScale, xAxis);
          // update circles with new x values
          //circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
          // update circles text with new x values
          //circlesText = renderXtext(circlesText, xLinearScale, chosenXAxis);
          // updates tooltips with new info
          //circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        }
        else {
          // update xScale and axis
          xBandScale = xScale(allAges, chosenXAxis);
          xAxis = renderYaxis(xBandScale, xAxis);
          // update circles with new x values
          //circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
          // update circles text with new x values
          //circlesText = renderXtext(circlesText, xLinearScale, chosenXAxis);
          // updates tooltips with new info
          //circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        }
      }
    })

  });
} 

function b() {
        $('bcontent').empty();
        d3.select('bcontent')
            .append('p')
            .text("This is B test");
} 