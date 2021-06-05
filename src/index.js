import 'ol/ol.css'
import {Map, View,Feature,Overlay} from 'ol';
import {osmLayer, stamenLayer} from './layersWms.js'
import {Group} from 'ol/layer'
import {Point} from 'ol/geom'
import {Vector as LayerVector} from 'ol/layer'
import {Vector as SourceVector} from 'ol/source'
import Poi from './poi.js'

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
	})
});
map.addLayer(layer);


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

