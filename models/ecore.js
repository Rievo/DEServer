var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ecoreSchema = new Schema({
	name: {  
		type:String,
		required:true,
		unique:true
	},
	content: {
		type:String
	}
});



Ecore = mongoose.model("Ecore", ecoreSchema);
module.exports = Ecore;

