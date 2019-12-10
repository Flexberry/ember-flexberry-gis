/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin containing handlers for
  {{#crossLink "FlexberryMapComponent"}}flexberry-map component's{{/crossLink}} actions.

  @class FlexberryMapActionsHandlerMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  actions: {
    /**
      Handles {{#crossLink "FlexberryMapComponent/sendingActions.leafletInit:method"}}flexberry-map component's 'leafletInit' action{{/crossLink}}.
      It stores value of action's event object 'map' property in property with given path.

      @method actions.onMapInit
      @param {String} mutablePropertyPath Path to a property, which value must be mutated on action.
      @param {Object} e Action's event object.
      @param {Object} e.map Initialized [Leaflet map](http://leafletjs.com/reference-1.0.0.html#map).

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-map
          lat=model.lat
          lng=model.lng
          zoom=model.zoom
          leafletInit=(action "onMapLeafletInit" "leafletMap")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMapActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-map-actions-handler';

        export default Ember.Controller.extend(FlexberryMapActionsHandlerMixin, {
          // Property where leaflet map will be stored after init.
          leafletMap: null
        });
      ```
    */
    onMapLeafletInit(...args) {
      // User can pass any additional arguments to action handler,
      // so original action's event object will be the last one in arguments array.
      let leafletMapPropertyPath = args[0];
      let e = args[args.length - 1];

      Ember.assert(
        `Wrong type of \`leafletMapPropertyPath\` argument: actual type is \`${leafletMapPropertyPath}\`, ` +
        `but \`string\` is expected`,
        Ember.typeOf(leafletMapPropertyPath) === 'string');

      Ember.set(this, leafletMapPropertyPath, e.map);
      Ember.set(window, leafletMapPropertyPath, e.map);
    },

    onServiceLayerInit(property, serviceLayer) {
      this.set(property, serviceLayer);
    },

    /**
      Handles {{#crossLink "FlexberryMapComponent/sendingActions.leafletDestroy:method"}}flexberry-map component's 'leafletDestroy' action{{/crossLink}}.
      It cleans up previously stored leaflet map.

      @method actions.onMapLeafletDestroy
      @param {String} leafletMapPropertyPath Path to a previously stored leaflet map, which must be cleaned up on action.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-map
          lat=model.lat
          lng=model.lng
          zoom=model.zoom
          leafletInit=(action "onMapLeafletInit" "leafletMap")
          leafletDestroy=(action "onMapLeafletDestroy" "leafletMap")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMapActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-map-actions-handler';

        export default Ember.Controller.extend(FlexberryMapActionsHandlerMixin, {
          // Property where leaflet map will be stored after init.
          leafletMap: null
        });
      ```
    */
    onMapLeafletDestroy(...args) {
      let leafletMapPropertyPath = args[0];
      Ember.assert(
        `Wrong type of \`leafletMapPropertyPath\` argument: actual type is \`${Ember.typeOf(leafletMapPropertyPath)}\`, ` +
        `but \`string\` is expected`,
        Ember.typeOf(leafletMapPropertyPath) === 'string');

      Ember.set(this, leafletMapPropertyPath, null);
      Ember.set(window, leafletMapPropertyPath, null);
    },

    /**
      Handles {{#crossLink "FlexberryMapComponent/sendingActions.moveend:method"}}flexberry-map component's 'moveend' action{{/crossLink}}.
      It mutates values of lat, lng properties with given names to values of new map center.

      @method actions.onMapMoveend
      @param {String} latPropertyPath Path to a property, containing map center lat.
      @param {String} lngPropertyPath Path to a property, containing map center lng.
      @param {Object} e Action's event object.
      @param {Object} e.taget [Leaflet map](http://leafletjs.com/reference-1.0.0.html#map).

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-map
          lat=model.lat
          lng=model.lng
          zoom=model.zoom
          leafletInit=(action "onMapLeafletInit" "leafletMap")
          moveend=(action "onMapMoveend" "model.lat" "model.lng")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMapActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-map-actions-handler';

        export default Ember.Controller.extend(FlexberryMapActionsHandlerMixin, {
          // Property where leaflet map will be stored after init.
          leafletMap: null
        });
      ```
    */
    onMapMoveend(...args) {
      // User can pass any additional arguments to action handler,
      // so original action's event object will be the last one in arguments array.
      let latPropertyPath = args[0];
      let lngPropertyPath = args[1];
      let e = args[args.length - 1];

      Ember.assert(
        `Wrong type of \`latPropertyPath\` argument: actual type is \`${Ember.typeOf(latPropertyPath)}\`, ` +
        `but \`string\` is expected`,
        Ember.typeOf(latPropertyPath) === 'string');
      Ember.assert(
        `Wrong type of \`lngPropertyPath\` argument: actual type is \`${Ember.typeOf(lngPropertyPath)}\`, ` +
        `but \`string\` is expected`,
        Ember.typeOf(lngPropertyPath) === 'string');

      let newCenterLatLng = e.target.getCenter();
      this.transitionToRoute({ queryParams: { lat: newCenterLatLng.lat, lng: newCenterLatLng.lng, zoom: e.target.getZoom() } });
    },

    /**
      Handles {{#crossLink "FlexberryMapComponent/sendingActions.zoomend:method"}}flexberry-map component's 'zoomend' action{{/crossLink}}.
      It mutates value of zoom property with given name to value of new map zoom.

      @method actions.onMapZoomend
      @param {String} zoomPropertyPath Path to a property, containing map zoom.
      @param {Object} e Action's event object.
      @param {Object} e.taget [Leaflet map](http://leafletjs.com/reference-1.0.0.html#map).

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-map
          lat=model.lat
          lng=model.lng
          zoom=model.zoom
          leafletInit=(action "onMapLeafletInit" "leafletMap")
          mzoomend=(action "onMapZoomend" "model.zoom")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMapActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-map-actions-handler';

        export default Ember.Controller.extend(FlexberryMapActionsHandlerMixin, {
          // Property where leaflet map will be stored after init.
          leafletMap: null
        });
      ```
    */
    onMapZoomend(...args) {
      // User can pass any additional arguments to action handler,
      // so original action's event object will be the last one in arguments array.
      let zoomPropertyPath = args[0];
      let e = args[args.length - 1];

      Ember.assert(
        `Wrong type of \`zoomPropertyPath\` argument: actual type is \`${Ember.typeOf(zoomPropertyPath)}\`, ` +
        `but \`string\` is expected`,
        Ember.typeOf(zoomPropertyPath) === 'string');

      let newZoom = e.target.getZoom();
      this.transitionToRoute({ queryParams: { zoom: newZoom } });
    }
  }
});
