//Pour WMS
import OSM from 'ol/source/OSM';
import Stamen from 'ol/source/Stamen';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer';

let osmLayer = new TileLayer({
    source: new OSM(),
    type: 'base',
    title: 'OSM WMS',
  })

let stamenLayer = new TileLayer({
  source: new Stamen({
    layer: 'watercolor',
  }),
  opacity: 0.8,
  type: 'base',
  title: 'Stamen WMS',  
})

export {osmLayer, stamenLayer};