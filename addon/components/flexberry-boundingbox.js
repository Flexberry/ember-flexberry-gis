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

          @property minLng
          @type number
        */
  minLng: undefined,

  /**
      Maximal longitude value.

      @property maxLng
      @type number
    */
  maxLng: undefined,

  /**
    Moves areaSelect and map according to given bounds.

    @method _updateBounds
    @private
  */
  _updateBounds() {
    let minLat = this.minLat;
    let minLng = this.minLng;
    let maxLat = this.maxLat;
    let maxLng = this.maxLng;
    let leafletMap = this.get('leafletMap');
    let areaSelect = this.get('areaSelect');

    let coords = L.latLng((maxLat + minLat) / 2, (maxLng + minLng) / 2);
    leafletMap.panTo(coords);

    leafletMap.fitBounds(L.latLngBounds(L.latLng(minLat, minLng), L.latLng(maxLat, maxLng)));
    let newWidth = Math.abs(leafletMap.latLngToLayerPoint(L.latLng(minLat, maxLng)).x) - Math.abs(leafletMap.latLngToLayerPoint(L.latLng(minLat, minLng)).x);
    let newHeight = Math.abs(leafletMap.latLngToLayerPoint(L.latLng(maxLat, minLng)).y) - Math.abs(leafletMap.latLngToLayerPoint(L.latLng(minLat, minLng)).y);
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

    Ember.set(this, 'minLngValue', bounds.getWest());
    this.minLng = Number(bounds.getWest());

    Ember.set(this, 'maxLngValue', bounds.getEast());
    this.maxLng = Number(bounds.getEast());

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
      if (this.maxLng === undefined && this.minLng === undefined && this.maxLat === undefined && this.minLat === undefined)
      {
        let bounds = areaSelect.getBounds();
        this.set('areaSelect', areaSelect);

        this.set('maxLngValue', bounds.getEast());
        this.maxLng = Number(bounds.getEast());

        this.set('minLngValue', bounds.getWest());
        this.minLng = Number(bounds.getWest());

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

        if (this.minLng < -180 || this.minLng > 180) {
          throw 'Incorrect minimal longitude value: should be [-180;180]';
        }

        if (this.maxLng < -180 || this.maxLng > 180) {
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

    if (this.get('minLngValue') < -180) {flag = true;}

    if (this.get('minLngValue') > 180) {flag = true;}

    if (this.get('maxLngValue') < -180) {flag = true;}

    if (this.get('maxLngValue') > 180) {flag = true;}

    if (this.get('minLatValue') === '') {flag = true;}

    if (this.get('maxLatValue') === '') {flag = true;}

    if (this.get('minLngValue') === '') {flag = true;}

    if (this.get('maxLngValue') === '') {flag = true;}

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
  /**
  Observes is latitude values are changed.

  @method actions.latInputChange
*/
  latInputChanged: Ember.observer('minLatValue', 'maxLatValue', function() {
    this._validateInputs();
    if (this.get('minLatValue') < -90 || this.get('minLatValue') > 90) {
      this.set('minLatClass', 'error');
      return;
    }

    if (this.get('maxLatValue') < -90 || this.get('maxLatValue') > 90) {
      this.set('maxLatClass', 'error');
      return;
    }

    this.set('maxLatClass', '');
    this.set('minLatClass', '');
  }),

  /**
  Observes if longitude values are changed.

  @method actions.lngInputChange
*/
  lngInputChanged: Ember.observer('minLngValue', 'maxLngValue', function() {
    this._validateInputs();
    if (this.get('maxLngValue') < -180 || this.get('maxLngValue') > 180) {
      Ember.set(this, 'maxLngClass', 'error');
      return;
    }

    if (this.get('minLngValue') < -180 || this.get('minLngValue') > 180) {
      Ember.set(this, 'minLngClass', 'error');
      return;
    }

    this.set('minLngClass', '');
    this.set('maxLngClass', '');
  }),

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

      if (this.get('maxLngValue') < this.get('minLngValue')) {
        let s = Number(this.get('maxLngValue'));
        this.set('maxLngValue', Number(this.get('minLngValue')));
        this.set('minLngValue', s);
      }

      this.maxLat = Number(this.get('maxLatValue'));
      this.minLat = Number(this.get('minLatValue'));
      this.maxLng = Number(this.get('maxLngValue'));
      this.minLng = Number(this.get('minLngValue'));

      this._updateBounds();
      this.set('readonly', true);
    },
  },
});
