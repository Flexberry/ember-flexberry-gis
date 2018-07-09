import Ember from 'ember';
import FeatureResultItemComponent from './feature-result-item';
import layout from '../templates/components/feature-result-item-wfs';

/**
  Component for display feature details geo object from `WFS` layers.

  @class FeatureResultItemWfsComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default FeatureResultItemComponent.extend({
  layout,

  /**
    Clipboard service.

    @property clipboard
    @type GeoObjectsClipboardService
  */
  clipboard: Ember.inject.service('geo-objects-clipboard'),

  actions: {
    /**
      Copy this feature to clipboard.

      @method actions.copy
    */
    copy() {
      this.get('clipboard').copy(this.get('feature'));
    },

    /**
      Cut this feature to clipboard.

      @method actions.cut
    */
    cut() {
      this.get('clipboard').cut(this.get('feature'));
    },
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.get('clipboard').on('paste', this, this._paste);
  },

  /**
    Destroys component.
  */
  willDestroy() {
    this._super(...arguments);
    this.get('clipboard').off('paste', this, this._paste);
  },

  /**
    Handles the insertion of a previously cut object.

    @private
    @method _paste
    @param {Object} geoObject The geo object that was pasted.
  */
  _paste(geoObject) {
    if (this.get('feature') === geoObject) {
      throw new Error('Not implemented.');
    }
  },
});
