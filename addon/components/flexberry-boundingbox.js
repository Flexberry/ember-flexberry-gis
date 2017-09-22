/**
  Flexberry map component.
  Wraps [leaflet-areaselect](https://github.com/heyman/leaflet-areaselect/) into ember component.

  @class flexberry-boundingbox
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses FlexberryMapActionsHandlerMixin
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-boundingbox';
import FlexberryMapActionsHandlerMixin from '../mixins/flexberry-map-actions-handler';

export default Ember.Component.extend(
  FlexberryMapActionsHandlerMixin, {
  /**
      Reference to component's template.
  */
  layout,

  /**
    Leaflet map.
    @property leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  leafletMap: null,

  /**
      Minimal latitude value.

      @property minLat
      @type number
    */
  minLat: undefined,

  /**
      Maximal latitude value.

        @property maxLat
        @type number
      */
  maxLat: undefined,

  /**
          Minimal longitude value.

          @property minLgt
          @type number
        */
  minLgt: undefined,

  /**
      Maximal longitude value.

      @property maxLgt
      @type number
    */
  maxLgt: undefined,

  /**
    Moves areaSelect and map according to given bounds.

    @method _updateBounds
    @private
  */
  _updateBounds() {
    let minLat = this.minLat;
    let minLgt = this.minLgt;
    let maxLat = this.maxLat;
    let maxLgt = this.maxLgt;
    let leafletMap = this.get('leafletMap');
    let areaSelect = this.get('areaSelect');

    let coords = L.latLng((maxLat + minLat) / 2, (maxLgt + minLgt) / 2);
    leafletMap.panTo(coords);

    leafletMap.fitBounds(L.latLngBounds(L.latLng(minLat, minLgt), L.latLng(maxLat, maxLgt)));
    let newWidth = Math.abs(leafletMap.latLngToLayerPoint(L.latLng(minLat, maxLgt)).x) - Math.abs(leafletMap.latLngToLayerPoint(L.latLng(minLat, minLgt)).x);
    let newHeight = Math.abs(leafletMap.latLngToLayerPoint(L.latLng(maxLat, minLgt)).y) - Math.abs(leafletMap.latLngToLayerPoint(L.latLng(minLat, minLgt)).y);
    newWidth = Math.abs(newWidth);
    newHeight = Math.abs(newHeight);
    areaSelect.setDimensions({ width: newWidth, height: newHeight });
  },
  /**
    Actions made when areaSelect.on('change') fires.

    @method areaSelectChanged
  */
  areaSelectChanged() {
    let areaSelect = this.get('areaSelect');
    let bounds = areaSelect.getBounds();

    Ember.set(this, 'minLgtValue', bounds.getWest());
    this.minLgt = Number(bounds.getWest());

    Ember.set(this, 'maxLgtValue', bounds.getEast());
    this.maxLgt = Number(bounds.getEast());

    Ember.set(this, 'minLatValue', bounds.getSouth());
    this.minLat = Number(bounds.getSouth());

    Ember.set(this, 'maxLatValue', bounds.getNorth());
    this.maxLat = Number(bounds.getNorth());
    this.sendAction('boundingBoxChange', bounds);
  },

  /**
    Observes changes in reference to leaflet map.
    Initializes area select plugin.

    @method _leafletMapDidChange
    @private
  */
  _leafletMapDidChange: Ember.on('init', Ember.observer('leafletMap', function() {
      let leafletMap = this.get('leafletMap');

      if (Ember.isNone(leafletMap)) {
        return;
      }

      this.set('readonly', true);
      let areaSelect = L.areaSelect({ width: 100, height: 100 });
      areaSelect.addTo(leafletMap);
      if (this.maxLgt === undefined && this.minLgt === undefined && this.maxLat === undefined && this.minLat === undefined)
      {
        let bounds = areaSelect.getBounds();
        this.set('areaSelect', areaSelect);

        this.set('maxLgtValue', bounds.getEast());
        this.maxLgt = Number(bounds.getEast());

        this.set('minLgtValue', bounds.getWest());
        this.minLgt = Number(bounds.getWest());

        this.set('maxLatValue', bounds.getNorth());
        this.maxLat = Number(bounds.getNorth());

        this.set('minLatValue', bounds.getSouth());
        this.minLat = Number(bounds.getSouth());
      } else
      {
        if (this.minLat < -90 || this.minLat > 90) {
          throw 'Incorrect minimal latitude value: should be [-90;90]';
        }

        if (this.maxLat < -90 || this.maxLat > 90) {
          throw 'Incorrect maximal latitude value: should be [-90;90]';
        }

        if (this.minLgt < -180 || this.minLgt > 180) {
          throw 'Incorrect minimal longitude value: should be [-180;180]';
        }

        if (this.maxLgt < -180 || this.maxLgt > 180) {
          throw 'Incorrect maximal longitude value: should be [-180;180]';
        }

        this._updateBounds();
      }

      areaSelect.on('change', this.areaSelectChanged, this);
    })),

  /**
    Validates input fields and blocks/unblocks bounds.

    @method _validateInputs
    @private
  */
  _validateInputs() {
    let flag = false;
    if (this.get('minLatValue') < -90) {flag = true;}

    if (this.get('minLatValue') > 90) { flag = true;}

    if (this.get('maxLatValue') < -90) {flag = true;}

    if (this.get('maxLatValue') > 90) {flag = true;}

    if (this.get('minLgtValue') < -180) {flag = true;}

    if (this.get('minLgtValue') > 180) {flag = true;}

    if (this.get('maxLgtValue') < -180) {flag = true;}

    if (this.get('maxLgtValue') > 180) {flag = true;}

    this.set('readonly', flag);
    return;
  },

  /**
       Destroys DOM-related component's properties.
   */
  willDestroyElement() {
    this._super(...arguments);

    let leafletMap = this.get('leafletMap');
    if (Ember.isNone(leafletMap)) {
      return;
    }

    // Destroy leaflet map.
    this._removeMapLoaderMethods(leafletMap);
    leafletMap.off('change', this.areaSelectChanged, this);
    leafletMap.remove();
    this.set('leafletMap', null);

    this.sendAction('leafletDestroy');
  },

  actions: {
    /**
    This action is called when change borders button is pressed.

    @method actions.onButtonClick
  */
    onButtonClick() {
      if (this.get('maxLatValue') < this.get('minLatValue')) {
        let s = Number(this.get('maxLatValue'));
        this.set('maxLatValue', Number(this.get('minLatValue')));
        this.set('minLatValue', s);
      }

      if (this.get('maxLgtValue') < this.get('minLgtValue')) {
        let s = Number(this.get('maxLgtValue'));
        this.set('maxLgtValue', Number(this.get('minLgtValue')));
        this.set('minLgtValue', s);
      }

      this.maxLat = Number(this.get('maxLatValue'));
      this.minLat = Number(this.get('minLatValue'));
      this.maxLgt = Number(this.get('maxLgtValue'));
      this.minLgt = Number(this.get('minLgtValue'));

      this._updateBounds();
      this.set('readonly', true);
    },

    /**
    This action is called when latitude values are changed.

    @method actions.latInputChange
  */
    latInputChange(e) {

      this._validateInputs();
      if (this.get('minLatValue') < -90 || this.get('minLatValue') > 90) {
        this.set('minLatClass', 'error');
        return;
      }

      if (this.get('maxLatValue') < -90 || this.get('maxLatValue') > 90) {
        this.set('maxLatClass', 'error');
        return;
      }

      this.set('minLatClass', '');
    },

    /**
    This action is called when longitude values are changed.

    @method actions.lngInputChange
  */
    lngInputChange(e) {
      this._validateInputs();
      if (this.get('maxLgtValue') < -180 || this.get('maxLgtValue') > 180) {
        Ember.set(this, 'maxLgtClass', 'error');
        return;
      }

      if (this.get('minLgtValue') < -180 || this.get('minLgtValue') > 180) {
        Ember.set(this, 'minLgtClass', 'error');
        return;
      }

      this.set('minLatClass', '');
    },
  },
});
