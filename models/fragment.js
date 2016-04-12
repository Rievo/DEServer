var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var fragmentSchema = new Schema({
	name: {  
		type:String,
		required:true,
		unique:true
	},
	content:{
		type:String
	},
	domains:{
		type:String
	}
});

Fragment = mongoose.model("Fragment", fragmentSchema);
module.exports = Fragment;

