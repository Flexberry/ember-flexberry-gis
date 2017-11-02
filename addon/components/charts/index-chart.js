import Ember from 'ember';
import layout from '../../templates/components/charts/index-chart';

export default Ember.Component.extend({
  /**
    Editing chart type.

    @property _captionChart
    @type string
    @default 'Сhart title'
  */
  _captionChart: 'Сhart title',

  /**
    Available chart type.

    @property _availableTypes
    @type Object[]
    @default null
  */
  _availableTypes: null,

  /**
    Selected chart type.

    @property _selectedModeType
    @type string
    @default 'pie'
  */
  _selectedModeType: 'pie',

  /**
    Inner hash containing settings object.

    @property _isObjProperties
    @type Object[]
    @default null
  */
  _isObjProperties: [{ "name":"Tokyo", "name1":"New York1", "rainfall": "60.4", "countP": "100" },
      { "name":"New York", "name1":"London1", "rainfall": "38.8", "countP": "200" },
      { "name":"London", "name1":"Berlin1", "rainfall": "52.4", "countP": "300"  },
      { "name":"Berlin", "name1":"Perm1", "rainfall": "-105.0", "countP": "400"  },
      { "name":"Perm", "name1":"Paris1","rainfall": "216.4", "countP": "500" },
      { "name":"Paris", "name1":"Tokyo1", "rainfall": "33.2", "countP": "600"  }
  ],

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // Available layers types for related dropdown.
    let owner = Ember.getOwner(this);
    this.set('_availableTypes', owner.knownNamesForType('components/charts/type-chart'));
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
      Invokes {{#crossLink "type-chart/sendingActions.onClick:method"}}'onClick' action{{/crossLink}}.

      @method actions.onClick
    */
    onClick() {
      let json = this.get('getJsonCharts')();

      this.$('.containerCR').highcharts(json);
    }
  },

  /**
    Reference to component's template.
  */
  layout
});
