
/*
 * GET home page.
 */

/*
module.exports = function (app){
	app.get('/kbrowser', function (req, res) {
		kbc.create(sample_data, function(data){
			console.log(data);
			res.render('kbrowser',{data:data, links:['/kbrowser','/view','/login','/customTrack']});
		});
	});
	app.get('/browse',function(req, res){
		console.log(req.query)
	//			res.send(req.body);
		kbc.browse(req.query, function(data){
			res.render('kbrowser',{data:data, links:['/kbrowser','/view','/login','/customTrack']});
		});	
	});
	app.get('/login',function (req, res,next){
		db.listUser(function(users){
			res.render('login', {users: users});
		});
	});
	var data = req.body.data;
	if( typeof dat == 'undefined'){
		data = { 
			interval: ['chr1:1000-20000'],
			tracks: [ 
				{ name : 'refGene', type : 'gene', url: "http://bentleylab.ucdenver.edu/LabUrl/hg19RefGene.bam"},
				{ name : 'c4', type : 'rna_seq', url: "http://bentleylab.ucdenver.edu/LabUrl/c41.bam"}
			],
			rawdata: [
				{ 'refGene' : undefined },
				{ 'c4' : undefined }
			]
		}
	}
	kbc.login(data,function(data){
		console.log(res);
		res.send(data);
	});
*/
	//res.render('kbrowser',{data:data});
//	res.render('kbrowser',{ tracks: data });
     //       var x=['x', 30, 50, 100, 230, 300, 310],
      //      data=[['data1', 30, 200, 100, 400, 150, 250], ['data2',130, 300, 200, 300, 250, 450]];
	//var d3 = require('d3');
	//res.render('plotXy',{id:JSON.stringify('##chart'),data1: JSON.stringify(data1),  data2: JSON.stringify(data2), x:JSON.stringify(x)});
	//var data1="chr1	1000	2000	gene1	0	+	1000	2000	0	2	 100,200	0,800\n\
//chr1	1500	3000	gene1	0	+	1000	2000	0	3	100,200,1000	0,200,500";
	//var svg = hm.bed12_to_gene_svg( { data:data1, id:"body", trackWidth:100, trackHeight:50});
	//res.render('kbrowser',{ data: JSON.stringify(data), gene_track:gene_track, test:svg, rnaseq_track:rnaseq_track});

/*
        res.render('form', {
            title: "Go!", //page title
            action: "/kbrowser", //post action for the form
            fields: fields 
        });
*/

//}


