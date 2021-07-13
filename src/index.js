
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
import {Circle, Fill, Stroke, Style} from 'ol/style'
import Poi from './poi.js'
import GeoJSON from 'ol/format/GeoJSON'
import LayerSwitcher from 'ol-layerswitcher'

import ScaleLine from 'ol/control/ScaleLine'
import {defaults as defaultControls} from 'ol/control'
import {listCat, listCatInitialisation} from './category.js'
import './category.js'
import './story.js'
import './editPanel.js'
import './uploadPhoto.js'



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
/*
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
*/
export var localGeoLayer

export function addPoiToMap() {
	map.removeLayer(localGeoLayer)
	let styleCatDefault = new Style({
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

	let styleCat=[]

	for (let cat in listCat) {
		styleCat[cat] = new Style({
			image: new Circle({
				radius: 7,
				fill: new Fill({
					color: listCat[cat].color,
				}),
				stroke: new Stroke({
					color: '#fff',
					width: 0.5,
				})
			})
		})
	}

	localGeoLayer = new LayerVector({
		title: "My json",
		source: new SourceVector({
			url: 'data/mygeojson.geojson',
			format: new GeoJSON(),
		}),
		style: function(feature, resolution) {
			for (let cat in listCat) {
				if (feature.getProperties().category === listCat[cat].name) {
					return styleCat[cat]
				}
			}
		}
	});

	map.addLayer(localGeoLayer)
}


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


document.getElementById("closeAlertBtn").onclick = function() {
	//document.getElementById('alertText').innerText = ''
	document.getElementById('alertBar').classList.remove('fade-in');
	document.getElementById('alertBar').classList.add('fade-out');
	//document.getElementById('alertBar').style.display = "none"
};


window.onload = function() {
	listCatInitialisation()

	//on attend un peu le temps de charger la liste des cat
	// A FAIRE : améliorer
	setTimeout(() => {
		addPoiToMap()
	}, 1000)
	
}
