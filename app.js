
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
var hm = require('./src/hm_util');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('express-jquery')('/jquery.js'));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
app.locals.lineChartHelper = require(path.join(__dirname,'./src/line_chart_helper'));
var geneTrack = require('./src/gene_track');

var tools = [
	{ name: 'bamToSplicingCounts', url: 'example1' },
	{ name: 'bamToBed12', url: 'example2' },
	{ name: 'lineChart', url: 'lineChart' },
	{ name: 'plot', url: 'plot'},
	{ name: 'barChart', url: 'barChart' }
];

app.get('/', function(req,res){
	/*
	for(var i in tools){
		tools[i].url=req.get('host')+"/"+tools[i].url;
	}	
	*/
	res.render('index.ejs',{ title: "Hi", tools: tools});
});

app.get('/users', user.list);

app.get('/test',
  function(req, res, next) {
    res.set('hi','one');
	next();
  },
  
  function(req, res, next) {
    res.set('hi2','two');
	next();
  },
  
  function(req, res) {
    res.send('three');
  }
);

app.get('/kbrowser', function (req, res) {
	var gene_track=["http://bentleylab.ucdenver.edu/LabUrl/hg19RefGene.bam"];
	var rnaseq_track=["http://bentleylab.ucdenver.edu/LabUrl/c41..bam"];
	var intervals=["chr1:10000-20000"];
	var fields=[];
	for( i in gene_track){
        var field={name:'gene_track',type:'search',property:'required',value: gene_track[i]}; 
		fields.push(field);
	}
	for( i in intervals){
        var field={name:'interval',type:'search',property:'required',value: intervals[i]}; 
		fields.push(field);
	}
	res.render('kbrowser',{ gene_track:gene_track,rnaseq_track:rnaseq_track,interval:intervals});

/*
        res.render('form', {
            title: "Go!", //page title
            action: "/kbrowser", //post action for the form
            fields: fields 
        });
*/
});
//////////////////////////////////////////////
// test
app.get('/geneTrack',function(req,res){
	//var data = <%- data %>; //[4, 8, 15, 16, 23, 42];
	var hm = require('./src/hm_util');
	var data="chr1	1000	2000	gene1	0	+	1000	2000	0	2	 100,200	0,800\n\
chr1	1500	3000	gene1	0	+	1000	2000	0	3	100,200,1000	0,200,500";
	var svg = hm.bed12ToSvg( { data:data, id:"body"});
	//res.render('gene_track',{ svg:svg });
	res.send(d3.select('html').node().outerHTML);

/*
	for( d in data){
		var x=10, y=10, w=20,h=20;
		var rec = svg.append("rect").attr("x",x).attr("y",y).attr("width",w).attr("height",h);
		svg.append(rec);
	}
	res.send(svg);
*/
});

app.get('/barChart',function(req,res){
	res.render('barchart.ejs',data="[4,8,15]");
});

app.get('/plot',function(req,res){
	tsv({ input: "./data.cvs",output: "data.json"}, function(err,result){
		if(err){ console.error(err);}else{
			res.render('plot.ejs',{data: JSON.stringify(result)});
			//res.render( JSON.stringify({data: result}) );
		}
	});
});

app.get('/lineChart',function(req,res){
	tsv({ input: "./data.tsv",output: "data.json"}, function(err,result){
		if(err){ console.error(err);}else{
			res.render('linechart',{data: JSON.stringify(result)});
			//res.render( JSON.stringify({data: result}) );
		}
	});
});

app.get('/example1', function (req, res) {
        res.render('form', {
            title: "Go!", //page title
            action: "/bamToSplicingCounts", //post action for the form
            fields: [
            {name:'bam',type:'search',property:'required',value: 'http://bentleylab.ucdenver.edu/LabUrl/c41.bam'},   //first field for the form
            {name:'interval',type:'search',property:'required',value: 'chr1:10000-20000'}   //another field for the form
            ]
        });
    });

app.get('/example2', function (req, res) {
        res.render('form', {
            title: "Go!", //page title
            action: "/bamToBed12", //post action for the form
            fields: [
            {name:'bam',type:'search',property:'required',value: 'http://bentleylab.ucdenver.edu/LabUrl/c41.bam'},   //first field for the form
            {name:'interval',type:'search',property:'required',value: 'chr1:10000-20000'}   //another field for the form
            ]
        });
    });
//////////////////////////////////////////////
//CGI functions
app.get('/bamToBed12',function(req,res){
    var interval = req.query.interval;
    var bam = req.query.bam;
	console.log(req.query);
    var sys = require('sys');
    var exec = require('child_process').exec;
    var child = exec("samtools view -b "+bam+" "+interval + " | bamToBed -bed12 ",function(error,stdout,stderr){
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        //res.render('index',{ title: "bed results", bed: stdout });
		res.send(stdout);
    });
});

app.get('/bamToSplicingCounts',function(req,res){
    var interval = req.query.interval;
    var bam = req.query.bam;
	console.log(req.query);
    var sys = require('sys');
    var exec = require('child_process').exec;
    var child = exec(". bin/hm.sh; samtools view -b "+bam+" "+interval + " | bamToBed -bed12 | bed12_to_splicingCounts",
	function(error,stdout,stderr){
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        //res.send('mb', { title: 'Mr.BIN browser', interval : interval, bam : stdout });
        res.send(stdout);
    });
});
// end of CGI functions
/////////////////////////////////////////////

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
