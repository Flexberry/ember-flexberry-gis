/**
  @module ember-flexberry-gis
*/

import EditFormRoute from 'ember-flexberry/routes/edit-form';
import MapLayersLoaderMixin from '../mixins/map-layers-loader';
import { Query } from 'ember-flexberry-data';

/**
  Edit map route.
  Loads map project & related layers hierarchy.

  @class MapRoute
  @extends EditFormRoute
  @uses MapLayersLoaderMixin
*/
export default EditFormRoute.extend(MapLayersLoaderMixin, {
  queryParams: {
    setting: {
      refreshModel: false,
      replace: false,
      as: 'setting'
    },
    geofilter: {
      refreshModel: false,
      replace: false,
      as: 'geofilter'
    }
  },

  /**
    Name of model to be used for load LayerLinks by setting query parameters
   */
  layerLinkModelName: 'new-platform-flexberry-g-i-s-layer-link',

  /**
    Name of model projection to be used for load LayerLinks by setting query parameters
   */
  layerLinkProjection: 'LayerLinkD',

  /**
    Name of model projection to be used as record's properties limitation.

    @property modelProjection
    @type String
    @default 'MapE'
  */
  modelProjection: 'MapE',

  /**
    Name of model to be used as form's record type.

    @property modelName
    @type String
    @default 'new-platform-flexberry-g-i-s-map'
  */
  modelName: 'new-platform-flexberry-g-i-s-map',

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
    Loads available CSW connections.

    @method loadCswConnections
    @return {<a href="http://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>}
    Promise which will return available CSW connections after it will be resolved.
  */
  loadCswConnections() {
    let store = this.get('store');
    let modelName = this.get('cswConnectionModelName');
    let query = new Query.Builder(store)
      .from(modelName)
      .selectByProjection(this.get('cswConnectionProjection'));

    return store.query(modelName, query.build()).then((cswConnections) => {
      this.set('cswConnections', cswConnections.toArray());
    });
  },

  /**
    [Model hook](http://emberjs.com/api/classes/Ember.Route.html#method_model) that returns a map project for current route.

    @method model
    @param {Object} params
    @param {Object} transition
    @return {<a href="http://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>}
    Promise which will return map project related to current route & it's layers hierarchy.
  */
  model(params) {
    let mapPromise = this.loadMapLayers(this._super(...arguments));

    let layerLinkModelName = this.get('layerLinkModelName');
    let query =
      new Query.Builder(this.store)
        .from(layerLinkModelName)
        .selectByProjection(this.get('layerLinkProjection'))
        .where('mapObjectSetting', Query.FilterOperator.Eq, params.setting || null);

    return this.store
      .query(layerLinkModelName, query.build())
      .then(layerLinks => {
        this.set('layerLinks', layerLinks);
      }).then(() => {
        this.loadCswConnections();
      })
      .then(() => {
        return this.loadMapLayers(mapPromise);
      });
  },

  setupController(controller) {
    this._super(...arguments);
    controller.set('layerLinks', this.get('layerLinks'));
    controller.set('cswConnections', this.get('cswConnections'));
  }
});
