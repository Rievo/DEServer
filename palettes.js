//========================================================
//====================    Palettes   =====================
//========================================================
router.get("/palettes", function(req, res){
	console.log("GET /palettes");

	//if(req.query.json === "true"){

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
	//}else{
	//	
	//}
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
					res.redirect("/palettes");
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