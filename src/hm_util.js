var bed12_sample="chr1	1000	2000	gene1	0	+	1000	2000	0	2	 100,200	0,800\n\
chr1	1500	3000	gene1	0	+	1000	2000	0	3	100,200,1000	0,200,500";

var bed12_headers=['chrom','start','end','name','score','strand',
	'thickStart','thickEnd','itemRgb','blockCount','blockSizes','blockStarts'];

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
var bed12_to_json = function(txt){
	var lines=txt.split("\n");
	var result = [];
	for(var i=0;i<lines.length;i++){
		var ent = lines[i].split("\t");
		var rec = {};
		rec['chrom'] = ent[0];
		rec['start'] = parseInt(ent[1]); rec['end'] = parseInt(ent[2]);
		rec['name'] = ent[3]; rec['score'] = ent[4]; rec['strand'] = ent[5];
		rec['thickStart'] = parseInt(ent[6]); rec['thickEnd'] = parseInt(ent[7]);
		rec['rgb'] = ent[8];
		rec['size'] = parseInt(ent[9]);
		rec['sizes'] =  ent[10].split(',').map(function(d){return parseInt(d);});
		rec['starts'] =  ent[11].split(',').map(function(d){return parseInt(d);});
		result.push(rec);	
	}
	return result;
}

//console.log(bed12_to_json(bed12_sample));

var parseBed12 = function (txt){
	var lines=txt.split("\n");
	var result = [];
	for(var i=0;i<lines.length;i++){
		var ent = lines[i].split("\t");
		result.push(ent);
	}
	return result;
}
var bed12_to_gene_svg = function (params){
	var d3=require('d3');
	var data=bed12_to_json(params.data); // bed12 
    var trackId=params.id;
   	var trackWidth=200,trackHeight=50;
    var svg = d3.select(trackId).append("svg").attr("width",trackWidth).attr("height",trackHeight);
	//var rec = svg.append("rect").attr("x",0).attr("y",0).attr("width",20).attr("height",20);

	
    var minX=null,maxX=null;
    for( i in data){
		
		if( minX == null || data[i].start < minX){ minX=data[i].start;		}
		if( maxX == null || data[i].end > maxX){ maxX=data[i].end;		}
    }   
	console.log(minX, maxX);
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
//console.log(bed12_to_gene_svg({data: parseBed12(bed12_sample), id:'body'}).node().outerHTML);

module.exports.bed12_to_gene_svg = bed12_to_gene_svg;
module.exports.plotXy= plotXy;
