var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var jsonSchema = new Schema({
	name: {  
		type:String,
		required:true,
		unique:true
	},
	content: {
		type:String
	}
});



Json = mongoose.model("JSon", ecoreSchema);
module.exports = Json;

