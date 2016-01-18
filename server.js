var express = require("express"),  
    app = express(),
    bodyParser  = require("body-parser"),
    methodOverride = require("method-override");
    mongoose = require('mongoose');

var child_process = require('child_process');

   
var path = require('path');
app.use(bodyParser.urlencoded({ extended: false }));  
app.use(bodyParser.json());  
app.use(methodOverride());

app.set('views', __dirname + '/views')
app.set('view engine', 'jade');


var pass;
var user;

process.argv.forEach(function (val, index, array) {
 
  if(index == 2){ //User
  	user = val;
  }else if(index == 3){ //Password
  	pass = val
  }
});


var router = express.Router();

app.set('port', process.env.PORT || 8080);

//mongoose entity vars
var Palette = require("./models/palette");
var Diagram = require("./models/diagram");


var database = "diagrameditor";

//var port = 8080;



//========================================================
//==============        Basic route      =================
//========================================================

router.get('/', function(req, res) {  
	console.log("/");
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log("ip: " + req.ip)
	//res.render("index");
	endResponse(res);
});




//========================================================
//===============   Auxiliar functions   =================
//========================================================


function sendJsonResponse(res, element){
	//console.log("en sendJsonResponse. Element = " + element);
	res.setHeader("Content-Type", "application/json");
	res.send(JSON.stringify({code: "200", array:element}));
}

function sendJsonError(res, text){
	//console.log("En sendJsonError. Text = "+ text);
	res.setHeader("Content-Type", "application/json");
	res.send(JSON.stringify({error: text}));
}

function endResponse(res){
	res.end();
}




//========================================================
//====================    Palettes   =====================
//========================================================
router.get("/palettes", function(req, res){
	console.log("GET /palettes")

	Palette.find({}, function(err, palettes){
		if(err){
			console.log("Error: "+err);
		}

		if(req.query.json ==="true"){
			sendJsonResponse(res, palettes);
		}else{
			//Cargar la web
			endResponse(res);
		}
	});
});


//Add new palette
router.post("/palettes", function(req, res){
	//a partir del ? vienen los parámetros

	var name = req.body.name;
	var content = req.body.content;

	if(name != null) {
		var newPalette = Palette({
			name: name.toLowerCase(),
			content: content
		});

		newPalette.save(function(err){
			if(err){
				if(req.query.json === "true"){
					console.log("Adding error: " + err);
					sendJsonError(res, {code:300, msg:err});
				}else{
					//Cargar la web de error
					endResponse(res);
				}
			}else{
				console.log("Paleta añadida");
				//todo bien, devolvemos añadido correctamente
				if(req.query.json === "true"){
					sendJsonResponse(res, {code:200, msg:"Palette added properly"});
				}else{
					//res.redirect("");
					endResponse(res);
				}

			}
		});
	}
});


//Get a stored palette
router.get("/palettes/:pname", function(req,res){
	console.log("GET /palettes/" + req.params.pname.toLowerCase());

	Palette.findOne({name:req.params.pname.toLowerCase()}, function(err, palette){
		if(err){
			if(req.query.json === "true"){
				sendJsonError(res, {code: 301, msg:err});
			}else{
				//cargar página de error
				endResponse(res);
			}
		}else{
			if(req.query.json === "true"){
				sendJsonResponse(res, {code:200, body:palette});
			}else{
				endResponse(res);
			}
		}
	});
});


//Remove a palette
router.delete("/palettes/:pname", function(req, res){
	console.log("DELETE /palettes/"+ req.params.pname.toLowerCase());

	Palette.findOne({name:req.params.pname.toLowerCase()}, function(err, palette){

		if(palette){
			palette.remove(function(err, pal){
				console.log("--->" +err);
				console.log("--->" + pal);

				if(err){
					//Error on removal
					if(req.query.json === "true"){
						sendJsonError(res, {code: 302, msg: err});
					}else{
						//Load error page
						endResponse(res);
					}
				}else{
					//Removing has work
					if(req.query.json === "true"){
						console.log("palette removed")
						sendJsonResponse(res, {code:200, msg:"Palette removed"});
					}else{
						//Load web
						endResponse(res);
					}
				}
			});
		}else{
			//La paleta con ese nombre no existe, devolvemos error
			if(req.query.json === "true"){
				sendJsonError(res, {code: 301, msg:"Palette doesn't exist"});
			}else{
				//Load web
				endResponse(res);
			}
		}
	});
});


//Update a palette
router.put("/palettes/:pname", function(req, res){
	console.log("PUT /palettes/"+req.params.pname.toLowerCase());

	Palette.findOne({name:req.params.pname.toLowerCase()}, function(err, palette){

		if(palette){
			//La paleta existe, intentamos actualizarla
			palette.content = req.body.content;
			palette.save(function(err){
				if(err){
					//Error al actualizar elemento
					if(req.query.json === "true"){
						sendJsonError(res, {code: 303, msg:"Error on update element"});
					}else{
						//Load web
						endResponse(res);
					}
				}else{
					//Se ha actualizado correctamente
					if(req.query.json === "true"){
						console.log("Palette updated\n");
						sendJsonResponse(res, {code:200, msg:"Palette updated"});
					}else{
						//Load web
						endResponse(res);
					}
				}
			});
		}else{
			//No existe la paleta
			if(req.query.json ==="true"){
				sendJsonError(res, {code:301, msg:"Palette doesn't exist"});
			}else{
				//Load web
				endResponse(res);
			}
		}
	});
});


//========================================================
//====================    Diagrams   =====================
//========================================================
//Get all diagrams
router.get("/diagrams", function(req, res){
	console.log("GET /diagrams")

	Diagram.find({}, function(err, diagrams){
		if(err){
			console.log("Error: "+err);
		}

		if(req.query.json ==="true"){
			sendJsonResponse(res, diagrams);
		}else{
			//Cargar la web
			endResponse(res);
		}
	});
});

//Add a new diagram
router.post("/diagrams", function(req, res){
	//a partir del ? vienen los parámetros

	var name = req.body.name;
	var content = req.body.content;

	if(name != null) {
		var newDiagram = Diagram({
			name: name.toLowerCase(),
			content: content.toLowerCase()
		});

		newDiagram.save(function(err){
			if(err){
				console.log("Adding error: " + err);
				if(req.query.json === "true"){
					sendJsonError(res, {code:300, msg:err});
				}else{
					//Cargar la web de error
					endResponse(res);
				}
			}else{
				console.log("Diagram added");
				//todo bien, devolvemos añadido correctamente
				if(req.query.json === "true"){
					sendJsonResponse(res, {code:200, msg:"Diagram added properly"});
				}else{
					//res.redirect("");
					endResponse(res);
				}
			}
		});
	}
});

//Get a stored diagram
router.get("/diagrams/:dname", function(req,res){
	console.log("GET /diagrams/" + req.params.dname.toLowerCase());

	Diagram.findOne({name:req.params.dname.toLowerCase()}, function(err, diagram){
		if(err){
			if(req.query.json === "true"){
				sendJsonError(res, {code: 301, msg:err});
			}else{
				//cargar página de error
				endResponse(res);
			}
		}else{
			if(req.query.json === "true"){
				sendJsonResponse(res, {code:200, body:diagram});
			}else{
				endResponse(res);
			}
		}
	});
});

//Remove a diagram
router.delete("/diagrams/:dname", function(req, res){
	console.log("DELETE /diagrams/"+ req.params.dname.toLowerCase());

	Diagram.findOne({name:req.params.dname.toLowerCase()}, function(err, diagram){

		if(diagram){
			diagram.remove(function(err){
				if(err){
					//Error on removal
					if(req.query.json === "true"){
						sendJsonError(res, {code: 302, msg: err});
					}else{
						//Load error page
						endResponse(res);
					}
				}else{
					//Removing has work
					if(req.query.json === "true"){
						console.log("Diagram removed")
						sendJsonResponse(res, {code:200, msg:"Diagram removed"});
					}else{
						//Load web
						endResponse(res);
					}
				}
			});
		}else{
			//El diagrama con ese nombre no existe, devolvemos error
			if(req.query.json === "true"){
				sendJsonError(res, {code: 301, msg:"Diagram doesn't exist"});
			}else{
				//Load web
				endResponse(res);
			}
		}
	});
});


//Update a diagram
router.put("/diagrams/:dname", function(req, res){
	console.log("PUT /diagrams/"+req.params.dname.toLowerCase());

	Diagram.findOne({name:req.params.dname.toLowerCase()}, function(err, diag){

		if(diag){
			//La paleta existe, intentamos actualizarla
			diag.content = req.body.content;
			diag.save(function(err){
				if(err){
					//Error al actualizar elemento
					if(req.query.json === "true"){
						sendJsonError(res, {code: 303, msg:"Error on update element"});
					}else{
						//Load web
						endResponse(res);
					}
				}else{
					//Se ha actualizado correctamente
					if(req.query.json === "true"){
						console.log("Diagram  " + diag.name +"  updated\n");
						sendJsonResponse(res, {code:200, msg:"Diagram updated"});
					}else{
						//Load web
						endResponse(res);
					}
				}
			});
		}else{
			//No existe el diagrama
			if(req.query.json ==="true"){
				sendJsonError(res, {code:301, msg:"Diagram doesn't exist"});
			}else{
				//Load web
				endResponse(res);
			}
		}
	});
});


//========================================================
//=================    Default route   ===================
//========================================================

//Default route
router.get("*", function(req, res){
	//res.render("error", {code:404, message:"Upps. Page not found"});
});



app.use(router);


//Connect to database
//mongoose.connect("mongodb://localhost/"+DATABASENAME);

console.log("name: " + user);
console.log("pass: " + pass);

//mongoose.connect("mongodb://"+user+":"+pass +"@ds047355.mongolab.com:47355/"+database,{auth:{authdb:"dbOwner"}});
mongoose.connect("mongodb://rievo:rievo@ds047355.mongolab.com:47355/diagrameditor")


//Start listening
app.listen(app.get('port'), function() {  
  console.log("Node server running");
});



//========================================================
//================    MONGOOSE    ========================
//========================================================
mongoose.connection.on("connected", function(){
	console.log("Connected to database");
});

mongoose.connection.on("error", function(err){
	console.log(err);
	process.exit(1);
});


mongoose.connection.on("disconnected", function(){
	console.log("Mongoose disconnected");
});





