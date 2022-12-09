import Ember from 'ember';
import layout from '../templates/components/favorites-list';
import LeafletZoomToFeatureMixin from '../mixins/leaflet-zoom-to-feature';
export default Ember.Component.extend(LeafletZoomToFeatureMixin, {

  /**
    Reference to component's template.
  */
  layout,

  /**
    Array contains identification result features and layerModels.

    @property features
    @type Array
    @default Ember.A()
  */
  features: Ember.A(),

  /**
    Array contains identification result features and layerModels.

    @property features
    @type Array
    @default null
  */
  data: null,

  /**
    Flag indicates if comapre button disabled.
    @property compareBtnDisabled
    @type Boolean
    @default true
  */
  compareBtnDisabled: true,

  onTwoObjectsChange: Ember.observer('features.[]', function () {
    this.set('data', this.get('features'));
  }),

  actions: {
    /**
      Clear selected features from map

      @method actions.clear
    */
    clear() {
      this.sendAction('clear');
    },

    /**
      Action adds feature to favorites.

      @method actions.addToFavorite
      @param feature
    */
    addToFavorite(feature) {
      this.sendAction('addToFavorite', feature);
    },

    /**
      Action open compare geometries panel.

      @method actions.compareTwoGeometries
    */
    compareTwoGeometries() {
      this.sendAction('compareTwoGeometries', 'open');
    },

    /**
      Action handles click on checkbox.

      @method actions.addToCompareGeometries
      @param feature
    */
    addToCompareGeometries(feature) {
      this.sendAction('addToCompareGeometries', feature);
    },

    /**
      Action hadles click on intersection icon.

      @method showIntersectionPanel
      @param feature
    */
    showIntersectionPanel(feature) {
      this.sendAction('showIntersectionPanel', feature);
    }
  }
});
