import 'ol/ol.css';
import {Map, View} from 'ol';
import {osmLayer, stamenLayer} from './layersWms.js'
import {Group} from 'ol/layer'
import {ScaleLine, defaults as defaultControls} from 'ol/control'
import proj4 from 'proj4'

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
		extent: [-2500000, 3600000, 3100000, 8000000],  
	}),
});