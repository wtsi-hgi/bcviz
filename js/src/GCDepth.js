var chartIndex = 0;
define(['jquery', 'd3', 'src/divSelections'], function(jQuery, d3, checkDivSelection){
    return function (data, divID, title, width, height) {
        if(title && data[9]){
            title = data[9].title;
        }
        if(data && data[8] && data[8][1] && data[8][1].values && data[8][1].values.length > 1){
            if(width && height){
                return new gcDepthGraph(data[8], divID, title, width, height);
            }else{
                return new gcDepthGraph(data[8], divID, title);
            }
        }else{
          window.console.log('data does not exist; chart not created.');
          return null;
        }
    };
    function gcDepthGraph (data, divID, title, width, height) {
        var w = 350;
        var h = 250;
        var padding = {top: 40, right: 25, bottom: 50, left: 65};
        var xLabel = data[0].xLabel;
        var yLabel = data[0].yLabel;

        if(width && height){
              w = width;
              h = height;
        }

        if(title){
          padding.top = 60;
        }

        var gcContent = [0];
        var percentile = [];

        divID = checkDivSelection(divID);

        chartIndex++;

        for(var i in data[4].values){
            gcContent.push(data[4].values[i].yVar);
            percentile.push(data[4].values[i].xVar);
        }

        //Create SVG element
        var svg = d3.select(divID).append('svg')
          .attr("width", w)
          .attr("height", h);

        //create scale functions
        var xScale = d3.scale.linear()
             .nice()
             .range([padding.left, w - (padding.right)]);

        var yScale = d3.scale.linear()
            .nice()
            .range([h - padding.bottom, padding.top]);

        var gcContentScale = d3.scale.threshold()
             .domain(percentile)
             .range(gcContent);

        //Define X axis
        var xAxis = d3.svg.axis()
           .scale(xScale)
           .orient("bottom")
           .ticks(10);

        //define Y axis
        var yAxis = d3.svg.axis()
           .scale(yScale)
           .orient("left")
           .ticks(10);

        var color = d3.scale.category10();

        function make_x_grid() {
          return d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks(10);
        }

        function make_y_grid() {
          return d3.svg.axis()
              .scale(yScale)
              .orient("left")
              .ticks(10);
        }

        svg.append("clipPath")
          .attr("id", "chart-area" + chartIndex)
          .append("rect")
          .attr("x", padding.left)
          .attr("y", padding.top)
          .attr("width", w - (padding.right + padding.left))
          .attr("height", h - (padding.top + padding.bottom));

        var points = [];

        var graphKeys = ["10-90th Percentile", "25-75th Percentile", "50th Percentile"];

        for(i in data){
          if (jQuery.inArray(data[i].name, graphKeys) !== -1){
            points.push(data[i]);
          }
        }

        //set keys on colour scale
        color.domain(graphKeys);

        var xMin = d3.min(points, function(p) { return d3.min(p.values, function(v) { return v.xVar; }); });
        var xMax = d3.max(points, function(p) { return d3.max(p.values, function(v) { return v.xVar; }); });

        var yMin = d3.min(points, function(p) { return d3.min(p.values, function(v) { return v.yVar0; }); });
        var yMax = d3.max(points, function(p) { return d3.max(p.values, function(v) { return v.yVar0; }); });

        xScale.domain([xMin, xMax]);

        //set yScale domain
        yScale.domain([yMin,yMax]);

        //create top axis and labels
        var topAxis = svg.append('g').style("font-size", "10px");

        topAxis.append("rect")
          .attr("x", padding.left)
          .attr("y", padding.top)
          .attr("width", w - padding.left - padding.right + 1)
          .attr("height", 1);

        topAxis.append("rect")
          .attr("x", w - padding.right)
          .attr("y", padding.top - 5)
          .attr("width", 1)
          .attr("height", 5);

        topAxis.append("rect")
          .attr("x", padding.left)
          .attr("y", padding.top - 5)
          .attr("width", 1)
          .attr("height", 5);

        topAxis.append("text")
          .attr("x", w / 2)
          .attr("y", padding.top - 20)
          .attr("text-anchor", "middle")
          .text("GC Content (%)");

        topAxis.append("text")
          .attr("x", xScale(1))
          .attr("y", padding.top - 5)
          .attr("text-anchor", "middle")
          .text(gcContentScale(1));

        topAxis.append("text")
          .attr("x", xScale(25))
          .attr("y", padding.top - 5)
          .attr("text-anchor", "middle")
          .text(gcContentScale(25));

        topAxis.append("text")
          .attr("x", xScale(50))
          .attr("y", padding.top - 5)
          .attr("text-anchor", "middle")
          .text(gcContentScale(50));

        topAxis.append("text")
          .attr("x", xScale(75))
          .attr("y", padding.top - 5)
          .attr("text-anchor", "middle")
          .text(gcContentScale(75));

        topAxis.append("text")
          .attr("x", xScale(100))
          .attr("y", padding.top - 5)
          .attr("text-anchor", "middle")
          .text(gcContentScale(100));

        if(title){
          //append title
          svg.append('text')
            .attr('x', padding.left)
            .attr('y', padding.top / 4)
            .style('font-size', '12px')
            .text(title);
        }

        //Create X axis
        svg.append("g")
          .attr("class", "axis")
          .attr("id", "xAxis")
          .attr("transform", "translate(0," + (h-padding.bottom) + ")")
          .call(xAxis)
         .append("text")
          .attr("dy", ".71em")
          .attr("text-anchor", "middle")
          .attr("transform", "translate(" + (w / 2) + "," + padding.bottom / 2 + ")")
          .attr("style", "font-size: 12; font-family: Helvetica, sans-serif")
          .text(xLabel);

        //Create Y axis
        svg.append("g")
          .attr("class", "axis")
          .attr("id", "yAxis")
          .attr("transform", "translate(" + padding.left + ", 0)")
          .call(yAxis)
         .append("text")
          .attr("dy", -padding.left/1.5)
          .attr("transform", "translate(0," + h/2 + ")rotate(-90)")
          .attr("style", "font-size: 12; font-family: Helvetica, sans-serif")
          .attr("text-anchor", "middle")
          .text(yLabel);

        //make x grid
        svg.append("g")
          .attr("class", "grid")
          .attr("id", "xGrid")
          .attr("transform", "translate(0," + (h - padding.bottom) + ")")
          .call(make_x_grid()
              .tickSize(-h+(padding.top + padding.bottom), 0, 0)
              .tickFormat("")
          );

        //make y grid
        svg.append("g")
          .attr("class", "grid")
          .attr("id", "yGrid")
          .attr("transform", "translate(" + padding.left + ",0)")
          .call(make_y_grid()
            .tickSize(-w+(padding.left + padding.right), 0,0)
            .tickFormat("")
          );

        //seperate the areas
        var layers0 = [points[0]];

        var layers1 = [points[1]];

        var median = [points[2]];

        //draw the areas
        var area = d3.svg.area()
          .x(function(d) { return xScale(d.xVar); })
          .y0(function(d,i) { return yScale(d.yVar0); })
          .y1(function(d,i) { return yScale(d.yVar); });

        //draw the first area
        svg.selectAll(".layers0")
          .data(layers0)
          .enter().append("path")
          .attr("d",function (d) { return area(d.values); })
          .style("fill", function(d) { return color(d.name); });

        //draw the second area
        svg.selectAll(".layers1")
          .data(layers1)
          .enter().append("path")
          .attr("d",function (d) { return area(d.values); })
          .style("fill", function(d) { return color(d.name); });

        //line generator
        var line = d3.svg.line()
          .interpolate("linear")
          .x(function (d) {return xScale(d.xVar);})
          .y(function (d) {return yScale(d.yVar);});

        //create graphs for the median data
        var aValue = svg.selectAll(".median")
          .data(median)
          .enter().append("g")
          .attr("id", "graphs")
          .attr("clip-path", "url(#chart-area" + chartIndex + ")");

        //draw lines in graphs
        aValue.append("path")
           .attr("class", "line1")
           .attr("d", function(d) { return line(d.values); })
           .style("stroke", function(d) { return color(d.name); });

        gcLegend(h, padding, points, divID, color);
    }
    function gcLegend (h, padding, points, divID, color) {

        var svg = d3.select(divID).append('svg')
          .attr("width", h * 0.4)
          .attr("height", h);

        //create the legend
        var legend = svg.selectAll('g')
            .data(points).enter()
            .append('g')
            .attr('class', 'legend');

        //draw colours in legend  
        legend.append('rect')
            .attr('x', 1)
            .attr('y', function(d, i){return padding.top + i * 20;})
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', function(d) {return color(d.name);});

        //draw text in legend
        legend.append('text')
            .attr('x', 15)
            .attr('y', function(d, i){return padding.top + i * 20 + 9;})
            .style('font-size', '10px')
            .text(function(d){ return d.name;});
    }
});