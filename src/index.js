import 'ol/ol.css'
import {Map, View,Feature,Overlay} from 'ol';
import {osmLayer, stamenLayer} from './layersWms.js'
import {Group} from 'ol/layer'
import {Point} from 'ol/geom'
import {Vector as LayerVector} from 'ol/layer'
import {Vector as SourceVector} from 'ol/source'
import {Draw, Select, Modify} from 'ol/interaction'
import {Circle, Fill, Stroke, Style} from 'ol/style';
import GeometryType from 'ol/geom/GeometryType';
import Poi from './poi.js'
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';


let baselayers = new Group({
	'title': 'Base Maps',
	layers: [stamenLayer,osmLayer]
});

const map = new Map({
/*	controls: defaultControls().extend([
		new ScaleLine({
			units: 'degrees',
		})
	]),*/
	layers: [baselayers],
	target: document.getElementById('map'),
	view: new View({
		//projection: 'EPSG:2154',
		center: [300000,5950000],
		zoom: 6,
		//extent: [-2500000, 3600000, 3100000, 8000000],  
	}),
});

const myFirstPoi = new Poi({
	name: 'Poi1',
	type: 'Nature',
	coord: "34.2 23.5"
})

var coord = [300000, 5950000];
var layer = new LayerVector({
	source: new SourceVector({
		features: [
			new Feature({
				geometry: new Point(coord)
			})
		]
	}),
	style: new Style({
		image: new Circle({
			radius: 10,
			fill: new Fill({
				color: '#3399CC',
			}),
			stroke: new Stroke({
				color: '#fff',
				width: 0.5,
			}),
		}),
	})
});

map.addLayer(layer);


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
// Affichage des buffers depuis Postgis avec update de la position //
/////////////////////////////////////////////////////////////////////
var geojsonObject = {
    'type': 'FeatureCollection',
    'crs': {
        'type': 'name'
        },
        'features':[]
};

var features = (new GeoJSON()).readFeatures(geojsonObject);
var source = new VectorSource({
	features: features,
	format: new GeoJSON()
});

var vectorLayer = new LayerVector({
	title: "Vector",
	source: source,
	style: new Style({
		image: new Circle({
			radius: 10,
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

map.addLayer(vectorLayer);


var draw
var typeSelect = document.getElementById('type');

var select = new Select();
var modify = new Modify({
	features: select.getFeatures()
});

function addInteraction(){
	var value = typeSelect.value;
	if (value !== 'None') {
		draw = new Draw({
		source: source,
		type: ("Point")       
		});
		map.addInteraction(draw);
		source.addFeatures(draw);
		console.log(source)
		}
	else{
		map.addInteraction(select);
		map.addInteraction(modify);
		}

	}



typeSelect.onchange = function() {
	map.removeInteraction(draw);
	map.removeInteraction(select);
	map.removeInteraction(modify);
	addInteraction();
};

addInteraction();

var writer = new GeoJSON();
var geojsonStr = writer.writeFeatures(source.getFeatures());

function getfeatures(){
document.getElementById("demo").innerHTML = geojsonStr;
}
/*
map.on("singleclick", function(evt){
	// récupération des coordonnées
	let coord = source.getFeatures()[0].values_.geometry.flatCoordinates
	let x = coord[0]
	let y = coord[1]
	//calculateData(id_request,x,y)

	var myFeature = new Feature({
		geometry: new Point([x, y]),
		labelPoint: new Point([x, y]),
		name: 'My Point'
	})
	var myGeoJson = new GeoJSON({
		dataProjection: 'EPSG:4326',
		geometryName: 'my_Poi',
	})

	var test = myGeoJson.writeFeatureObject(myFeature,{dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
	console.log(myFeature)
	console.log(myGeoJson)
	console.log(test)
})
*/
