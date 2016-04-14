var mongoose = require("mongoose");
var Schema = mongoose.Schema;


//USER

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


// FRAGMENT
User = mongoose.model("User", userSchema);
module.exports = User;

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
		type: [String]
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
					type: String
				}
		}
	],
	owner: {
		type: Schema.ObjectId,
        ref: 'User'
	}
});

Fragment = mongoose.model("Fragment", fragmentSchema);
module.exports = Fragment;



