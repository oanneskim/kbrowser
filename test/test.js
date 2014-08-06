var request = require('supertest');
var should = require('should');
var assert = require('assert');

describe('Kbrowser', function(){
	var url = 'http://localhost:3000';
	var bamurl = 'http://bentleylab.ucdenver.edu/LabUrl/c41.bam';
	bamurl=encodeURIComponent(bamurl);
	var interval = 'chr1:10000-12000';
	var track_info={ 
		interval:'chr1:1000-20000',
	  	tracks: [
			{ name : 'refGene', type : 'gene', url: "http://bentleylab.ucdenver.edu/LabUrl/hg19RefGene.bam" },
			{ name : 'c4', type : 'rna_seq', url: "http://bentleylab.ucdenver.edu/LabUrl/c41.bam"}
		]
	};
	before(function(done){
		// setup connect mongoose
		done();
	});
	it('should have a bam', function(){
		request(url)
		.get('/api/bam/'+bamurl+'/interval/'+interval)
		.expect('Content-Type',/json/)
		.expect(200)
		.end(function(err,res){
			if(err){
				throw err;
			}
			console.log('ok');
			done();
		});
	});
	it('should return bed12 files', function(){
		request(url)
		.post('/api/kbrowser/update')
		.send(track_info)
		.expect(200)
		.end(function(err,res){
			consol.log(res.body);
			if(err){ throw err}
			res.body.should.have.property('bed12s');
			done();
		});
	});
});
