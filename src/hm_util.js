var bed12_sample="chr1	1000	2000	gene1	0	+	1000	2000	0	2	 100,200	0,800\n\
chr1	1500	3000	gene1	0	+	1000	2000	0	3	100,200,1000	0,200,500";

var bed12_headers=['chrom','start','end','name','score','strand',
	'thickStart','thickEnd','itemRgb','blockCount','blockSizes','blockStarts'];

/////////////////////////////////////////////
//  convert bed to JSON format
////////////////////////////////////////////

var parseBed12 = function (txt){
	var lines=txt.split("\n");
	var result = [];
	for(var i=0;i<lines.length;i++){
		var ent = lines[i].split("\t");
		result.push(ent);
	}
	return result;
}
var d3=require('d3');
var bed12ToSvg = function (params){
	var data=parseBed12(params.data); // bed12 
    var trackId=params.id;
   	var trackWidth=200,trackHeight=50;
    var svg = d3.select(trackId).append("svg").attr("width",trackWidth).attr("height",trackHeight);
	//var rec = svg.append("rect").attr("x",0).attr("y",0).attr("width",20).attr("height",20);

    var minX=data[0][1],maxX=data[0][2];
    for( i in data){
		data[i][1] = parseInt(data[i][1]);
		data[i][2] = parseInt(data[i][2]);
        if(data[i][1] < minX){ minX=data[i][1];}
        if(data[i][2] > maxX){ maxX=data[i][2];}
    }   
    var xScale=d3.scale.linear().range([0,trackWidth]).domain([minX,maxX]);
    var barDepth=trackHeight/data.length;
    for( i in data){
        var n=data[i][9];
		var start = parseInt(data[i][1]);
        var sizes = data[i][10].split(",").map(function(d){return parseInt(d);});
        var starts = data[i][11].split(",").map(function(d){return parseInt(d);}); 
        for(j=0; j < n;j++){
			var s=xScale(start+starts[j]),e=xScale(start+starts[j]+sizes[j]);
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
//console.log(bed12ToSvg({data: parseBed12(bed12_sample), id:'body'}).node().outerHTML);

module.exports.bed12ToSvg = bed12ToSvg;
