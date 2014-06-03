
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

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

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var tools = [
	{ name: 'bamToSplicingCounts', url: 'example1' },
	{ name: 'bamToBed12', url: 'example2' }
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

//////////////////////////////////////////////
// test
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
