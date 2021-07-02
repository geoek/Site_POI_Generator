
//////////////////////////////////////////////////
///             Création liste de Catégories   ///
//////////////////////////////////////////////////


// Tableau des catégories
let listCat = ["-"]

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
			if (listCat.indexOf(cat) >= 0){
				//console.log("trouvé à " + listCat.indexOf(cat))
			} else {
				listCat.push(cat)
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
		if (listCat[cat] != '-') {
//			let htmlToAdd = '<li class="list-group-item elementCat">' + listCat[cat] + '<span class="deleteCat badge bg-danger" id="btn_' + listCat[cat] + '"> - </span></li>'
			let htmlToAdd = '<li class="elementCat">' + listCat[cat] + '<div class="colorPicker"> </div>' + '<span class="deleteCat badge bg-danger" id="btn_' + listCat[cat] + '"> x </span></li>'
			catBarHtml += htmlToAdd
		}
	}
	catBarHtml += "</ul>"

	// Champ de nouvelle cat
	catBarHtml += "<label>&nbsp Nouvelle Catégorie : &nbsp</label>"
	catBarHtml += '<input type="text" id="newCat" name="newCat">'


	
	catBarHtml += '<label class="colorLabel"><input type="color" class="colorLabelInput" name="newCatColor" value="#FF00FF" "></label>'

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
			}
	  	})(i);
	}












	// creation des actions des boutons de suppression de cat
	for (let i in document.getElementsByClassName('deleteCat') ) {
		let id = document.getElementsByClassName('deleteCat')[i].id
		if ( id != undefined) {
			console.log(id)
			document.getElementById(id).onclick = function() {
				for(var j = 0 ; j < listCat.length; j++) {
					if(listCat[j] == id.substr(4)) {
						delete listCat[j]
					}
				}
				updateListCat()
			}
		}

	}

	// action d'ajout de cat
	document.getElementById("addCatBtn").onclick = function() {
		let newCat = document.getElementById("newCat").value
		console.log(listCat.indexOf(newCat))
		if (listCat.indexOf(newCat) < 0 && newCat != '') {
			listCat.push(newCat)
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
			tmpHtml += '<option value="' + opt + '">' + opt + '</option>'
		}
	}
	document.getElementById("catValue").innerHTML = tmpHtml

}		

export {listCatInitialisation}