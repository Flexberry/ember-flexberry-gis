/**
  @module ember-flexberry-gis
 */

import Ember from 'ember';

/**
  Mixin for use observable properties with corresponding leaflet objects

  Each element of leafletProperties property contains following parts divided by ":":
    -this object property name
    -leaflet object method for react on property (may be ommited, then be used "set"+PropertyName method)
    -this object other properties thats needs to pass to leaflet object method

  @example
    ```js
    import LeafletPropertiesMixin from 'ember-flexberry-gis/mixins/leaflet-properties';

    export default Ember.Component.extend(LeafletPropertiesMixin, {
      leafletProperties: ["center:panTo:zoomPanOptions", "zoom"],

      init() {
        this._addObservers();
      }
    })
    ```
  @class LeafletPropertiesMixin
  @uses <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
 */
export default Ember.Mixin.create({
  /**
    Array of properties, thats should be observe by leaflet object specified method.
    @property leafletProperties
    @type Array
    @defaul null
   */
  leafletProperties: null,

  /**
    Method for add observers for all specified properties
    @method _addObservers
   */
  _addObservers() {
    this._observers = {};
    let properties = this.get('leafletProperties') || [];
    properties.forEach(propExp => {

      let [property, leafletProperty, ...params] = propExp.split(':');

      if (!leafletProperty) { leafletProperty = 'set' + Ember.String.classify(property); }

      let objectProperty = property.replace(/\.\[]/, ''); //allow usage of .[] to observe array changes

      this._observers[property] = () => {
        Ember.run.once(() => {
          let leafletObject = this.get('_leafletObject');
          if (Ember.isNone(leafletObject)) {
            return;
          }

          let value = this.get(objectProperty);
          Ember.assert(this.constructor + ' must have a ' + leafletProperty + ' function.', !!leafletObject[leafletProperty]);
          let propertyParams = params.map(p => this.get(p));
          leafletObject[leafletProperty].call(leafletObject, value, ...propertyParams);
        });
      };

      this.addObserver(property, this, this._observers[property]);
    });
  },

  /**
    Method for remove created observers
    @method _removeObservers
   */
  _removeObservers() {
    if (this._observers) {
      let properties = this.get('leafletProperties') || [];
      properties.forEach(propExp => {

        let [property] = propExp.split(':');

        this.removeObserver(property, this, this._observers[property]);
        delete this._observers[property];
      });
    }
  },

  didInsertElement() {
    this._super(...arguments);
    this._addObservers();
  },

  willDestroyElement() {
    this._super(...arguments);
    this._removeObservers();
  }
});
