var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var dataTypeSchema = new Schema({
	name: {  
		type:String,
		required:true,
		unique:true
	},
	content:{
		type:String
	},
	date:{
		type: Date, 
		default: Date.now 
	},

	extend:{
		type: String
	},
	contentKeys:[
		{
				name: {
					type: String
				},
				type:{
					type: String
				}
		}
	]
});

DataType = mongoose.model("DataType", dataTypeSchema);
module.exports = DataType;

