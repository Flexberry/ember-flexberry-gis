/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import {
  Query
} from 'ember-flexberry-data';

/**
  Mixin thats load data for use in add layers dialog by CSW settings.

  @class MapRouteCswLoaderMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  /**
  Name of CSW connection model projection to be used as record's properties limitation.

  @property cswConnectionProjection
  @type String
  @default 'MapE'
*/
  cswConnectionProjection: 'CswConnectionE',

  /**
    Name of CSW connection model to be used as form's record type.

    @property modelName
    @type String
    @default 'new-platform-flexberry-g-i-s-csw-connection'
  */
  cswConnectionModelName: 'new-platform-flexberry-g-i-s-csw-connection',

  /**
    Loaded CSW connections.

    @property cswConnections
    @type Object[]
    @default null
  */
  cswConnections: null,

  /**
    [Model hook](http://emberjs.com/api/classes/Ember.Route.html#method_model) that returns a map project for current route.

    @method model
    @param {Object} params
    @param {Object} transition
    @return {<a href="http://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>}
    Promise which will return map project related to current route
  */
  model(params) {
    this._loadCswConnections(params);
    return this._super(...arguments);
  },

  /**
   Setups controller for the current route.
   [More info](http://emberjs.com/api/classes/Ember.Route.html#method_setupController).

   @method setupController
   @param {Ember.Controller} controller
   @param {Object} model
 */
  setupController(controller, model) {
    this._super(...arguments);
    controller.set('cswConnections', this.get('cswConnections'));
  },

  /**
    Loads available CSW connections.

    @method loadCswConnections
    @param {Object} params Query parameters.
    @return {<a href="http://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>}
    Promise which will return available CSW connections after it will be resolved.
    @private
  */
  _loadCswConnections(params) {
    let store = this.get('store');
    let modelName = this.get('cswConnectionModelName');

    let query = new Query.Builder(store)
      .from(modelName)
      .selectByProjection(this.get('cswConnectionProjection'));

    return store.query(modelName, query.build()).then((cswConnections) => {
      this.set('cswConnections', cswConnections.toArray());
    });
  },
});
