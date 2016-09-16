var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var jsonSchema = new Schema({
	name: {  
		type:String,
		required:true
	},
	content: {
		type:String
	},
	URI:{
		type:String,
		//unique:true,
		required:true
	}
});



Json = mongoose.model("Json", jsonSchema);
module.exports = Json;

