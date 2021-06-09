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
import GeometryType from 'ol/geom/GeometryType'
import Poi from './poi.js'
import GeoJSON from 'ol/format/GeoJSON'
import VectorSource from 'ol/source/Vector'
import proj4 from 'proj4'
import {register} from 'ol/proj/proj4'
import {get as olProjGet} from 'ol/proj'
import {transform} from 'ol/proj'
import LayerSwitcher from 'ol-layerswitcher'

// ajout de la projection 2154
proj4.defs('EPSG:2154',"+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
// ensure OL knows about the PROJ4 definitions
register(proj4);


let baselayers = new Group({
	'title': 'Base Maps',
	layers: [stamenLayer,osmLayer]
})


const map = new Map({
/*	controls: defaultControls().extend([
		new ScaleLine({
			units: 'degrees',
		})
	]),*/
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

const myFirstPoi = new Poi({
	name: 'Poi1',
	type: 'Nature',
	coord: "34.2 23.5"
})

var coord = [300000, 5950000]
var layer = new LayerVector({
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

map.addLayer(layer)


var localGeoLayer = new LayerVector({
	title: "My json",
	source: new SourceVector({
		url: 'data/mygeojson.geojson',
		format: new GeoJSON(),
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

map.addLayer(localGeoLayer)


/*
new LayerVector({
	source: new GeoJSON({
	   projection : 'EPSG:3857',
	   url: 'data/mygeojson.geojson'
	}),
	style: new Style({
		image: new Circle({
			radius: 10,
			fill: new Fill({
				color: '#0000FF',
			}),
			stroke: new Stroke({
				color: '#fff',
				width: 0.5,
			}),
		}),
	})
})
*/



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
// Creation de la couche des POI lié à une donnée GeoJson          //
/////////////////////////////////////////////////////////////////////

var poiGeojsonObject = {
    'features':[],
	'type': 'FeatureCollection',
	'name': 'mygeojson',
	"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::3857" } },

};

var poiFeatures = (new GeoJSON()).readFeatures(poiGeojsonObject);
console.log(poiFeatures)
var poiSource = new VectorSource({
	features: poiFeatures,
	format: new GeoJSON()
});
console.log(poiSource)
var poiLayer = new LayerVector({
	title: "My POI",
	source: poiSource,
	style: new Style({
		image: new Circle({
			radius: 5,
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

map.addLayer(poiLayer)


/////////////////////////////////////////////////////////////////////
// Creation des interactions avec la carte                         //
/////////////////////////////////////////////////////////////////////

var draw
var typeInterraction = document.getElementById('typeAction')

var select = new Select();
var modify = new Modify({
	features: select.getFeatures()
});

function addInteraction(){
	var value = typeInterraction.value
	if (value !== 'None') {
		draw = new Draw({
			source: poiSource,
			type: ("Point")       
		});
		map.addInteraction(draw)
		poiSource.addFeatures(draw)
		console.log(poiSource)
		debugGeoJson()
	}
	else {
		map.addInteraction(select)
		map.addInteraction(modify)
	}
}

typeInterraction.onchange = function() {
	map.removeInteraction(draw);
	map.removeInteraction(select)
	map.removeInteraction(modify)
	addInteraction()
};

addInteraction()


/////////////////////////////////////////////////////////////////////
// Export de la donnée GeoJson                                     //
/////////////////////////////////////////////////////////////////////

function debugGeoJson() {
	var writer = new GeoJSON()
	var geojsonStr = writer.writeFeatures(poiSource.getFeatures())
	console.log(poiFeatures)
	//var geojsonStr = writer.writeFeatures(transform(poiSource.getFeatures(),'EPSG:4326', 'EPSG:3857'))

	document.getElementById("demo").innerHTML = geojsonStr
}

map.on("singleclick", function(evt){
	debugGeoJson()
})





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
