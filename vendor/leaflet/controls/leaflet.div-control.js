L.Control.Div = L.Control.extend({
  initialize: function(element, options) {
    L.Control.prototype.initialize.call(this, options);
    this._container = element || L.DomUtil.create('div', '');

    if(this.options.disableClickPropagation) {
      L.DomEvent.disableClickPropagation(this._container);
    }

    if(this.options.disableScrollPropagation) {
      L.DomEvent.disableScrollPropagation(this._container);
    }
  },

  onAdd: function (map) {
    return this._container;
  },

  appendContent: function(domElement) {
    this._container.appendChild(domElement);
  }
});
