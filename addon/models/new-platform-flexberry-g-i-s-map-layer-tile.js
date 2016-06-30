import DS from 'ember-data';
import BaseModel from 'ember-flexberry/models/base';

let Model = BaseModel.extend({
  url: DS.attr('string'),
  minZoom: DS.attr('number'),
  maxZoom: DS.attr('number'),
  maxNativeZoom: DS.attr('number'),
  tileSize: DS.attr('number'),
  subdomains: DS.attr('string'),
  errorTileUrl: DS.attr('string'),
  attribution: DS.attr('string'),
  tms: DS.attr('boolean'),
  continuousWorld: DS.attr('boolean'),
  noWrap: DS.attr('boolean'),
  zoomOffset: DS.attr('number'),
  zoomReverse: DS.attr('boolean'),
  opacity: DS.attr('number'),
  zIndex: DS.attr('number'),
  unloadInvisibleTiles: DS.attr('boolean'),
  updateWhenIdle: DS.attr('boolean'),
  detectRetina: DS.attr('boolean'),
  reuseTiles: DS.attr('boolean'),
  bounds: DS.attr('string'),

  validations: {
    url: { presence: true },
    minZoom: { numericality: { allowBlank: true, onlyInteger: true, greaterThanOrEqualTo: 0 } },
    maxZoom: { numericality: { allowBlank: true, onlyInteger: true, greaterThanOrEqualTo: 0 } },
    maxNativeZoom: { numericality: { allowBlank: true, onlyInteger: true, greaterThanOrEqualTo: 0 } },
    tileSize: { numericality: { allowBlank: true, onlyInteger: true, greaterThanOrEqualTo: 0 } },
    zoomOffset: { numericality: { allowBlank: true, onlyInteger: true, greaterThanOrEqualTo: 0 } },
    opacity: { numericality: { allowBlank: true, greaterThanOrEqualTo: 0 } }
  }
});

export default Model;
