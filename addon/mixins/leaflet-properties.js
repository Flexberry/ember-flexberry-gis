import Ember from 'ember';

export default Ember.Mixin.create({

  leafletProperties: null,

  _addObservers() {
    this._observers = {};
    let layer = this.get('_layer');
    let properties = this.get('leafletProperties') || [];
    properties.forEach(propExp => {

      let [property, leafletProperty, ...params] = propExp.split(':');
      if (!leafletProperty) { leafletProperty = 'set' + Ember.String.classify(property); }
      let objectProperty = property.replace(/\.\[]/, ''); //allow usage of .[] to observe array changes

      this._observers[property] = function () {
        let value = this.get(objectProperty);
        Ember.assert(this.constructor + ' must have a ' + leafletProperty + ' function.', !!layer[leafletProperty]);
        let propertyParams = params.map(p => this.get(p));
        layer[leafletProperty].call(layer, value, ...propertyParams);
      };

      this.addObserver(property, this, this._observers[property]);
    });
  },

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

  willDestroyElement() {
    this._super(...arguments);
    this._removeObservers();
  }
});
