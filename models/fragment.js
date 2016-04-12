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
	},
	date:{
		type: Date, 
		default: Date.now 
	},

	extends:{
		type: [String]
	},
	contentKeys:[
		{
				name: {
					type: String
				},
				type:{
					type: String
				},
				options:{
					options: String
				}
		}
	]
});

Fragment = mongoose.model("Fragment", fragmentSchema);
module.exports = Fragment;

