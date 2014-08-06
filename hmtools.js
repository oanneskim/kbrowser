var bed12_sample="chr1	1000	2000	gene1	0	+	1000	2000	0	2	 100,200	0,800\n\
chr1	1500	3000	gene1	0	+	1000	2000	0	3	100,200,1000	0,200,500";

var bed12_headers=['chrom','start','end','name','score','strand',
	'thickStart','thickEnd','itemRgb','blockCount','blockSizes','blockStarts'];

// track handlers

function initTrack(){ // JSON 
	var track = {
		name: undefined,
		type: undefined, // ChIP-seq, RNA-Seq, PolyA-Seq, GRO-Seq ,... 
		url: undefined,
		color: undefined,
		data: undefined, // raw bed file
		x_range: undefined,
		y_range: undefined,

		height: undefined,
		width: undefined
	}
	return track;
}

function cloneTrack(obj){
	res = {};
	for( k in obj){ res[k]=obj[k]; }
	return res;
}


//
//  get bam file at a interval in a bed12 format
//
function getBam(param,callback){
	// { interval:chr1:1000-2000, bam: ..} 
	var interval = param.interval;
	var bam = param.bam;
	var name = param.name;

	var spawn = require('child_process').spawn,
    samtools    = spawn('samtools', [ 'view','-b',bam, interval]),
    bamToBed  = spawn('bamToBed', ['-bed12']);

	var res ='';
	samtools.stdout.on('data', function (data) { bamToBed.stdin.write(data); }); // pipeline to the next process
	samtools.stderr.on('data', function (data) { console.log('samtools stderr: ' + data); });
	samtools.on('exit', function (code) { 
		if (code !== 0) { console.log('samtools process exited with code ' + code); }
	  	bamToBed.stdin.end();
	}); 
	// this handle data buffer of size 200k
	bamToBed.stdout.on('data', function (data) { res += ''+data;});
	bamToBed.stderr.on('data', function (data) { console.log('grep stderr: ' + data); });
	bamToBed.on('close', function (code) { 
		if (code !== 0) { console.log('bamToBed process exited with code ' + code); }
		var res1={name: name, res: res  };
		return callback(null,res1); 
	});
}

function getBams(param,callback){
	var async = require("async");
	var iparam=[];
	for( i in param.tracks){
		iparam.push( { interval: param.interval, 
				name: param.tracks[i].name,
				bam: param.tracks[i].bam});
	}
	async.mapLimit(iparam,1,getBam,function(err,res){
		callback(null,res);
	});
}
/*
var inp = { interval: 'chr1:10000-13000',
  tracks: 
   [ { name: 'c4',
       type: 'rnaseq',
       bam: 'http://bentleylab.ucdenver.edu/LabUrl/c41.bam' },
     { name: 'gene',
       type: 'gene',
       bam: 'http://bentleylab.ucdenver.edu/LabUrl/hg19RefGene.bam' } ] };

getBams(inp,function(err,res){
	console.log(res);
});
*/
//var data={ interval:'chr1:1000-20000',
//	   tracks: [
//		{ name : 'refGene', type : 'gene', url: "http://bentleylab.ucdenver.edu/LabUrl/hg19RefGene.bam" },
//		{ name : 'c4', type : 'rna_seq', url: "http://bentleylab.ucdenver.edu/LabUrl/c41.bam"}
//	]
//};
//

/////////////////////////////////////////////
//  convert bed to JSON format
////////////////////////////////////////////
//var c3 = require('/javascript/c3.min.js');
var plotXy = function(param){
	//document.write('<script src="/javascript/d3.min.js" charset="utf-8"></script>');
	//document.write('<script src="/javascript/c3.min.js"></script>');
	//require('./public/javascript/d3.min');
/*
,function(){
	var chart = c3.generate({
		bindto: param.id,
		data: {
		  columns: [
			param.data1, param.data2
		  ]
		}
	});
		return "hi";	
	});
*/
}
var bed_to_json = function(txt){
	var lines=txt.split("\n");
	var result = [];
	for(var i=0;i<lines.length;i++){
		if(lines[i] == ''){ continue;}
		var ent = lines[i].split("\t");
		var rec = {};
		rec['chrom'] = ent[0];
		rec['start'] = parseInt(ent[1]); rec['end'] = parseInt(ent[2]);
		rec['name'] = ent[3]; rec['score'] = ent[4]; rec['strand'] = ent[5];
		
		// extra
		if(ent.length == 12){
			rec['thickStart'] = parseInt(ent[6]); rec['thickEnd'] = parseInt(ent[7]);
			rec['rgb'] = ent[8];
			rec['size'] = parseInt(ent[9]);
			rec['sizes'] =  ent[10].split(',').map(function(d){return parseInt(d);});
			rec['starts'] =  ent[11].split(',').map(function(d){return parseInt(d);});
		}
		result.push(rec);	
	}
	return result;
}

//console.log(bed_to_json(bed12_sample));

var parseBed12 = function (txt){
	var lines=txt.split("\n");
	var result = [];
	for(var i=0;i<lines.length;i++){
		var ent = lines[i].split("\t");
		result.push(ent);
	}
	return result;
}
var fiveprimeshift = function(bed,fragmentsize){
	return bed.strand == '+' ? bed.start + fragmentsize/2 : bed.end - 1 - fragmentsize/2;
}
var chipseqDensity= function(params, callback){
	// todo strand speific output
	var fragment_size = params.fragment_size;
	var bin_size = params.bin_size;
	var data = bed_to_json(params.data);
	var res = {};
	for( i in data){
		fp=fiveprimeshift(data[i],fragment_size);
		var b = parseInt(fp/bin_size) * bin_size;
		res[ b ] = typeof res[ b] == 'undefined' ? 1: res[b] + 1;
	}
	var k = [],x=[],y=[];
	for(i in res){ k.push(parseInt(i));} k.sort(function(a,b){ return a-b;});
	for(i in k){
		x.push(k[i]); y.push(res[k[i].toString()]);
	}
	return {x:x, y:y};	
}
//var data='chr1\t1\t10\tn1\t0\t+\nchr1\t1\t10\tn1\t0\t-\n';
//console.log(data);
//console.log(chipseqDensity({fragment_size:100, bin_size:100, data:data}));

var bed12_to_gene_svg = function (params){
	var d3=require('d3');
	var data=bed_to_json(params.data); // bed12 
    var trackId=params.id;
   	var trackWidth=params.trackWidth,trackHeight=params.trackHeight;
    var svg = d3.select(trackId).append("svg").attr("width",trackWidth).attr("height",trackHeight);
	//var rec = svg.append("rect").attr("x",0).attr("y",0).attr("width",20).attr("height",20);

	
    var minX=null,maxX=null;
    for( i in data){
		if( minX == null || data[i].start < minX){ minX=data[i].start;		}
		if( maxX == null || data[i].end > maxX){ maxX=data[i].end;		}
    }   
    var xScale=d3.scale.linear().range([0,trackWidth]).domain([minX,maxX]);
    var barDepth=trackHeight/data.length;
    for( i in data){
		d = data[i];
        for(j=0; j < d.size;j++){
			var s=xScale(d.start+d.starts[j]),e=xScale(d.start+d.starts[j]+d.sizes[j]);
			var x=s,y=i*barDepth,w=e-s,h=barDepth;
            var rec = svg.append("rect").attr("x",x).attr("y",y).attr("width",w).attr("height",h);
        }
    }
	return svg;
};

// id: 'body', trackWidth:100, trackHeight:200});

var bedToJSON = function (tsv){
	var lines=tsv.split("\n");
	var result = [];
	var headers=lines[0].split("\t");
	// add a header
	for(var i=0;i<headers.length;i++){
		headers[i]=bed12_headers[i];
	}
	// convert to JSON
	for(var i=0;i<lines.length;i++){
		var obj = {};
		var currentline=lines[i].split("\t");
		for(var j=0;j<headers.length;j++){
			obj[headers[j]] = currentline[j];
		}
		result.push(obj);
	}
	return result; //JavaScript object
	//return JSON.stringify(result); //JSON
}



//console.log(bedToJSON(bed12_sample));
//console.log(bedToArray(bed12_sample));
//console.log(bed_to_json(bed12_sample));
//bed12_to_gene_svg({data: bed12_sample, id:'body', trackHeight:20, trackWidth:50},function(svg){
//	console.log(svg.node().outerHTML); });

module.exports.bed12ToGeneSvg = bed12_to_gene_svg;
module.exports.bedToJson = bed_to_json;
module.exports.plotXy= plotXy;
module.exports.getBams=getBams;
module.exports.chipseqDensity=chipseqDensity;
