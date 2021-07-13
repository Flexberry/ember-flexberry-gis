/**
  @module ember-flexberry
*/

import Ember from 'ember';

/**
  Configures a <a href="https://github.com/Flexberry/Leaflet.Editable.Measures">Leaflet.Editable.Measures</a> i18n.
  Binds it's locales to <a href="https://github.com/jamesarosen/ember-i18n/wiki/Doc:-Setting-the-Locale">current i18n.locale</a>.

  @for ApplicationInstanceInitializer
  @method leafletEditableMeasures.initialize
  @param {<a href="http://emberjs.com/api/classes/Ember.ApplicationInstance.html">Ember.ApplicationInstance</a>} applicationInstance Ember application instance.
*/
export function initialize(applicationInstance) {
  let i18n = applicationInstance.lookup('service:i18n');

  let changeLeafletEditableMeasuresLocales = function() {
    // Measure coordinates tool.
    L.Measure.MarkerBase.prototype.popupText.move = i18n.t('map-tools.measure.measure-coordinates.move').toString();
    L.Measure.MarkerBase.prototype.popupText.drag = i18n.t('map-tools.measure.measure-coordinates.drag').toString();
    L.Measure.MarkerBase.prototype.basePopupText.labelPrefix = i18n.t('map-tools.measure.measure-coordinates.labelPrefix').toString();
    L.Measure.MarkerBase.prototype.basePopupText.labelPostfix = i18n.t('map-tools.measure.measure-coordinates.labelPostfix').toString();
    L.Measure.MarkerBase.prototype.basePopupText.northLatitude = i18n.t('map-tools.measure.measure-coordinates.northLatitude').toString();
    L.Measure.MarkerBase.prototype.basePopupText.southLatitude = i18n.t('map-tools.measure.measure-coordinates.southLatitude').toString();
    L.Measure.MarkerBase.prototype.basePopupText.eastLongitude = i18n.t('map-tools.measure.measure-coordinates.eastLongitude').toString();
    L.Measure.MarkerBase.prototype.basePopupText.westLongitude = i18n.t('map-tools.measure.measure-coordinates.westLongitude').toString();

    // Measure distance tool.
    L.Measure.PolylineBase.prototype.popupText.move = i18n.t('map-tools.measure.measure-distance.move').toString();
    L.Measure.PolylineBase.prototype.popupText.drag = i18n.t('map-tools.measure.measure-distance.drag').toString();
    L.Measure.PolylineBase.prototype.popupText.add = i18n.t('map-tools.measure.measure-distance.add').toString();
    L.Measure.PolylineBase.prototype.popupText.commit = i18n.t('map-tools.measure.measure-distance.commit').toString();
    L.Measure.PolylineBase.prototype.basePopupText.distanceLabelPrefix = i18n.t('map-tools.measure.measure-distance.distanceLabelPrefix').toString();
    L.Measure.PolylineBase.prototype.basePopupText.distanceLabelPostfix = i18n.t('map-tools.measure.measure-distance.distanceLabelPostfix').toString();
    L.Measure.PolylineBase.prototype.basePopupText.incLabelPrefix = i18n.t('map-tools.measure.measure-distance.incLabelPrefix').toString();
    L.Measure.PolylineBase.prototype.basePopupText.incLabelPostfix = i18n.t('map-tools.measure.measure-distance.incLabelPostfix').toString();
    L.Measure.PolylineBase.prototype.distanceMeasureUnit.kilometer = i18n.t('map-tools.measure.measure-units.kilometer').toString();
    L.Measure.PolylineBase.prototype.distanceMeasureUnit.meter = i18n.t('map-tools.measure.measure-units.meter').toString();

    // Measure radius tool.
    L.Measure.CircleBase.prototype.popupText.move = i18n.t('map-tools.measure.measure-radius.move').toString();
    L.Measure.CircleBase.prototype.popupText.drag = i18n.t('map-tools.measure.measure-radius.drag').toString();
    L.Measure.CircleBase.prototype.basePopupText.labelPrefix = i18n.t('map-tools.measure.measure-radius.labelPrefix').toString();
    L.Measure.CircleBase.prototype.basePopupText.labelPostfix = i18n.t('map-tools.measure.measure-radius.labelPostfix').toString();
    L.Measure.CircleBase.prototype.distanceMeasureUnit.kilometer = i18n.t('map-tools.measure.measure-units.kilometer').toString();
    L.Measure.CircleBase.prototype.distanceMeasureUnit.meter = i18n.t('map-tools.measure.measure-units.meter').toString();

    // Measure area tool.
    L.Measure.PolygonBase.prototype.popupText.move = i18n.t('map-tools.measure.measure-area.move').toString();
    L.Measure.PolygonBase.prototype.popupText.drag = i18n.t('map-tools.measure.measure-area.drag').toString();
    L.Measure.PolygonBase.prototype.popupText.add = i18n.t('map-tools.measure.measure-area.add').toString();
    L.Measure.PolygonBase.prototype.popupText.commit = i18n.t('map-tools.measure.measure-area.commit').toString();
    L.Measure.PolygonBase.prototype.basePopupText.labelPrefix = i18n.t('map-tools.measure.measure-area.labelPrefix').toString();
    L.Measure.PolygonBase.prototype.basePopupText.labelPostfix = i18n.t('map-tools.measure.measure-area.labelPostfix').toString();
    L.Measure.PolygonBase.prototype.basePopupText.perimeterLabelPrefix = i18n.t('map-tools.measure.measure-perimeter.labelPrefix').toString();
    L.Measure.PolygonBase.prototype.basePopupText.perimeterLabelPostfix = i18n.t('map-tools.measure.measure-perimeter.labelPostfix').toString();
    L.Measure.PolygonBase.prototype.basePopupText.distanceLabelPrefix = i18n.t('map-tools.measure.measure-distance.distanceLabelPrefix').toString();
    L.Measure.PolygonBase.prototype.basePopupText.distanceLabelPostfix = i18n.t('map-tools.measure.measure-distance.distanceLabelPostfix').toString();
    L.Measure.PolygonBase.prototype.basePopupText.incLabelPrefix = i18n.t('map-tools.measure.measure-distance.incLabelPrefix').toString();
    L.Measure.PolygonBase.prototype.basePopupText.incLabelPostfix = i18n.t('map-tools.measure.measure-distance.incLabelPostfix').toString();
    L.Measure.PolygonBase.prototype.distanceMeasureUnit.kilometer = i18n.t('map-tools.measure.measure-units.kilometer').toString();
    L.Measure.PolygonBase.prototype.distanceMeasureUnit.meter = i18n.t('map-tools.measure.measure-units.meter').toString();
  };

  // Initialize locales and change it every time i18n.locale changes.
  changeLeafletEditableMeasuresLocales();
  Ember.addObserver(i18n, 'locale', changeLeafletEditableMeasuresLocales);
}

export default {
  after: 'i18n',
  name: 'leaflet-editable-measures',
  initialize
};
