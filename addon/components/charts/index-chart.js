/**
  @module ember-flexberry-gis
*/

import { inject as service } from '@ember/service';

import { getOwner } from '@ember/application';
import { A } from '@ember/array';
import { isNone } from '@ember/utils';
import { computed, observer, get } from '@ember/object';
import Component from '@ember/component';
import {
  translationMacro as t
} from 'ember-i18n';
import layout from '../../templates/components/charts/index-chart';

/**
  Component for charting.

  @class IndexChartComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/

export default Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Editing chart type.

    @property _captionChart
    @type string
    @default t(`components.charts.index-chart.default-caption`)
  */
  _captionChart: t('components.charts.index-chart.default-caption'),

  /**
    Selected chart type.

    @property _selectedModeType
    @type string
    @default 'pie'
  */
  _selectedModeType: 'pie',

  /**
    Localized properties names.

    @property _localizedProperties
    @type Object
    @default null
  */
  _localizedProperties: null,

  /**
    Inner hash containing settings object.

    @property _isObjProperties
    @type Object[]
    @default null
  */
  _isObjProperties: null,

  /**
    Data for drawing a diagram.

    @property _isObjPropertiesComputed
    @type Object[]
  */
  _isObjPropertiesComputed: computed('_chosenClassifyPropertyObjProperties', function () {
    if (!isNone(this.get('_chosenClassifyPropertyObjProperties'))) {
      return this.get('_chosenClassifyPropertyObjProperties');
    }

    return this.get('_isObjProperties');
  }),

  /**
    Flag: indicates whether to classify by property value.

    @property _classifyProperty
    @type boolean
    @default false
  */
  _classifyProperty: false,

  /**
    Key properties for classification.

    @property _keyChosenClassifyProperty
    @type string
    @default null
  */
  _keyChosenClassifyProperty: null,

  /**
    Inner hash containing settings object for the selected group.

    @property _chosenClassifyPropertyObjProperties
    @type Object[]
    @default null
  */
  _chosenClassifyPropertyObjProperties: null,

  /**
    Property value for classification.

    @property _propertyForClassifyValue
    @type string
    @default null
  */
  _propertyForClassifyValue: null,

  /**
    List of groups resulting from classification.

    @property _uniqueSymbolClassifyPropertyItems
    @type Object[]
    @default null
  */
  _uniqueSymbolClassifyPropertyItems: null,

  /**
    Name of the selected classification group.

    @property _uniqueSymbolClassifyPropertyValue
    @type string
    @default null
  */
  _uniqueSymbolClassifyPropertyValue: null,

  /**
    Observes and handles changes in _classifyProperty.
    Clears list of groups classification.

    @method _classifyPropertyObserver
    @private
  */
  _classifyPropertyObserver: observer('_classifyProperty', function () {
    if (!this.get('_classifyProperty')) {
      this.set('_propertyForClassifyValue', null);
      this.set('_uniqueSymbolClassifyPropertyValue', null);
      this.set('_chosenClassifyPropertyObjProperties', null);
    }
  }),

  /**
    Observes and handles changes in _propertyForClassifyValue.
    Сomputes list of groups classification.

    @method _propertyForClassifyValueObserver
    @private
  */
  _propertyForClassifyValueObserver: observer('_propertyForClassifyValue', function () {
    this.set('_uniqueSymbolClassifyPropertyValue', null);
    this.set('_chosenClassifyPropertyObjProperties', null);

    let propertyName = null;
    const properties = this.get('_localizedProperties');
    properties.forEach((key) => {
      if (this.get('_propertyForClassifyValue') === properties[key]) {
        propertyName = key;
        this.set('_keyChosenClassifyProperty', key);
      }
    });

    const propertyValues = this.get('_isObjProperties');
    const values = A();
    propertyValues.forEach((prop) => {
      let property = get(prop, `${propertyName}`);
      if (isNone(property)) {
        property = 'undefined';
      }

      values.addObject(property);
    });

    this.set('_uniqueSymbolClassifyPropertyItems', values);
  }),

  /**
    Observes and handles changes in _uniqueSymbolClassifyPropertyValue.
    Сomputes inner hash containing settings object for the selected group.

    @method _uniqueSymbolClassifyPropertyObserver
    @private
  */
  _uniqueSymbolClassifyPropertyObserver: observer('_uniqueSymbolClassifyPropertyValue', function () {
    const uniqueSymbolClassifyPropertyValue = this.get('_uniqueSymbolClassifyPropertyValue');
    const propertyName = this.get('_keyChosenClassifyProperty');
    const propertyValues = this.get('_isObjProperties');
    const chosenClassifyPropertyObjProperties = A();

    propertyValues.forEach((prop) => {
      let property = get(prop, `${propertyName}`);
      if (isNone(property)) {
        property = 'undefined';
      }

      if (property.toString() === uniqueSymbolClassifyPropertyValue) {
        chosenClassifyPropertyObjProperties.pushObject(prop);
      }
    });

    this.set('_chosenClassifyPropertyObjProperties', chosenClassifyPropertyObjProperties);
  }),

  selectedModeType: computed('i18n.locale', '_selectedModeType', function () {
    const type = this.get('_selectedModeType');
    return this.get('i18n').t(`components.charts.type-charts.${type}.name`).toString();
  }),

  /**
    Available chart type.

    @property _availableTypes
    @type Object[]
  */
  _availableTypes: computed('i18n.locale', function () {
    const result = {};
    const owner = getOwner(this) || {};
    if (owner.knownNamesForType) {
      const types = owner.knownNamesForType('components/charts/type-chart');
      types.forEach((type) => {
        result[type] = this.get('i18n').t(`components.charts.type-charts.${type}.name`).toString();
      }, this);
    }

    return result;
  }),

  /**
    Reference to 'charts-renderer' service.

    @property _chartsRenderer
    @type LayersStylesRendererService
    @private
  */
  _chartsRenderer: service('charts-render'),

  /**
    Canvas charts.

    @property _chartsCanvas
    @type <a =ref="https://developer.mozilla.org/ru/docs/Web/HTML/Element/canvas">Canvas</a>
    @default null
    @private
  */
  _chartsCanvas: null,

  /**
    Renderes charts preview on canvas.

    @method _renderChartsCanvas
    @private
  */
  _renderChartsCanvas() {
    const json = this.get('getJsonCharts')();
    const canvas = this.get('_chartsCanvas');
    this.get('_chartsRenderer').renderOnChartsCanvas({
      canvas,
      json,
    });
  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);
    const chartsCanvas = this.$('.chart-canvas')[0];
    this.set('_chartsCanvas', chartsCanvas);
  },

  /**
    Destroys DOM-related component's properties.
  */
  willDestroyElement() {
    this._super(...arguments);

    this.set('_chartsCanvas', null);
  },

  actions: {

    /**
      Handles {{#crossLink "type-chart/sendingActions.onInit:method"}}'pie/column/line' component's 'onInit' action{{/crossLink}}.

      @method actions.initJsonCharts
    */
    initJsonCharts(getJsonCharts) {
      this.set('getJsonCharts', getJsonCharts);
    },

    /**
      Handles clicks on button.
      Invokes {{#crossLink "type-chart/sendingActions.onGenerateChart:method"}}'onGenerateChart' action{{/crossLink}}.

      @method actions.onGenerateChart
    */
    onGenerateChart() {
      this._renderChartsCanvas();
    },

    onModeTypeChange(item, key) {
      this.get('_chartsRenderer').clearcharts();
      this.set('_selectedModeType', key);
    },
  },
});
