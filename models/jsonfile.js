var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var jsonFileSchema = new Schema({
	name: {  
		type:String,
		required:true,
		unique:true
	},
	content:{
		type:String
	}
});

JsonFile = mongoose.model("JsonFile", jsonFileSchema);
module.exports = JsonFile;

