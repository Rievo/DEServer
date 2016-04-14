var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema({
	name: {  
		type:String,
		required:true,
		unique:true
	},
	pass: {
		type:String
	}
});



User = mongoose.model("User", userSchema);
module.exports = User;

