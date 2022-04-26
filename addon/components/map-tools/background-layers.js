import { isNone } from '@ember/utils';
import $ from 'jquery';
import { observer, get, set } from '@ember/object';
import { A } from '@ember/array';
import Component from '@ember/component';
import { translationMacro as t } from 'ember-i18n';
import layout from '../../templates/components/map-tools/background-layers';

const flexberryClassNamesPrefix = 'flexberry-background-map-tool';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  div: `${flexberryClassNamesPrefix}-div`,
};

export default Component.extend({
  layout,

  /**
    Reference to component's CSS-classes names.
    Must be also a component's instance property to be available from component's .hbs template.
  */
  flexberryClassNames,

  /**
    Overridden ['tagName'](http://emberjs.com/api/classes/Ember.Component.html#property_tagName)
    to disable a component's wrapping element.

    @property tagName
    @type String
    @default ''
  */
  tagName: '',

  /**
    Map tool's caption.

    @property caption
    @type String
    @default t('components.map-tools.comapre-layers.caption')
  */
  caption: t('components.map-tools.background-layers.caption'),

  /**
    Map tool's tooltip text.
    Will be added as wrapper's element 'title' attribute.

    @property tooltip
    @default t('components.map-tools.comapre-layers.tooltip')
  */
  tooltip: t('components.map-tools.background-layers.tooltip'),

  /**
    Map tool's icon CSS-class names.

    @property iconClass
    @type String
    @default 'background-layers icon'
  */
  iconClass: 'background-layers icon',

  /**
    Whether to show layers.

    @property isVisible
    @type Boolean
    @default false
  */
  isVisible: false,

  /**
    Array with layers.

    @property items
    @type Object
    @default Ember.A()
  */
  items: A(),

  /**
    Selected layer.

    @property items
    @type Object
    @default Ember.A()
  */
  selectedLayer: null,

  _backgroundLayersChange: observer('layers.[]', function () {
    this._updateItems();
  }),

  /**
    Initializes DOM-related component's properties  & logic.
  */
  didInsertElement() {
    this._super(...arguments);
    this._updateItems();
  },

  _updateItems() {
    const layers = this.get('layers');
    const items = [];
    let i = 1;
    const count = layers.length;
    layers.forEach((layer) => {
      let classChild = 'first-item';
      if (count === 1 || (count === 2 && i === 2) || (count >= 3 && i % 3 === 0)) {
        classChild = 'last-item';
      }

      let classActive = '';
      if (get(layer, 'visibility')) {
        classActive = 'active';
        this.set('selectedLayer', layer);
      }

      items.push({
        name: get(layer, 'name'),
        pic: layer.get('settingsAsObject.backgroundSettings.picture'),
        class: classChild,
        layer,
        classActive,
        id: get(layer, 'id'),
      });
      i += 1;
    });

    this.set('items', items);
  },

  actions: {
    /**
      Shows div with layers.

      @method actions.showBackgroundLayers
    */
    showBackgroundLayers() {
      const $tool = $('.flexberry-background-map-tool');
      if (!this.get('isVisible') && this.get('layers').length !== 0) {
        this.set('isVisible', true);
        $tool.addClass('visible');
        this.get('leafletMap').flexberryMap.tools.enable('background-layers', null);
      } else {
        this.set('isVisible', false);
        $tool.removeClass('visible');
      }
    },

    /**
      Clicks on layer.

      @method actions.onLayerClick
    */
    onLayerClick(layer) {
      const selectedLayer = this.get('selectedLayer');
      if (isNone(selectedLayer)) {
        set(layer, 'visibility', true);
        this.set('selectedLayer', layer);
      } else {
        set(selectedLayer, 'visibility', false);
        if (get(selectedLayer, 'id') === get(layer, 'id')) {
          this.set('selectedLayer', null);
        } else {
          set(layer, 'visibility', true);
          this.set('selectedLayer', layer);
        }
      }

      const items = this.get('items');
      items.forEach((item) => {
        if (item.id === get(layer, 'id')) {
          if (get(item, 'classActive') !== 'active') {
            set(item, 'classActive', 'active');
          } else {
            set(item, 'classActive', '');
          }
        }

        if (item.id !== get(layer, 'id') && get(item, 'classActive') === 'active') {
          set(item, 'classActive', '');
        }
      });

      this.set('items', items);
    },
  },
});
