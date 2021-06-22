
// Or import only needed plugins
import '../node_modules/bootstrap/js/dist/*.js';

import 'ol/ol.css'
import 'ol-layerswitcher/dist/ol-layerswitcher.css'
import {Map, View,Feature,Overlay} from 'ol'
import {osmLayer, stamenLayer} from './layersWms.js'
import {Group} from 'ol/layer'
import {Point} from 'ol/geom'
import {Vector as LayerVector} from 'ol/layer'
import {Vector as SourceVector} from 'ol/source'
import {Draw, Select, Modify} from 'ol/interaction'
import {Circle, Fill, Stroke, Style} from 'ol/style'
import Poi from './poi.js'
import GeoJSON from 'ol/format/GeoJSON'
import VectorSource from 'ol/source/Vector'
import LayerSwitcher from 'ol-layerswitcher'
import $ from 'jquery'
import ScaleLine from 'ol/control/ScaleLine'
import {defaults as defaultControls} from 'ol/control'
import { createProjection } from 'ol/proj'
import {listCatInitialisation} from './category.js'
import './category.js'



let baselayers = new Group({
	'title': 'Base Maps',
	layers: [stamenLayer,osmLayer]
})


const map = new Map({
	controls: defaultControls().extend([
		new ScaleLine({
			units: 'metric',
		})
	]),
	layers: [baselayers],
	target: document.getElementById('map'),
	view: new View({
		projection: 'EPSG:3857',
		center: [300000,5950000],
		zoom: 6,
		//extent: [-2500000, 3600000, 3100000, 8000000],  
	}),
})

var layerSwitcher = new LayerSwitcher({
	reverse: true,
	activationMode: 'click',
	groupSelectStyle: 'group'
  });
map.addControl(layerSwitcher);

//Utiliser l'instance pour les autres POI
const myFirstPoi = new Poi({
	name: 'Poi1',
	type: 'Nature',
	coord: "34.2 23.5"
})

var coord = [300000, 5950000]
var testLayer = new LayerVector({
	title: "My point",
	source: new SourceVector({
		features: [
			new Feature({
				geometry: new Point(coord)
			})
		]
	}),
	style: new Style({
		image: new Circle({
			radius: 3,
			fill: new Fill({
				color: '#FF0000',
			}),
			stroke: new Stroke({
				color: '#fff',
				width: 0.5,
			}),
		}),
	})
});

map.addLayer(testLayer)


let styleCatVille = new Style({
	image: new Circle({
		radius: 7,
		fill: new Fill({
			color: '#3399CC',
		}),
		stroke: new Stroke({
			color: '#fff',
			width: 0.5,
		})
	})
})

let styleCatCapitale = new Style({
	image: new Circle({
		radius: 7,
		fill: new Fill({
			color: '#FF0000',
		}),
		stroke: new Stroke({
			color: '#fff',
			width: 0.5,
		})
	})
})

let styleCatVillage = new Style({
	image: new Circle({
		radius: 7,
		fill: new Fill({
			color: '#00BB55',
		}),
		stroke: new Stroke({
			color: '#fff',
			width: 0.5,
		})
	})
})

var localGeoLayer = new LayerVector({
	title: "My json",
	source: new SourceVector({
		url: 'data/mygeojson.geojson',
		format: new GeoJSON(),
	}),
/*	style: new Style({
		image: new Circle({
			radius: 7,
			fill: new Fill({
				color: '#3399CC',
			}),
			stroke: new Stroke({
				color: '#fff',
				width: 0.5,
			}),
		}),
	})
*/
	style: function(feature, resolution) {
		if (feature.getProperties().category === 'Ville') {
			// create styles...
			return styleCatVille
		}
		else if (feature.getProperties().category === 'Capitale') {
			// create styles...
			return styleCatCapitale
		}
		else{
			return styleCatVillage
		}
	}
});

map.addLayer(localGeoLayer)



////////////////////////////
// POPUP POI              //
////////////////////////////
/*
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
var overlay = new Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});

map.addOverlay(overlay);
closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

map.on('singleclick', function (event) {
	if (map.hasFeatureAtPixel(event.pixel) === true) {
		var coordinate = event.coordinate;

		content.innerHTML = '<b>Hello world!</b><br />I am a popup.';
		overlay.setPosition(coordinate);
	} else {
		overlay.setPosition(undefined);
		closer.blur();
	}
});

*/

/////////////////////////////////////////////////////////////////////
// Creation des interactions avec la carte                         //
/////////////////////////////////////////////////////////////////////

var typeInterraction = document.getElementById('typeAction')

var draw
var select = new Select();
var modify = new Modify({
	features: select.getFeatures()
});

typeInterraction.onchange = function() {
	map.removeInteraction(draw)
	map.removeInteraction(select)
	map.removeInteraction(modify)

	if (typeInterraction.value == 'addPoint') {
		document.getElementById('idValue').value = ''
		document.getElementById('nameValue').value = ''
		document.getElementById('catValue').value = '-'

		let tempSource = localGeoLayer.getSource()
		let idValue = document.getElementById('typeValue')
		draw = new Draw({
			source: tempSource,
			type: ("Point")
		})

		map.addInteraction(draw)
		console.log(draw)
		tempSource.addFeatures(draw)

		//Ajout des attributs
		draw.on('drawstart', function (e) {
			// Vérificatioin que les attributs ont été renseignés
			if (document.getElementById('idValue').value == '' || 
			document.getElementById('nameValue').value == '' || 
			document.getElementById('catValue').value == '-') {
				draw.abortDrawing()
				document.getElementById('alertText').innerText = "Renseignez les propriétées"
				document.getElementById('alertBar').style.display = "block"
			} else {
				// on enregistre les propriétés
				e.feature.setProperties({
					'id': document.getElementById('idValue').value,
					'name': document.getElementById('nameValue').value,
					'category': document.getElementById('catValue').value
				})
			}

		});

	}
	else if (typeInterraction.value == 'modify') {
		map.addInteraction(select)
		map.addInteraction(modify)


		select.on('select',function (e){
			if (e.selected.length >= 1 ) {
				console.log(e)
				document.getElementById('idValue').value=e.selected[0].values_.id
				document.getElementById('nameValue').value=e.selected[0].values_.name
				document.getElementById('catValue').value=e.selected[0].values_.category
			}
			else {
				console.log("Select END")
				console.log(e)
				//mise à jour des attributs
				e.deselected[0].values_.id = document.getElementById('idValue').value
				e.deselected[0].values_.name=document.getElementById('nameValue').value
				e.deselected[0].values_.category=document.getElementById('catValue').value
				console.log(document.getElementById('idValue').value)
				console.log(e)
			} 

		})
	}
}


/////////////////////////////////////////////////////////////////////
// Export de la donnée GeoJson                                     //
/////////////////////////////////////////////////////////////////////

function exportGeoJson() {
	var writer = new GeoJSON()
	
	var geojsonStr = writer.writeFeatures(localGeoLayer.getSource().getFeatures())
	//il faut rajouter le crs dans la donnée sinon ca bugge
	geojsonStr = geojsonStr.slice(0, 1) + '"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::3857" } },' + geojsonStr.slice(1);

//	document.getElementById("demo").innerHTML = geojsonStr2

	//envoie du fichier eu serveur via node js
	$.ajax({
		url: "./storejson/",
		type: "get", //send it through get method
		data: { 
			data: geojsonStr,
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
/*
//A chaque click sur la carte on exporte la donnée (ou mettre un bouton save)
map.on("singleclick", function(evt){
	console.log("EXPORT")
	exportGeoJson()
})
*/
// Permettre la suppression des points sélectionnés
document.addEventListener('keydown', function (e){
	console.log(e)
	//if(e.key == "Delete" && (e.key == "ShiftLeft" || e.key == "ShiftRight")) {
	if(e.key == "Delete") {
		//on enleve le comportement par default du navigateur
		e.preventDefault();
		//Si un objet est sélectionné, on le supprime
		if (select.getFeatures().item(0) !== undefined) {
			var selectedFeature = select.getFeatures().item(0);
			//Remove it from your feature source
			localGeoLayer.getSource().removeFeature(selectedFeature)
		}
	}
})

document.getElementById("saveButton").onclick = function() {
	map.removeInteraction(draw)
	map.removeInteraction(select)
	map.removeInteraction(modify)

	typeInterraction.value = "-"
	exportGeoJson()
};

document.getElementById("closeAlertBtn").onclick = function() {
	document.getElementById('alertText').innerText = ''
	document.getElementById('alertBar').style.display = "none"
};


window.onload = function() {
	listCatInitialisation()
}


///////////////////////////////////////////////////////////
/////////               STORY               ///////////////
///////////////////////////////////////////////////////////

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
		let name = jsonData.features[currentOnglet].properties.name			
		let cat = jsonData.features[currentOnglet].properties.category
		let coord = jsonData.features[currentOnglet].geometry.coordinates
		
		console.log(name + ' ' + cat + ' ' + coord)
		let htmlOnglet = '<div class="contentOnglets hideOnglets" data-anim="' + name + '">'
		htmlOnglet += '<h2>'+ name +'</h2>'
		htmlOnglet += '<hr>'
		htmlOnglet += '<p>'+ cat +'</p>'
		htmlOnglet += '<img class="fit-picture" src="./data/img/lapin.jpeg" alt="Lapin">'
		htmlOnglet += '<hr>'
		htmlOnglet += '</div>'
		
		document.getElementById('contenuOnglet').innerHTML = htmlOnglet

		//Zoom sur l'entité
		const multipleVitesse = 1.5	// reglage de la vitesse de l'anim
		const zoomEntite = 12		// zoom affichage de l'entité
		const zoomDeplacement = 8	// dezoom level avant de se déplacer
		
		if (map.getView().getCenter() != coord) {
			console.log(coord + '         ' + map.getView().getCenter())
			if (map.getView().getZoom() > zoomDeplacement) {
				map.getView().animate({
					zoom: zoomDeplacement,
					duration: 1000*multipleVitesse
				})
			}
			setTimeout(() => {
				map.getView().animate({
					center: coord,
					duration: 1000*multipleVitesse
				})
			}, 500*multipleVitesse);
			setTimeout(() => {
				map.getView().animate({
					zoom: zoomEntite,
					duration: 1000
				})
			}, 1000*multipleVitesse);
		}

/*
		if (map.getView().getCenter() != coord) {
			map.getView().animate({
				center: coord,
				duration: 1500
			  })
		}*/
	}


	request.onload = function() {
		var jsonData = request.response
		var currentOnglet = 0
		console.log(jsonData)
/*
		let htmlStory = `
		<div class="titleOnglets">
			<div class="onglet active" data-anim="Paris">
				Paris
			</div>
			<div class="onglet" data-anim="Londres">
				Londres
			</div>
			<div class="onglet" data-anim="Brest">
				Brest
			</div>
		</div>
		<div class="contentOnglets" id="contenuOnglet">
		</div>
		`
		for (let feat in jsonData.features) {
			let name = jsonData.features[feat].properties.name			
			let cat = jsonData.features[feat].properties.category
			htmlStory += '<div class="contentOnglets hideOnglets" data-anim="' + name + '" style="opacity:0.5">'
			htmlStory += '<h2>'+ name +'</h2>'
			htmlStory += '<hr>'
			htmlStory += '<p>'+ cat +'</p>'
			htmlStory += '<img class="fit-picture" src="./data/img/lapin.jpeg" alt="Lapin">'
			htmlStory += '<hr>'
			htmlStory += '</div>'
		}
*/
		let htmlStory = `
			<button id="prevButton" class="btn btn-success"> <b>-</b> </button>
			<button id="nextButton" class="btn btn-success"> <b>+</b> </button>
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
			}

			console.log('currentOnglet ' + currentOnglet)
			displayOnglet(currentOnglet,jsonData)
		})
		document.getElementById('prevButton').addEventListener('click', () => {
			if (currentOnglet > 0) {
				currentOnglet -= 1
			}
			console.log('currentOnglet ' + currentOnglet)
			displayOnglet(currentOnglet,jsonData)
		})

/*		
		document.getElementById("Paris-tab").onclick = function() {
			document.getElementById('Paris').classList.add('active')
		}
		document.getElementById("Londres-tab").onclick = function() {
			document.getElementById('Londres').classList.add('active')
		}
		document.getElementById("Brest-tab").onclick = function() {
			document.getElementById('Brest').classList.add('active')
		}
*/

		//const onglets = document.querySelectorAll('.onglet')
		//const ongletsContenu = document.querySelectorAll('.contentOnglets')

		//console.log(ongletsContenu)
/*		
		let index = 0

		onglets.forEach(onglet => {
			onglet.addEventListener('click', () => {
				if (onglet.classList.contains('active')) {
					return
				} else {
					onglet.classList.add('active')
				}

				index = onglet.getAttribute('data-anim')

				for (let i=0; i<onglets.length; i++) {
					if (onglets[i].getAttribute('data-anim') != index) {
						onglets[i].classList.remove('active')
					}
					else {
						console.log('TROUVEEEE ' + index + ' ' + i)

						let name = jsonData.features[i].properties.name			
						let cat = jsonData.features[i].properties.category

						console.log(name + ' ' + cat)
						let htmlOnglet = '<div class="contentOnglets hideOnglets" data-anim="' + name + '" style="opacity:0.5">'
						htmlOnglet += '<h2>'+ name +'</h2>'
						htmlOnglet += '<hr>'
						htmlOnglet += '<p>'+ cat +'</p>'
						htmlOnglet += '<img class="fit-picture" src="./data/img/lapin.jpeg" alt="Lapin">'
						htmlOnglet += '<hr>'
						htmlOnglet += '</div>'
						
						document.getElementById('contenuOnglet').innerHTML = htmlOnglet
					}
				}
				*/
/*
				for (let j=0; j<ongletsContenu.length; j++) {
					console.log(j)
					if (ongletsContenu[j].getAttribute('data-anim') == index) {
						console.log('TROUVEEEE')

						let name = jsonData.features[j].properties.name			
						let cat = jsonData.features[j].properties.category
						htmlOnglet += '<div class="contentOnglets hideOnglets" data-anim="' + name + '" style="opacity:0.5">'
						htmlOnglet += '<h2>'+ name +'</h2>'
						htmlOnglet += '<hr>'
						htmlOnglet += '<p>'+ cat +'</p>'
						htmlOnglet += '<img class="fit-picture" src="./data/img/lapin.jpeg" alt="Lapin">'
						htmlOnglet += '<hr>'
						htmlOnglet += '</div>'
						
						document.getElementById('contenuOnglet').innerHTML = htmlOnglet

						//ongletsContenu[j].classList.add('activeContenu')
						//ongletsContenu[j].classList.remove('hideOnglets')
						//ongletsContenu[j].style.opacity = 1
					} else {
						//ongletsContenu[j].classList.remove('activeContenu')
						//ongletsContenu[j].classList.add('hideOnglets')
						//ongletsContenu[j].style.opacity = 1
					}
				}*/
/*					
			})
		})
	*/
	}

}


document.getElementById("storyBoardBtn").onclick = function() {
	if (document.getElementById('map').classList.contains('col-12')) {
		// Activation du panel
		document.getElementById('map').classList.remove("col-12")
		document.getElementById('map').classList.add("col-8")
		document.getElementById('story').style.display = "block"
		createStoryBoard()
	} else {
		// Suppression panel
		document.getElementById('map').classList.remove("col-8")
		document.getElementById('map').classList.add("col-12")
		document.getElementById('story').innerHTML = ''
	}
}