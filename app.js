
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var app = express();
var tsv = require('node-tsv-json');
var d3 = require('d3');
var async = require('async');
var mongoose = require('mongoose');
var fs = require('fs');


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/javascript')));
app.use(app.router);
//app.use(require('express-jquery')('/jquery.js'));


// import controllers 
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
var kbrowser = require('./controllers/kbrowser.js');
var hm = require('./hmtools.js');

var first_data={"interval":"chr12:6641280-6650666",
"tracks":[
 {"name":"c4","type":"rnaseq","bam":"http://bentleylab.ucdenver.edu/LabUrl/c41.bam"},
 {"name":"polii_1","type":"chipseq","fragment_size":200, "bin_size":50,"bam":"http://bentleylab.ucdenver.edu/LabUrl/GSM733643_hg19_wgEncodeBroadHistoneK562Pol2bStdAlnRep1.bam"},
 {"name":"polii_2","type":"chipseq","fragment_size":400,"color":"red", "bin_size":50,"bam":"http://bentleylab.ucdenver.edu/LabUrl/GSM733643_hg19_wgEncodeBroadHistoneK562Pol2bStdAlnRep1.bam"},
 {"name":"gene","type":"gene","bam":"http://bentleylab.ucdenver.edu/LabUrl/hg19RefGene.bam"}
]
};

app.get('/kbrowser',function(req,res){
	res.render('pages/kbrowser',{ track_info: first_data});	
});
app.get('/about',function(req,res){
	res.render('pages/about');
});
app.post('/api/kbrowser/update',function(req,res,next){
	hm.getBams(req.body,function(err, data){
		for( i in data){
		for( j in req.body.tracks){
			if( data[i].name == data[j].name){
				req.body.tracks[i].bed12 = data[j].res;
			}
		}}
		next();
	});
},function(req,res){
	//console.log(req.body);
	var d3tools = require('./d3tools');
	var height=200, width=800;
	var svgs = '';
	var a = req.body.interval.split(":");
	var b = a[1].split("-");
	var start = parseInt(b[0]),end=parseInt(b[1]);

	var chipseq_data = {xs:{}, columns:[], types:{}, axes:{}};
	for(i in req.body.tracks){
		var track = req.body.tracks[i];

		if( track.type == 'chipseq'){
			var r = hm.chipseqDensity({ fragment_size: track.fragment_size, bin_size: track.bin_size, data:track.bed12});
			chipseq_data.xs[ track.name ] = track.name+"_x"; 
			r.x.unshift(track.name+"_x")
			r.y.unshift(track.name)
			chipseq_data.columns.push(r.x);
			chipseq_data.columns.push(r.y);
			//chipseq_data.types[ track.name ] = 'step';
			chipseq_data.axes[ track.name ] = 'y';
			//var xy_chart = d3tools.d3_xy_chart().width(width).height(height).xlabel("X Axis").ylabel("Y Axis").start(start).end(end);
			//var svg = d3.select("body").append("svg").datum([{ label: track.name, x:r.x, y: r.y}]).call(xy_chart) ;
			//svgs += svg.node().outerHTML;
		}else if(track.type == 'gene'){
			var genes= hm.bedToJson(track.bed12);
			for(var i in genes){
				gene = genes[i]
				genename = gene.name + "_" + i.toString();
				chipseq_data.xs[ genename ] = genename+"_x"; 
				var x = [], y = [];
				var ytop = 0.2, ybot = 0;
				if(gene.strand == "-"){ ytop = -0.2;}
				for(var j=0; j< gene.size; j++){
					x.push( gene.start + gene.starts[j]-1);	y.push(ybot);
					x.push( gene.start + gene.starts[j]);	y.push(ytop);
					x.push( gene.start + gene.starts[j] + gene.sizes[j]-1);	y.push(ytop);
					x.push( gene.start + gene.starts[j] + gene.sizes[j]);	y.push(ybot);
				}
				x.unshift( genename+"_x");
				y.unshift( genename);
				chipseq_data.columns.push(x);
				chipseq_data.columns.push(y);
				chipseq_data.types[ genename ] = 'line';
				chipseq_data.axes[ genename ] = 'y2';
			}
			//console.log(data_gene);
			//var gene_chart = d3tools.d3_gene_chart().width(width).height(height).start(start).end(end);
			//var svg = d3.select("body").append("svg").datum(data_gene).call(gene_chart) ;
			//svgs += svg.node().outerHTML;
		}
	}
	res.json(200,chipseq_data);//req.body.data);
	//res.json(200,JSON.stringify(req.body));	
	//hm.bed12ToGeneSvg({id:"body", data: req.result[1].gene,trackWidth:50, trackHeight:20},function(svg){
		//console.log(svg.node().outerHTML);
	//	res.send(200,JSON.stringify(svg.node().outerHTML));
	//});
});


/*
app.get('/users', db.list);
app.post( '/create', db.create);

app.get('/test', function(req,res){
	for(var i in tools){
		tools[i].url=req.get('host')+"/"+tools[i].url;
	}	
	//res.render('index.ejs',{ title: "Hi", tools: tools});
	db.list(function(users){ 
		console.log(users);
		res.render('test',{users: users});
	 });
});

*/


// end of CGI functions
/////////////////////////////////////////////

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
