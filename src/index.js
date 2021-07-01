
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
import * as Story from './story.js'



let baselayers = new Group({
	'title': 'Base Maps',
	layers: [stamenLayer,osmLayer]
})


export const map = new Map({
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

export function displayEditPanel(order) {
	if (order) {
		Story.displayStoryPanel(false)
		// Activation du panel
		document.getElementById('map').classList.remove("col-sm-12")
		document.getElementById('map').classList.add("col-sm-8")
		document.getElementById('editPanel').style.display = "block"
		map.updateSize()
	} else {
		// Suppression panel
		document.getElementById('map').classList.remove("col-sm-8")
		document.getElementById('map').classList.add("col-sm-12")
		document.getElementById('editPanel').style.display = "none"
		map.updateSize()
	}
}

var typeInterraction = document.getElementById('typeAction')
typeInterraction.onchange = function() {
	newActionFct()
}

var draw
var select = new Select();
var modify = new Modify({
	features: select.getFeatures()
});

export function newActionFct() {
	map.removeInteraction(draw)
	map.removeInteraction(select)
	map.removeInteraction(modify)

	if (typeInterraction.value == 'addPoint') {
		displayEditPanel(true)
		document.getElementById('uploadModule').style.display = "inline"

		document.getElementById('nameValue').value = ''
		document.getElementById('catValue').value = '-'

		let tempSource = localGeoLayer.getSource()
		let sizeJson = tempSource.getFeatures().length
		let maxId = 0
		for (let i = 0; i < sizeJson; i++) {
			if (tempSource.getFeatures()[i].values_.id > maxId) {
				maxId = tempSource.getFeatures()[i].values_.id
			}
		}
		let nextId = maxId + 1
		document.getElementById('idValue').value = nextId

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
			if (document.getElementById('nameValue').value == '' || 
			document.getElementById('catValue').value == '-') {
				draw.abortDrawing()
				document.getElementById('alertText').innerText = "Renseignez d'abord les propriétées, puis placez le point sur la carte"
				document.getElementById('alertBar').style.display = "block"
			} else {
				// on enregistre les propriétés
				e.feature.setProperties({
					'id': nextId,
					'name': document.getElementById('nameValue').value,
					'category': document.getElementById('catValue').value
				})
			}
		});

		//Apres avoir ajouté un point on quitte le mode ajout, on exporte la donnée et on nettoie le formulaire
		draw.on('drawend', function (e) {
			map.removeInteraction(draw)
			typeInterraction.value = "-"
			//on exporte apres 500ms (sinon donnée pas encore validé dans draw)
			setTimeout(() => {
				exportGeoJson()
			}, 500)
			// A FAIRE : notif flottante : Ajout point ok
		});
	} else if (typeInterraction.value == 'modify') {
		displayEditPanel(true)

		document.getElementById('uploadModule').style.display = "inline"
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
				e.deselected[0].values_.name=document.getElementById('nameValue').value
				e.deselected[0].values_.category=document.getElementById('catValue').value
				setTimeout(() => {
					exportGeoJson()
				}, 500)
				setTimeout(() => {
					document.getElementById('idValue').value = ''
					document.getElementById('nameValue').value = ''
					document.getElementById('catValue').value = '-'
				}, 500)
			} 

		})
	} else {
		displayEditPanel(false)
		document.getElementById('idValue').value = ''
		document.getElementById('nameValue').value = ''
		document.getElementById('catValue').value = '-'
		document.getElementById('uploadModule').style.display = "none"
		//document.getElementById('editPanel').innerHTML = ''

	}
}


/////////////////////////////////////////////////////////////////////
// Export de la donnée GeoJson                                     //
/////////////////////////////////////////////////////////////////////

function exportGeoJson() {
	console.log("EXPORTATION")
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
	// A FAIRE : combinaison de touche ou bouton pour éviter confilit qd on saisit texte
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


document.getElementById("closeAlertBtn").onclick = function() {
	document.getElementById('alertText').innerText = ''
	document.getElementById('alertBar').style.display = "none"
};


window.onload = function() {
	listCatInitialisation()
}


///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
//
//             UPLOAD PHOTOS
//
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

document.getElementById("uploadPhotoBtn").onclick = function() {
	if (document.getElementById("photoFile").files[0] != undefined) {
		// on recupere la photo selectionnée
		let photo = document.getElementById("photoFile").files[0]
		//on créé un objet pour envoyer les data au serveur
		var formData = new FormData()

		let filename = 'id_' + document.getElementById("idValue").value + '.jpg'

		//on rempli l'objet
		formData.append('photo', photo)
		formData.append('name', filename) // A FAIRE : id automatique de chaque point

		// requete pour le serveur (voir aussi $AJAX (jquery) ou fetch)
		var request = new XMLHttpRequest();
		request.open("POST", "./uploadphoto/");
		request.send(formData);

		//alert("Upload OK")
		document.getElementById('alertText').innerText = "Upload de la photo fini !"
		document.getElementById('alertBar').style.display = "block"
		// A FAIRE : Rajouter notif flottante qd upload ok
	}
}
