
var gene_track = module.exports = function(params){
	var d3=require('d3');
	var data=params.data;
    var trackId=params.id;

   	var trackWidth=200,trackHeight=50;
	/*
    var data=[
        ["chr1",1000,2000,"gene1",0,"+",1000,2000,0,2, "100,200","0,800"],
        ["chr1",1500,3000,"gene1",0,"+",1000,2000,0,3, "100,200,1000","0,200,500"]];
	*/

    var svg = d3.select(trackId).append("svg").attr("width",trackWidth).attr("height",trackHeight);
	//var rec = svg.append("rect").attr("x",0).attr("y",0).attr("width",20).attr("height",20);

    var minX=data[0][1],maxX=data[0][2];
    for( i in data){
        if(data[i][1] < minX){ minX=data[i][1];}
        if(data[i][2] > maxX){ maxX=data[i][2];}
    }   
    var xScale=d3.scale.linear().range([0,trackWidth]).domain([minX,maxX]);
    var barDepth=trackHeight/data.length;
    for( i in data){
        var n=data[i][9];
		var start = data[i][1];
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


