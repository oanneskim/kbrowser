var mongoose = require('mongoose'), 
	model = require('../models/db');

	exports.findUser = function(query,callback){
		console.log('findUser: '+query);
		User.find(query, function(err, users,count){
			callback(users);
		});
	};

	exports.listUser = function(callback){
		User.find(function(err, users,count){
			callback(users);
		});
	};

	exports.create = function(req, res){
		new User({
			name : req.body.username,
			email : req.body.email
		}).save(function(err, user, count){
			res.redirect('back');
		});
	};

mongoose.connect('mongodb://localhost/nodetest1');
