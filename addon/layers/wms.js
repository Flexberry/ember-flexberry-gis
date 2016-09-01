/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import TileLayer from './tile';

let WmsLayer = {};
Ember.$.extend(true, WmsLayer, TileLayer);

/**
  Class describing WMS layer metadata.

  @class WmsLayer
  @extends TileLayer
*/
export default WmsLayer;
