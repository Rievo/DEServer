var express = require("express"),  
app = express(),
bodyParser  = require("body-parser"),
methodOverride = require("method-override");
mongoose = require('mongoose'),
uriUtil = require('mongodb-uri');;

var fs = require('fs');
var path = require("path");

var childProcess = require('child_process');

var mkdirp = require('mkdirp');


var path = require('path'); 
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(methodOverride());

app.set('views', __dirname + '/views')
app.set('view engine', 'jade');


var pass;
var user;

//------ GRAPHIC R VERSION ------
var lastGraphicRVersion = 2;
//-------------------------------

process.argv.forEach(function (val, index, array) {

  if(index == 2){ //User
  	user = val;
  }else if(index == 3){ //Password
  	pass = val
  }
});


var router = express.Router();

app.use(express.static('public'));

//app.set('port', 8080);

//mongoose entity vars
var Palette = require("./models/palette");
var Diagram = require("./models/diagram");
var Ecore = require("./models/ecore");
var Json = require("./models/json");

var database = "diagrameditor";


var dir = './tmp';

if (!fs.existsSync(dir)){
	console.log("Creo "+ dir);
	fs.mkdirSync(dir);
}



//========================================================
//==============        Basic route      =================
//========================================================

router.get('/', function(req, res) {  
	console.log("/");
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log("ip: " + req.ip)
	res.render("index");
	//endResponse(res);
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
	console.log("GET /palettes");

	var version = req.query.version;

	if(version == null){ //Todos
		console.log("GET ALL, version == null");
		Palette.find({}, function(err, palettes){
			if(err){
				console.log("Error: "+err);
			}

			if(req.query.json ==="true"){
				sendJsonResponse(res, palettes);
			}else{
				//Cargar la web
				res.render("addPalette",{
					palettelist:palettes
				});
			}
		});
	}else{ //Recupero solo esos
		console.log("GET /version = "+version);
		Palette.find({"version" : version}, function(err, palettes){
			if(err){
				console.log("Error: "+err);
			}

			if(req.query.json ==="true"){
				sendJsonResponse(res, palettes);
			}else{
				//Cargar la web
				res.render("addPalette",{
					palettelist:palettes
				});
			}
		});
	}


		

});


//Add new palette
router.post("/palettes", function(req, res){
	//a partir del ? vienen los parámetros

	var name = req.body.name;
	var content = req.body.content;

	if(name != null) {
		var newPalette = Palette({
			name: name,
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
					res.redirect("/palettes");
					endResponse(res);
				}

			}
		});
	}
});


//Get a stored palette
router.get("/palettes/:pname", function(req,res){
	console.log("GET /palettes/" + req.params.pname);

	Palette.findOne({name:req.params.pname}, function(err, palette){
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
				res.render("paletteInfo",{
					name:palette.name,
					content:palette.content
				});
			}
		}
	});
});


//Remove a palette
router.post("/palettes/:pname/delete", function(req, res){
	console.log("DELETE /palettes/"+ req.params.pname.toLowerCase());

	Palette.findOne({name:req.params.pname}, function(err, palette){

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
						res.redirect("/palettes");
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
	console.log("PUT /palettes/"+req.params.pname);

	Palette.findOne({name:req.params.pname}, function(err, palette){

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
//====================     eCores    =====================
//========================================================
router.get("/ecores", function(req, res){
	console.log("GET /ecores");
		Ecore.find({}, function(err, ecores){
			if(err){
				console.log("Error: "+err);
			}

			if(req.query.json ==="true"){
				sendJsonResponse(res, ecores);
			}else{
				//Cargar la web
				res.render("ecoreList",{
					ecorelist:ecores
				});
			}
		});
});


router.post("/ecores", function(req, res){
	//a partir del ? vienen los parámetros

	var name = req.body.name;
	var content = req.body.content;
	var autogenerateGrapicRStr = req.body.autogenerate;

	var generate = false;


	if(autogenerateGrapicRStr === "on"){
		generate = true;
	}else{
		generate = false;
	}
	

	if(name != null) {
		var newEcore= Ecore({
			name: name.replace(/\s+/g, ''),
			content: content
		});

		newEcore.save(function(err){
			if(err){
				if(req.query.json === "true"){
					console.log("Adding error: " + err);
					sendJsonError(res, {code:300, msg:err});
				}else{
					//Cargar la web de error
					endResponse(res);
				}
			}else{
				console.log("Ecore añadido a la base de datos");

				writeEcoreFileToFolder(newEcore);

				//parseEcoreToJSON(newEcore);

				if(generate == true){
					parseEcoreToGraphicR(newEcore);
				}else{
					console.log("No se ha generado el graphicR")
				}

				//todo bien, devolvemos añadido correctamente
				if(req.query.json === "true"){
					sendJsonResponse(res, {code:200, msg:"ecore added properly"});
				}else{
					res.redirect("/ecores");
					//endResponse(res);
				}

			}
		});
	}
});

function writeEcoreFileToFolder(ecore){
	
	var name = path.join(__dirname, "/tmp/"+ecore.name +".ecore");

	//var tempFilename = __dirname +"/files/ecores/"+ecore.name +".ecore";
	console.log("ecore route: "+ name);


	fs.writeFile(name, ecore.content, function(err){	
		console.log("vengo de intentar escribir. Err: "+err);
		if(err){
			console.log("Error escritura:  "+ err);
		}else{
			console.log("fichero ecore guardado correctamente");

			parseEcoreToJSON(ecore);
		}
	});
}

function parseEcoreToJSON (ecore){

	console.log("Voy a hacer el parsetojson");

	var sourceFile = __dirname +"/tmp/"+ecore.name +".ecore";
	var outFile = __dirname +"/tmp/"+ecore.name +".json";
	var command = "java -jar exporter.jar "+sourceFile + " " + outFile;
	console.log("executing: "+command);

	var cp = childProcess.exec(command , function(error, stdout, stderr){
		console.log("stdout: " + stdout);
		console.log("stderr: " + stderr);
		if(error){
			console.log("Error de salida: " + error);
		}else{
			console.log("jsonFile created :D");
			//Recupero ese json y lo añado a mongodb
			saveJSONtoMongodb(outFile, ecore.name);
		}
	});

}

function saveJSONtoMongodb(jsonfile, name){
		fs.readFile(jsonfile, 'utf8', function (err,data) {
		if (err) {
			return console.log("Error leyendo el json" +err);
		}

		var str = data;
		//Si no hay error, lo añado a mongodb
		var newJson = Json({
			name: name,
			content: str
		});

		newJson.save(function(err){
			if(err){
				console.log("Error añadiendo el json a mongod: "+err);
			}else{
				console.log("JSON añadido a mongodb");

			}
		});
			  
		});
}

function parseEcoreToGraphicR (ecore){

}

//Get a stored ecore
router.get("/ecores/:ename", function(req,res){
	console.log("GET /ecores/" + req.params.ename);


	Ecore.findOne({name:req.params.ename}, function(err, ec){

		if(err){
			if(req.query.json === "true"){
				sendJsonError(res, {code: 301, msg:err});
			}else{
				//cargar página de error
				endResponse(res);
			}
		}else{
			
			if(req.query.json === "true"){
				//Puede que el ecore no exista
				console.log("ecore: "+req.params.ename);
				if(ec == null){
					sendJsonResponse(res, {code:300 });
				}else{
					sendJsonResponse(res, {code:200, body:ec});
				}
				
			}else{
				if(ec != null){
					res.render("ecoreInfo",{
						name:ec.name,
						content:ec.content
					});
				}
			}
		}
	});
});

//Remove an ecore
router.post("/ecores/:ename/delete", function(req, res){
	console.log("POST /ecores/.../delete"+ req.params.ename);

	Ecore.findOne({name:req.params.ename}, function(err, ecore){

		if(!err){
			ecore.remove(function(err, pal){
				//onsole.log("--->" +err);
				//console.log("--->" + pal);

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

					//Remove json file
					Json.findOne({name:req.params.ename}, function(err, json){
						if(!err){

							json.remove(function(err, pal){
								if(!err){
									if(req.query.json === "true"){
										console.log("ecore  & json removed")
										sendJsonResponse(res, {code:200, msg:"Ecore removed"});
									}else{
										res.redirect("/ecores");
									}
								}else{
									console.log("No se ha encontrado el json asociado");
									sendJsonError(res, {code: 300, msg: err});
								}
							});
								
						}
					});


					/**/
				}
			});
		}else{
			console.log("Ecore doesn't exists");
			//El ecoer con ese nombre no existe, devolvemos error
			if(req.query.json === "true"){
				sendJsonError(res, {code: 301, msg:"Ecore doesn't exist"});
			}else{
				//Load web
				endResponse(res);
			}
		}
	});
});

//========================================================
//====================    JSON   =====================
//========================================================

console.log("GET /jsons/");
router.get("/jsons", function(req, res){
	console.log("GET /jsons");
		Json.find({}, function(err, jsons){
			if(err){
				console.log("Error: "+err);
			}

			//if(req.query.json ==="true"){
				sendJsonResponse(res, jsons);
			/*}else{
				//Cargar la web
				res.render("ecoreList",{
					ecorelist:jsons
				});
			}*/
		});
});

router.get("/jsons/:name", function(req, res){
	console.log("GET /jsons/", req.params.name.replace(/ /g,''));

	//Abro el json que se llama así
	//Devuelvo un json con content el contenido del fichero

	if(req.params.name == null){
		console.log("req.name == null");
		if(req.query.json === "true"){
			sendJsonError(res, {code: 305, msg:"Name is null"});
		}else{
			endResponse(res);
		}
	}else{
		Json.findOne({name:req.params.name}, function(err, json){
		if(!err){
			//json.content
			if(req.query.json === "true"){
				console.log("Devolviendo json")
				sendJsonResponse(res, {code:200, content:json.content});
			}else{
				//res.redirect("/ecores");
				endResponse(res);
			}
		}else{
			if(req.query.json === "true"){
				sendJsonError(res, {code: 301, msg:"JSON doesn't exist"});
			}else{
				//Load web
				endResponse(res);
			}
		}
	});
	}

	
	
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
			//endResponse(res);
			res.render("diagramList", {diagramList:diagrams});
		}
	});
});

//Add a new diagram
router.post("/diagrams", function(req, res){
	//a partir del ? vienen los parámetros
	console.log("POST /diagrams");

	//var json = JSON.parse(req.body);
	console.log(req.body);
	console.log("name: "+req.body.name);
	console.log("dateString: "+ req.body.dateString);
	console.log("content: "+req.body.content);

	var name = req.body.name;
	var content = req.body.content;
	var dateString = req.body.dateString;

	var imageData = req.body.imageData;

	//var decodedImage = new Buffer(imageData, 'base64').toString('binary');

	if(name != null) {
		var newDiagram = Diagram({
			name: name,
			content: content,
			dateString : dateString,
			imageString : imageData
			//previewImage : {data : imageData, contentType :"image/png"}
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
	}else{
		endResponse(res);
	}
});

//Get a stored diagram
router.get("/diagrams/:dname", function(req,res){
	console.log("GET /diagrams/" + req.params.dname);

	Diagram.findOne({name:req.params.dname}, function(err, diagram){
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
				//endResponse(res);
				res.render("diagramInfo", {diagram:diagram});
			}
		}
	});
});

//Get associated image of a diagram
router.get("/diagrams/:dname/image", function(req,res){
	console.log("GET /diagrams/" + req.params.dname+ "/image" );

	Diagram.findOne({name:req.params.dname}, function(err, diagram){

		var imageStr = diagram.imageString;

		//console.log(image);
		var decodedImage = new Buffer(imageStr, 'base64').toString('binary');
		res.writeHead('200', {'Content-Type': 'image/png'});
     	res.end(decodedImage,'binary');
	});
});

//Remove a diagram
router.delete("/diagrams/:dname", function(req, res){
	console.log("DELETE /diagrams/"+ req.params.dname);

	Diagram.findOne({name:req.params.dname}, function(err, diagram){

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
	console.log("PUT /diagrams/"+req.params.dname);

	Diagram.findOne({name:req.params.dname}, function(err, diag){

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
//=================    JSON EXPORTER   ===================
//========================================================
router.post("/exporter", function(req, res){

	if(req.query.json === "true"){

	}else{
		

		console.log("PUT /exporter \n");


		var text = req.body.text;

	/*res.set({"Content-Disposition":"attachment; filename=exported.json"});
	res.send(text);

	endResponse(res);*/

	//Create temp file for that content
	var min = 0;
	var max = 999999999;
	var random =Math.random() * (max - min) + min;
	var tempFilename = __dirname +"/tmp/input"+random +".xml";
	console.log("tempFilename: "+ tempFilename);

	fs.writeFile(tempFilename, text, function(err){
		if(err){
			console.log("Error :  "+ err);
		}else{

			var outFile = __dirname +"/tmp/output"+random +".json";
			var command = "java -jar exporter.jar "+tempFilename + " " + outFile;


			var cp = childProcess.exec(command , function(error, stdout, stderr){
				console.log("stdout: " + stdout);
				console.log("stderr: " + stderr);
				if(error){
					console.log("error: " + error);
				}else{
					console.log("jsonFile created :D");

				}
			});

			cp.on("exit", function(code){

				res.set({"Content-Disposition":"attachment; filename=exported.json"});
				res.sendFile(outFile);
				try{
					fs.unlinkSync(tempFilename);
					fs.unlinkSync(outFile);
				}catch(err){
					//endResponse(res);
				}finally{
					endResponse(res);
				}
			
			});

			
		}
	});
}

//endResponse(res);
});



router.get("/exporter", function(req, res){
	res.render("exporter");
});


router.get("/jsonTest", function(req, res){
	sendJsonResponse(res,  {code:200, msg:"Diagram removed"});
});


/*
//========================================================
//=================    BORRAR ANGEL   ===================
//========================================================
//Get all diagrams
router.get("/fragments", function(req, res){
	console.log("GET /fragments")

	Fragment.find({}, function(err, fragments){
		if(err){
			console.log("Error: "+err);
		}

		if(req.query.json ==="true"){
			sendJsonResponse(res, fragments);
		}else{
			//Cargar la web
			//endResponse(res);
			res.render("fragmentList", {fragmentList:fragments});
		}
	});
});

//Remove fragments
router.delete("/fragments", function(req, res){
	console.log("DELETE /fragments");
			Fragment.remove({}, function(err){
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
						console.log("Fragments removed")
						sendJsonResponse(res, {code:200, msg:"Fragments removed"});
					}else{
						//Load web
						endResponse(res);
					}
				}
			});
	
});

router.post("/fragments", function(req, res){
	//a partir del ? vienen los parámetros
	console.log("POST /fragments");

	
	console.log(req.body);
	console.log("name: "+req.body.name);
	console.log("content: "+req.body.content);
	console.log("domains: " + req.body.domains)

	var name = req.body.name;
	var content = req.body.content;
	
	var ext = req.body.extends;
	var domains = req.body.domains;
	var contentKeys = req.body.contentKeys;

	if(name != null) {
		var newFragment = Fragment({
			name: name,
			content: content,
			domains: domains,
			extends: ext,
			contentKeys: contentKeys
		});

		newFragment.save(function(err){
			if(err){
				console.log("Adding error: " + err);
				if(req.query.json === "true"){
					sendJsonError(res, {code:300, msg:err});
				}else{
					//Cargar la web de error
					endResponse(res);
				}
			}else{
				console.log("Fragment added");
				//todo bien, devolvemos añadido correctamente
				if(req.query.json === "true"){
					sendJsonResponse(res, {code:200, msg:"Fragment added properly"});
				}else{
					//res.redirect("");
					endResponse(res);
				}
			}
		});
	}else{
		endResponse(res);
	}
});


//---------------
//  Users
//---------------
router.get("/users", function(req, res){
	console.log("GET /users")

	User.find({}, function(err, users){
		if(err){
			console.log("Error: "+err);
		}
		console.log("Returning users")
		if(req.query.json ==="true"){
			sendJsonResponse(res, users);
		}else{
			//Cargar la web
			endResponse(res);
			//res.render("fragmentList", {fragmentList:datatypes});
		}
	});
});

router.post("/users", function(req, res){

	console.log("POST /users");

	
	console.log(req.body);
	console.log("name: "+req.body.name);
	console.log("pass: "+req.body.pass);


	var name = req.body.name;
	var pass = req.body.pass;
	

	if(name != null) {
		var newUser = User({
			name: name,
			pass: pass
		});

		newUser.save(function(err){
			if(err){
				console.log("Adding error: " + err);
				if(req.query.json === "true"){
					sendJsonError(res, {code:300, msg:err});
				}else{
					//Cargar la web de error
					endResponse(res);
				}
			}else{
				console.log("User added");
				//todo bien, devolvemos añadido correctamente
				if(req.query.json === "true"){
					sendJsonResponse(res, {code:200, msg:"User added properly"});
				}else{
					//res.redirect("");
					endResponse(res);
				}
			}
		});
	}else{
		endResponse(res);
	}
});

//Remove users
router.delete("/users", function(req, res){
	console.log("DELETE /users");
			User.remove({}, function(err){
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
						console.log("Users removed")
						sendJsonResponse(res, {code:200, msg:"users removed"});
					}else{
						//Load web
						endResponse(res);
					}
				}
			});
	
});


//---------------
//  Datatypes
//---------------

//Get all datatypes
router.get("/datatypes", function(req, res){
	console.log("GET /datatypes")

	DataType.find({}, function(err, datatypes){
		if(err){
			console.log("Error: "+err);
		}

		if(req.query.json ==="true"){
			sendJsonResponse(res, datatypes);
		}else{
			//Cargar la web
			endResponse(res);
			//res.render("fragmentList", {fragmentList:datatypes});
		}
	});
});

//Remove fragments
router.delete("/datatypes", function(req, res){
	console.log("DELETE /datatypes");
			DataType.remove({}, function(err){
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
						console.log("Datatypes removed")
						sendJsonResponse(res, {code:200, msg:"datatypes removed"});
					}else{
						//Load web
						endResponse(res);
					}
				}
			});
	
});

router.post("/datatypes", function(req, res){
	//a partir del ? vienen los parámetros
	console.log("POST /datatypes");

	
	console.log(req.body);
	console.log("name: "+req.body.name);
	console.log("content: "+req.body.content);
	//console.log("domains: " + req.body.domains)

	var name = req.body.name;
	var content = req.body.content;
	
	var ext = req.body.extend;
	var contentKeys = req.body.contentKeys;

	if(name != null) {
		var newDataType = DataType({
			name: name,
			content: content,
			extend: ext,
			contentKeys: contentKeys
		});

		newDataType.save(function(err){
			if(err){
				console.log("Adding error: " + err);
				if(req.query.json === "true"){
					sendJsonError(res, {code:300, msg:err});
				}else{
					//Cargar la web de error
					endResponse(res);
				}
			}else{
				console.log("Data type added");
				//todo bien, devolvemos añadido correctamente
				if(req.query.json === "true"){
					sendJsonResponse(res, {code:200, msg:"Data type added properly"});
				}else{
					//res.redirect("");
					endResponse(res);
				}
			}
		});
	}else{
		endResponse(res);
	}
});*/

//========================================================
//=================    Default route   ===================
//========================================================

//Default route
router.get("*", function(req, res){
	//res.render("error", {code:404, message:"Upps. Page not found"});
	endResponse(res);
});



app.use(router);




//========================================================
//================    MONGOOSE    ========================
//========================================================

var port = process.env.PORT || 8080;
console.log("Port: "+ port);


//Connection events
mongoose.connection.once("open", function(){
	console.log("We're connected! Start listening...");

	//Start listening
	app.listen(port, function() {  
		console.log("Node server running, listening on port " +port);
	});
});

mongoose.connection.on("error", function(err){
	console.log("Error");
	mongoose.connection.close();
	process.exit(1);
});


mongoose.connection.on("disconnected", function(){
	console.log("Mongoose disconnected");
	mongoose.connection.close();
});

var str = "mongodb://" +user+":"+pass + "@ds047865.mongolab.com:47865/diagrameditor";

var options = {authMechanism: 'ScramSHA1'};  

var mongooseUri = uriUtil.formatMongoose(str);    

mongoose.connect(mongooseUri, options, function(err){
	if(err){
		console.log("Error: "+ err);
	}
});







