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

let listCat = ["Ville",'Capitale','Village']

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
		draw.on('drawend', function (e) {
			console.log(localGeoLayer.getSource().getFeatures())
			e.feature.setProperties({
				'id': document.getElementById('idValue').value,
				'name': document.getElementById('nameValue').value,
				'category': document.getElementById('catValue').value
			  })
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

///////////////////////////////////////////////////
///             Gestion Catégories              ///
///////////////////////////////////////////////////

// Affichage barre gestion
document.getElementById("editCatButton").onclick = function() {
	if (document.getElementById("listCat").style.display == 'none') {
		document.getElementById("listCat").style.display = "block"
		updateListCat()
	} else {
		document.getElementById("listCat").style.display = "none"
	}
}

// Creation de la liste de gestion des cat	
let updateListCat = function() {
	document.getElementById("listCat").innerHTML = "<ul>"
	for (let cat in listCat) {
		document.getElementById("listCat").innerHTML += "<li class='listeCat'>" + listCat[cat] + "</li>"
		//ajout d'un bouton de suppression de la cat
		let inputElement = document.createElement('button')
		inputElement.innerText = "-"
		inputElement.setAttribute("class", "deleteCat")
		inputElement.setAttribute("id", "btn"+listCat[cat])
		document.getElementById("listCat").innerHTML += inputElement.outerHTML

	}

	// Champ de nouvelle cat
	document.getElementById("listCat").innerHTML += "<label>&nbsp Nouvelle Catégorie : &nbsp</label>"
	document.getElementById("listCat").innerHTML += '<input type="text" id="newCat" name="newCat">'
	document.getElementById("listCat").innerHTML += "</ul>"

	// bouton de nouvelle cat
	let addButton = document.createElement('button')
	addButton.innerText = "+"
	addButton.setAttribute("id", "addCatBtn")
	document.getElementById("listCat").innerHTML += addButton.outerHTML

	document.getElementById("listCat").innerHTML += "</ul>"

	// creation des actions des boutons de suppression de cat
	for (let i in document.getElementsByClassName('deleteCat') ) {
		let id = document.getElementsByClassName('deleteCat')[i].id
		if ( id != undefined) {
			console.log(id)
			document.getElementById(id).onclick = function() {
				for(var j = 0 ; j < listCat.length; j++) {
					if(listCat[j] == id.substr(3)) {
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
		if (listCat.indexOf(newCat) < 0) {
			listCat.push(newCat)
			updateListCat()
		} else {
			alert(newCat + " existe déjà !")
		}
	}

	updateSelectCat()
}


window.onload = function() {
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
