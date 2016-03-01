var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var diagramSchema = new Schema({
	name: {  
		type:String,
		required:true,
		unique:true
	},
	content: {
		type:String
	},
	dateString:{
		type:String
	},
	previewImage:{
		data:Buffer,
		contentType:String
	}
});



Diagram = mongoose.model("Diagram", diagramSchema);
module.exports = Diagram;

