import Ember from 'ember';
import layout from '../../templates/components/map-tools/legend';

const flexberryClassNamesPrefix = 'flexberry-map-tool';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  icon: flexberryClassNamesPrefix + '-icon',
  measure: 'flexberry-legend-map-tool',
  close: 'flexberry-legend-close-map-tool'
};

let LegendMapToolComponent = Ember.Component.extend({
  layout,

  /**
    Reference to component's CSS-classes names.
    Must be also a component's instance property to be available from component's .hbs template.
  */
  flexberryClassNames,

  /**
    @property tagName
    @type String
    @default ''
  */
  tagName: '',

  /**
    Map tool's additional CSS-class.
 
    @property class
    @type String
    @default flexberry-legend-tool
  */
  class: 'flexberry-legend-tool',

  /**
    Map tool's caption.
 
    @property caption
    @type String
  */
  caption: '',

  /**
    Map tool's tooltip text.
    Will be added as wrapper's element 'title' attribute.
 
    @property tooltip
  */
  tooltip: '',

  /**
    Map tool's title CSS-class names.
 
    @property titleClass
    @type String
    @default 'legend-map-tool-panel-title'
  */
  titleClass: 'legend-map-tool-panel-title',

  /**
    Map tool's icon CSS-class names.
 
    @property iconClass
    @type String
    @default 'icon-guideline-layer-all'
  */
  iconClass: 'icon-guideline-layer-all',

  /**
    Show or hide panel

    @property showPanel
    @type boolean
    @default false
  */
  showPanel: false,

  /**
    Panel position. Top

    @property panelTop
    @default null
    @type String
  */
  panelTop: null,

  /**
    Panel position. Bottom

    @property panelBottom
    @default 4px
    @type String
  */
  panelBottom: '20px',

  /**
    Panel position. Left

    @property panelLeft
    @default null
    @type String
  */
  panelLeft: null,

  /**
    Panel position. Right

    @property panelRight
    @default 65px
    @type String
  */
  panelRight: '80px',

  /**
    Layers for show

    @property layers
    @default null
    @type Array
  */
  layers: null,

  hasLayers: Ember.computed('layers', 'layers.[]', function () {
    let layers = this.get('layers');

    return layers && layers.length > 0;
  }),

  actions: {
    closePanel() {
      this.set('showPanel', false);
    },

    showPanel() {
      this.set('showPanel', true);
    }
  }
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
LegendMapToolComponent.reopenClass({
  flexberryClassNames
});

export default LegendMapToolComponent;
