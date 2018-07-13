import Ember from 'ember';
import layout from '../../../../templates/components/legends/layers-styles/-private/base';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's hbs-markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.imageWrapper Legend's image wrapping <div> CSS-class name ('layer-legend-image-wrapper').
  @property {String} flexberryClassNames.image Legend's image CSS-class name ('layer-legend-image').
  @property {String} flexberryClassNames.caption Legend's caption CSS-class name ('layer-legend-caption').
  @readonly
  @static

  @for BaseLayerStyleLegendComponent
*/
const flexberryClassNames = {
  imageWrapper: 'layer-legend-image-wrapper',
  image: 'layer-legend-image',
  caption: 'layer-legend-caption'
};

/**
  Base component representing legend for vector layer with some style settings.

  @class BaseLayerStyleLegendComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Reference to 'layers-styles-renderer' service.

    @property _layersStylesRenderer
    @type LayersStylesRendererService
    @private
  */
  _layersStylesRenderer: Ember.inject.service('layers-styles-renderer'),

  /**
    Reference to 'markers-styles-renderer' service.

    @property _markersStylesRenderer
    @type MarkersStylesRendererService
    @private
  */
  _markersStylesRenderer: Ember.inject.service('markers-styles-renderer'),

  /**
    Reference to component's template.
  */
  layout,

  /**
    Reference to component's CSS-classes names.
    Must be also a component's instance property to be available from component's .hbs template.
  */
  flexberryClassNames,

  /**
    Hash containing 'simple' style settings.

    @property styleSettings
    @type Object
    @default null
  */
  styleSettings: null,

  /**
    Hash containing legend settings.

    @property legendSettings
    @type Object
    @default null
  */
  legendSettings: null,

  /**
    Flag: idnicates whether to show caption or not.

    @property showCaption
    @type Boolean
    @default false
  */
  showCaption: false,

  /**
    Legend caption.

    @property caption
    @type String
    @default null
  */
  caption: null
});
