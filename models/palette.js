var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var paletteSchema = new Schema({
	name: {  
		type:String,
		required:true,
		unique:true
	},
	content:{
		type:String
	},
	version:{
		type:Number,
		default: -1
	}
});

Palette = mongoose.model("Palette", paletteSchema);
module.exports = Palette;

