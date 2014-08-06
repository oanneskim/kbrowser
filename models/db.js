var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var userSchema = new Schema({
	name : String,
	email : String
});

User = mongoose.model('user',userSchema);

module.exports = User;
