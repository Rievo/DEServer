var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var paletteSchema = new Schema({
	name: {  
		type:String,
		required:true
	},
	content:{
		type:String
	},
	version:{
		type:Number,
		default: -1
	},
	ecoreURI:{
		type:String,
		required:true
	}
});

Palette = mongoose.model("Palette", paletteSchema);
module.exports = Palette;

