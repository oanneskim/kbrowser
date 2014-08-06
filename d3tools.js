var d3=require('d3');

function d3_gene_chart() {
    var width = 640,  
        height = 200, 
		start = 0,
		end = 1000;

	function chart(selection){
		selection.each(function(datasets){
            var margin = {top: 20, right: 80, bottom: 30, left: 50}, 
                innerwidth = width - margin.left - margin.right,
                innerheight = height - margin.top - margin.bottom,
				barheight = innerheight/datasets.length;

            var x_scale = d3.scale.linear()
                .range([0, innerwidth])
				.domain([start,end]);
                //.domain([d3.min(datasets, function(d) { return d.start + d3.min(d.starts); }),d3.max(datasets, function(d){ return d.end })]);

            var svg = d3.select(this)
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")") ;
            
			for( i in datasets){
				var xmin=-1,xmax=-1;
				var ytop = i * barheight + barheight*0.1;
				var ybot = i * barheight + barheight - barheight*0.1;
				var strand = datasets[i].strand;
				
				for( j in datasets[i].starts){
					var s=datasets[i].starts[j] + datasets[i].start, e=s+datasets[i].sizes[j];
					xmin = (xmin <0 || xmin > s) ? s: xmin;	
					xmax = (xmax <0 || xmax < e)? e: xmax;	
					svg.append("rect")
						.attr("x", x_scale(s))
						.attr("width", x_scale(e)-x_scale(s))
						.attr("y", ytop)
						.attr("height",ybot-ytop);
				}
				var intguide = (strand == '+')? ybot : ytop;
				svg.append("line")
					.attr("x1", x_scale(xmin))
					.attr("x2", x_scale(xmax))
					.attr("y1", intguide)
					.attr("y2", intguide)
					.style("stroke","black");
				
			}

		});
	}

	chart.start = function(value){
		if(!arguments.length) return start; start = value; 
        return chart;
	};
	chart.end = function(value){
		if(!arguments.length) return end; end = value; 
        return chart;
	};
    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };


    return chart;
}
/*
var data = [ { label: "Data Set 1", strand:'+' , starts: [100, 200], sizes:[10,10]}, 
			 { label: "Data Set 2", strand:'-', starts: [1000,1200], sizes:[20,20]}];

var chart = d3_gene_chart().width(960).height(100).start(0).end(500) ;
var svg = d3.select("body").append("svg").datum(data).call(chart) ;
console.log(svg.node().outerHTML);
*/

function d3_xy_chart() {
    var width = 640,  
        height = 480, 
        xlabel = "X Axis Label",
        ylabel = "Y Axis Label" ;
    
    function chart(selection) {
        selection.each(function(datasets) {
            //
            // Create the plot. 
            //
            var margin = {top: 20, right: 80, bottom: 30, left: 50}, 
                innerwidth = width - margin.left - margin.right,
                innerheight = height - margin.top - margin.bottom ;
            
            var x_scale = d3.scale.linear()
                .range([0, innerwidth])
				.domain([start,end]);
                //.domain([d3.min(datasets, function(d) { return d3.min(d.x); }), d3.max(datasets, function(d) { return d3.max(d.x); }) ]) ;
            
            var y_scale = d3.scale.linear()
                .range([innerheight, 0])
                .domain([ d3.min(datasets, function(d) { return d3.min(d.y); }),
                          d3.max(datasets, function(d) { return d3.max(d.y); }) ]) ;

            var color_scale = d3.scale.category10()
                .domain(d3.range(datasets.length)) ;

            var x_axis = d3.svg.axis()
                .scale(x_scale)
                .orient("bottom") ;

            var y_axis = d3.svg.axis()
                .scale(y_scale)
                .orient("left") ;

            var x_grid = d3.svg.axis()
                .scale(x_scale)
                .orient("bottom")
                .tickSize(-innerheight)
                .tickFormat("") ;

            var y_grid = d3.svg.axis()
                .scale(y_scale)
                .orient("left") 
                .tickSize(-innerwidth)
                .tickFormat("") ;

            var draw_line = d3.svg.line()
                .interpolate("basis")
                .x(function(d) { return x_scale(d[0]); })
                .y(function(d) { return y_scale(d[1]); }) ;

            var svg = d3.select(this)
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")") ;
            
            svg.append("g")
                .attr("class", "x grid")
                .attr("transform", "translate(0," + innerheight + ")")
                .call(x_grid) ;

            svg.append("g")
                .attr("class", "y grid")
                .call(y_grid) ;

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + innerheight + ")") 
                .call(x_axis)
                .append("text")
                .attr("dy", "-.71em")
                .attr("x", innerwidth)
                .style("text-anchor", "end")
                .text(xlabel) ;
            
            svg.append("g")
                .attr("class", "y axis")
                .call(y_axis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .style("text-anchor", "end")
                .text(ylabel) ;

            var data_lines = svg.selectAll(".d3_xy_chart_line")
                .data(datasets.map(function(d) {return d3.zip(d.x, d.y);}))
                .enter().append("g")
                .attr("class", ".d3_xy_chart_line") ;
            
            data_lines.append("path")
                .attr("class", "line")
                .attr("d", function(d) {return draw_line(d); })
                .attr("stroke", function(_, i) {return color_scale(i);}) ;
            
            data_lines.append("text")
                .datum(function(d, i) { return {name: datasets[i].label, final: d[d.length-1]}; }) 
                .attr("transform", function(d) { 
                    return ( "translate(" + x_scale(d.final[0]) + "," + 
                             y_scale(d.final[1]) + ")" ) ; })
                .attr("x", 3)
                .attr("dy", ".35em")
                .attr("fill", function(_, i) { return color_scale(i); })
                .text(function(d) { return d.name; }) ;

        }) ;
    }


	chart.start = function(value){
		if(!arguments.length) return start; start = value; 
        return chart;
	};
	chart.end = function(value){
		if(!arguments.length) return end; end = value; 
        return chart;
	};

    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.xlabel = function(value) {
        if(!arguments.length) return xlabel ;
        xlabel = value ;
        return chart ;
    } ;

    chart.ylabel = function(value) {
        if(!arguments.length) return ylabel ;
        ylabel = value ;
        return chart ;
    } ;

    return chart;
}
/*
var data = [ { label: "Data Set 1", 
               x: [0, 1, 2, 3, 4], 
               y: [0, 1, 2, 3, 4] }, 
             { label: "Data Set 2", 
               x: [0, 1, 2, 3, 4], 
               y: [0, 1, 4, 9, 16] } ] ;
var xy_chart = d3_xy_chart()
    .width(960)
    .height(500)
    .xlabel("X Axis")
    .ylabel("Y Axis") ;
var svg = d3.select("body").append("svg")
    .datum(data)
    .call(xy_chart) ;

console.log(svg.node().outerHTML);

*/
module.exports.d3_xy_chart = d3_xy_chart
module.exports.d3_gene_chart = d3_gene_chart

