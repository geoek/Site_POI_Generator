import $ from 'jquery'

//////////////////////////////////////////////////
///             Création liste de Catégories   ///
//////////////////////////////////////////////////


// Tableau des catégories
let listCat = [{name:"-",color:"#FF00FF"}]

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


document.getElementById("editCatButton").onclick = function() {
	if (document.getElementById("editCatBar").style.height == "0px") {
		document.getElementById("editCatBar").style.height = "30px"
		updateListCat()
	} else {
		document.getElementById("editCatBar").style.height = "0px"
		document.getElementById("editCatBar").innerHTML = ""
	}
}



// Creation de la liste de gestion des cat	
let updateListCat = function() {
	//let catBarHtml = '<ul class="list-group">'
	let catBarHtml = '<ul>'
	for (let cat in listCat) {
		// on ne veut pas afficher la catégorie par défault (-) car non supprimable
		if (listCat[cat].name != '-') {
//			let htmlToAdd = '<li class="list-group-item elementCat">' + listCat[cat] + '<span class="deleteCat badge bg-danger" id="btn_' + listCat[cat] + '"> - </span></li>'
			let htmlToAdd = '<li class="elementCat">' + listCat[cat].name
			htmlToAdd += '<label class="colorLabel" style="background-color:' + listCat[cat].color  + '"><input type="color" class="colorLabelInput" id="color_' + listCat[cat].name + ' "name="CatColor"></label>'
			htmlToAdd += '<span class="deleteCat badge bg-danger" id="btn_' + listCat[cat].name + '"> x </span></li>'
			
			catBarHtml += htmlToAdd
		}
	}
	catBarHtml += "</ul>"

	// Champ de nouvelle cat
	catBarHtml += "<label>&nbsp Nouvelle Catégorie : &nbsp</label>"
	catBarHtml += '<input type="text" id="newCat" name="newCat">'
	catBarHtml += '<label class="colorLabel"><input type="color" id="newCatColor" class="colorLabelInput" name="newCatColor" value="#FF00FF" "></label>'

	// bouton de nouvelle cat
	let addButton = document.createElement('button')
	addButton.innerText = "+"
	addButton.setAttribute("id", "addCatBtn")
	addButton.setAttribute("class", "btn btn-primary")
	catBarHtml += addButton.outerHTML

	// Affichage du html
	document.getElementById("editCatBar").innerHTML = catBarHtml

	// Colors Pickers Actions
	var coloPickSelection = document.getElementsByClassName("colorLabelInput");
	for(var i = 0; i < coloPickSelection.length; i++) {
		(function(index) {
			coloPickSelection[index].onchange = function() {
				this.parentNode.style.backgroundColor = this.value;
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
						// on supprime 1 element à la position j
						listCat.splice(j,1)
					}
				}
				saveJsonCat()
				updateListCat()
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
			alert(newCat + " Vide ou existe déjà !")
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

export {listCatInitialisation}