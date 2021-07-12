import * as MyMainVar from './index.js'
import * as EditPanel from './editPanel.js'

///////////////////////////////////////////////////////////
/////////               STORY               ///////////////
///////////////////////////////////////////////////////////

export function displayStoryPanel(order) {
	if (order) {
        EditPanel.displayEditPanel(false)
        EditPanel.displayEditCatPanel(false)
		// Activation du panel
		document.getElementById('map').classList.remove("col-sm-12")
		document.getElementById('map').classList.add("col-sm-8")
		document.getElementById('story').style.display = "block"
        MyMainVar.map.updateSize()
	} else {
		// Suppression panel
		document.getElementById('map').classList.remove("col-sm-8")
		document.getElementById('map').classList.add("col-sm-12")
		document.getElementById('story').style.display = "none"
        MyMainVar.map.updateSize()
        // on efface aussi le html
        document.getElementById('story').innerHTML = ''
	}
}

function createStoryBoard() {
	// Chargement du fichier Json
	var requestURL = './data/mygeojson.geojson'
	var request = new XMLHttpRequest()
	request.open('GET', requestURL)
	request.responseType = 'json'
	request.send()

	// On parse le Json pour créer la liste de catégories
/*
////////////VERSION VERTICALE/////////////////////////////
	request.onload = function() {
		var jsonData = request.response;
		console.log(jsonData)

		let htmlStory = '<h1> Story </h1>'
		for (let feat in jsonData.features) {
			let name = jsonData.features[feat].properties.name			
			let cat = jsonData.features[feat].properties.category
			htmlStory += '<h2>'+ name +'</h2>'
			htmlStory += '<p>'+ cat +'</p>'
			htmlStory += '<img class="fit-picture" src="./data/img/lapin.jpeg" alt="Lapin">'
			htmlStory += '<hr>'	
		}
		document.getElementById('story').innerHTML = htmlStory
	}
*/
	
// VERSION HORIZONTALE ////////////////////

	function displayOnglet(currentOnglet,jsonData) {
		let id = jsonData.features[currentOnglet].properties.id			
		let name = jsonData.features[currentOnglet].properties.name			
		let cat = jsonData.features[currentOnglet].properties.category
		let coord = jsonData.features[currentOnglet].geometry.coordinates
		
		console.log(name + ' ' + cat + ' ' + coord)
		let htmlOnglet = '<div class="contentOnglets hideOnglets" data-anim="' + name + '">'
		htmlOnglet += '<h2>'+ name +'</h2>'
		htmlOnglet += '<hr>'
		htmlOnglet += '<p>'+ cat +'</p>'
		htmlOnglet += '<img id="imgPoint" class="fit-picture" src="./data/img/id_'+ id +'.jpg" alt="Photo" onerror="javascript:this.src=\'./data/img/lapin.jpeg\'">'
		htmlOnglet += '<img id="imgRemplacement" class="fit-picture" src="./data/img/lapin.jpeg" alt="Lapin" style="display:none;">'
		htmlOnglet += '<hr>'
		htmlOnglet += '</div>'
		document.getElementById('contenuOnglet').innerHTML = htmlOnglet

		//Zoom sur l'entité
		const multipleVitesse = 1.5	// reglage de la vitesse de l'anim
		const zoomEntite = 12		// zoom affichage de l'entité
		const zoomDeplacement = 8	// dezoom level avant de se déplacer
		
		if (MyMainVar.map.getView().getCenter() != coord) {
			console.log(coord + '         ' + MyMainVar.map.getView().getCenter())
			if (MyMainVar.map.getView().getZoom() > zoomDeplacement) {
				MyMainVar.map.getView().animate({
					zoom: zoomDeplacement,
					duration: 1000*multipleVitesse
				})
			}
			setTimeout(() => {
				MyMainVar.map.getView().animate({
					center: coord,
					duration: 1000*multipleVitesse
				})
			}, 500*multipleVitesse);
			setTimeout(() => {
				MyMainVar.map.getView().animate({
					zoom: zoomEntite,
					duration: 1000
				})
			}, 1000*multipleVitesse);
		}
	}

	request.onload = function() {
		var jsonData = request.response
		var currentOnglet = 0
		console.log(jsonData)

		let htmlStory = `
			<button id="prevButton" class="btn btn-success btn-nav-story"> <b><</b> </button>
			<button id="nextButton" class="btn btn-success btn-nav-story"> <b>></b> </button>
			<div class="contentOnglets" id="contenuOnglet">

			</div>
		`
		// on rajoute les boutons dans l'UI
		document.getElementById('story').innerHTML = htmlStory

		// affichage du premier onglet
		displayOnglet(currentOnglet,jsonData)

		// action des boutons
		document.getElementById('nextButton').addEventListener('click', () => {
			if (currentOnglet < jsonData.features.length -1) {
				currentOnglet += 1

                console.log('currentOnglet ' + currentOnglet)
                displayOnglet(currentOnglet,jsonData)
			}

		})
		document.getElementById('prevButton').addEventListener('click', () => {
			if (currentOnglet > 0) {
				currentOnglet -= 1

			console.log('currentOnglet ' + currentOnglet)
			displayOnglet(currentOnglet,jsonData)
            }
		})
	}
}


document.getElementById("storyBoardBtn").onclick = function() {
	if (document.getElementById('story').style.display == 'none') {
        console.log("DEMANDE AFFICHAGE STORY")
		// Activation du panel
        // on arrete les outils d'édition
        document.getElementById('typeAction').value = '-'
        EditPanel.newActionFct()
        //affichage paneau + creation
        displayStoryPanel(true)
        createStoryBoard()
	} else {
		// Suppression panel
        displayStoryPanel(false)
	}
}

