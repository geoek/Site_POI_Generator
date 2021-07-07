import $ from 'jquery'
import * as MyMainVar from './index.js'
//////////////////////////////////////////////////
///             Création liste de Catégories   ///
//////////////////////////////////////////////////


// Tableau des catégories
export let listCat = []

/*
function listCatInitialisation() {
	// Chargement du fichier Json
	var requestURL = './data/mygeojson.geojson'
	var request = new XMLHttpRequest()
	request.open('GET', requestURL)
	request.responseType = 'json'
	request.send()

	// On parse le Json pour créer la liste de catégories
	request.onload = function() {
		var jsonData = request.response;
		console.log(jsonData)
		for (let feat in jsonData.features) {
			let cat = jsonData.features[feat].properties.category
			// on recherche la position de l'objet dans la liste ayant le meme nom (pour savoir si il existe)
			let pos = listCat.map(function(e) { return e.name; }).indexOf(cat);

			if (pos >= 0){
				//console.log("trouvé à " + listCat.indexOf(cat))
			} else {
				listCat.push({name:cat,color:'#FF0000'})
			}
		}
		updateSelectCat()
	}
}
*/
export function listCatInitialisation() {
	// Chargement du fichier Json
	var requestURL = './data/listCat.json'
	var request = new XMLHttpRequest()
	request.open('GET', requestURL)
	request.responseType = 'json'
	request.send()

	// On parse le Json pour créer la liste de catégories
	request.onload = function() {
		var jsonData = request.response;
		for (let feat in jsonData) {
			let cat = jsonData[feat].name
			let color = jsonData[feat].color

			listCat.push({name:cat,color:color})
		}
		updateSelectCat()
	}
}


//////////////////////////////////////////////////
///             Edition  liste de Catégories   ///
//////////////////////////////////////////////////


// Affichage barre gestion
/*document.getElementById("editCatButton").onclick = function() {
	if (document.getElementById("listCat").style.display == 'none') {
		document.getElementById("listCat").style.display = "block"
		updateListCat()
	} else {
		document.getElementById("listCat").style.display = "none"
	}
}
*/

/*
document.getElementById("editCatButton").onclick = function() {
	if (document.getElementById("editCatBar").style.height == "0px") {
		document.getElementById("editCatBar").style.height = "30px"
		updateListCat()
	} else {
		document.getElementById("editCatBar").style.height = "0px"
		document.getElementById("editCatBar").innerHTML = ""
	}
}
*/


// Creation de la liste de gestion des cat	
export let updateListCat = function() {
	//let catBarHtml = '<ul class="list-group">'
	let catBarHtml = '<ul>'
	for (let cat in listCat) {
		// on ne veut pas afficher la catégorie par défault (-) car non supprimable
		if (listCat[cat].name != '-') {
//			let htmlToAdd = '<li class="list-group-item elementCat">' + listCat[cat] + '<span class="deleteCat badge bg-danger" id="btn_' + listCat[cat] + '"> - </span></li>'
			let htmlToAdd = '<li class="elementCat">' + listCat[cat].name
			htmlToAdd += '<span class="deleteCat badge bg-danger" id="btn_' + listCat[cat].name + '"> x </span>'
			htmlToAdd += '<label class="colorLabel" style="background-color:' + listCat[cat].color  + '"><input type="color" class="colorLabelInput" id="color_' + listCat[cat].name + ' "name="CatColor"></label>'
			htmlToAdd += '</li>'
			
			catBarHtml += htmlToAdd
		}
	}
	catBarHtml += "</ul> <hr>"

	// Champ de nouvelle cat
	catBarHtml += "<label>&nbsp Nouvelle Catégorie : &nbsp</label>"
	catBarHtml += '<input type="text" id="newCat" name="newCat">'

	// bouton de nouvelle cat
	let addButton = document.createElement('button')
	addButton.innerText = "+"
	addButton.setAttribute("id", "addCatBtn")
	addButton.setAttribute("class", "btn btn-primary")
	catBarHtml += addButton.outerHTML

	catBarHtml += '<label class="colorLabel"><input type="color" id="newCatColor" class="colorLabelInput" name="newCatColor" value="#FF00FF" "></label>'

	// Affichage du html
	document.getElementById("editCatBar").innerHTML = catBarHtml

	// Colors Pickers Actions
	var coloPickSelection = document.getElementsByClassName("colorLabelInput");
	for(var i = 0; i < coloPickSelection.length; i++) {
		(function(index) {
			// index correspond au numero de l'élément dans la liste. Attention, - n'est pas affiché. donc faire +1
			coloPickSelection[index].onchange = function() {
				this.parentNode.style.backgroundColor = this.value;
				//sauve le chgmt dans listCat (on teste l'index pour le cas où on a changé le valeur d'un nouvel ajout)
				// donc pas encore dans listCat
				if (index + 1< listCat.length) {
					listCat[index+1].color = this.value
				}
				//sauve dans le json
				saveJsonCat()
			}
	  	})(i);
	}

	// creation des actions des boutons de suppression de cat
	for (let i in document.getElementsByClassName('deleteCat') ) {
		let id = document.getElementsByClassName('deleteCat')[i].id
		if ( id != undefined) {
			document.getElementById(id).onclick = function() {
				for(var j = 0 ; j < listCat.length; j++) {
					if(listCat[j].name == id.substr(4)) {
						isCatInGeoJson(listCat[j].name,j,function(trouve,j)  {
							console.log(trouve)
							if (trouve) {
								document.getElementById('alertText').innerText = "Il existe un point avec cette catégorie"
								document.getElementById('alertBar').style.display = "block"
							} else {
								// on supprime 1 element à la position j
								listCat.splice(j,1)
							}
						})
					}
				}
				setTimeout(() => {
					saveJsonCat()
					updateListCat()
				}, 1000)
				
			}
		}
	}

	// action d'ajout de cat
	document.getElementById("addCatBtn").onclick = function() {
		let newCat = document.getElementById("newCat").value
		let newCatColor = document.getElementById("newCatColor").value
		console.log(listCat.indexOf(newCat))
		// on recherche la position de l'objet dans la liste ayant le meme nom (pour savoir si il existe)
		let pos = listCat.map(function(e) { return e.name; }).indexOf(newCat);

		if (pos < 0 && newCat != '') {
			listCat.push({name:newCat, color:newCatColor})
			saveJsonCat()
			updateListCat()
		} else {
			document.getElementById('alertText').innerText = newCat + " Vide ou existe déjà !"
			document.getElementById('alertBar').style.display = "block"
		}
	}

	updateSelectCat()
}


function updateSelectCat() {
	let tmpHtml = ""

	for (var i = 0; i < listCat.length; i++) {
		var opt = listCat[i]
		if (opt != undefined) {
			tmpHtml += '<option value="' + opt.name + '">' + opt.name + '</option>'
		}
	}
	document.getElementById("catValue").innerHTML = tmpHtml

}


function saveJsonCat() {
	console.log("SAVE JSON CAT")

	
	var jsonStr = listCat
	//il faut rajouter le crs dans la donnée sinon ca bugge
	
	//envoie du fichier eu serveur via node js
	$.ajax({
		url: "./storelistcat/",
		type: "get", //send it through get method
		data: { 
			data: jsonStr,
		},
		dataType: 'text',
		success: function(data,response) {
			console.log(response)
			console.log(data)
		},
		error: function(xhr) {
		  console.log('ko')
		}
	});

}


function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function isCatInGeoJson(cat,j,_callback) {
	readTextFile("./data/mygeojson.geojson", function(text){
		var jsonData = JSON.parse(text);
		console.log(jsonData);

		for (let feat in jsonData.features) {
			let catJson = jsonData.features[feat].properties.category
			console.log(catJson + "++++++++++++++++++++" + cat)
			// on recherche la position de l'objet dans la liste ayant le meme nom (pour savoir si il existe)
			if (cat == catJson) {
				_callback(true,j)
				return
			}
		}
		_callback(false,j)
		return
	})
}


/*
	// On parse le Json pour créer la liste de catégories
	request.onload = function() {
		var jsonData = request.response;
		console.log(jsonData)
		for (let feat in jsonData.features) {
			let catJson = jsonData.features[feat].properties.category
			console.log(catJson + "++++++++++++++++++++" + cat)
			// on recherche la position de l'objet dans la liste ayant le meme nom (pour savoir si il existe)
			if (cat == catJson) {
				setTimeout(() => {
					return true
				}, 500)
			}
		}
		return false

	}
*/

