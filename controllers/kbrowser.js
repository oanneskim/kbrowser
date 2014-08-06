var hm=require('../hmtools.js');
var d3tools = require('../d3tools.js');

exports.getBams = function getBams(req, res){
	hm.getBams(req.body,function(err,data){
		res.json(200,data);
	});
}
exports.update = function(req, res, next){
	// get bed12 from bam
	hm.getBams(req.body,function(err,data){
		req.body.result = data
		next();
	});
},function(req, res, next){
	// bed12 to xy
var data = [ { label: "Data Set 1", 
               x: [0, 1, 2, 3, 4], 
               y: [0, 1, 2, 3, 4] }, 
             { label: "Data Set 2", 
               x: [0, 1, 2, 3, 4], 
               y: [0, 1, 4, 9, 16] } ] ;
var xy_chart = d3tools.d3_xy_chart()
    .width(960)
    .height(500)
    .xlabel("X Axis")
    .ylabel("Y Axis") ;
var svg = d3.select("body").append("svg")
    .datum(data)
    .call(xy_chart) ;
	res.json(200,'hi');//req.body.data);
	//var svg = hm.bed12ToGeneSvg({id: "canvas", data: req.data[1].gene, trackWidth: 80, trackHeight: 20});
	//res.json(200,svg);
}

