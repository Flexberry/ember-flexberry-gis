/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Component containing GUI for categorized layers-styles (unique, graduated)

  @class CategorizedLayersStyleLayerBaseCategorizedLayerStyleComponent
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
    Flag: indicates whether classification can be performed now or not.

    @property _classificationCanBePerformed
    @type Boolean
    @private
    @readOnly
  */
  _classificationCanBePerformed: Ember.computed('styleSettings.style.propertyName', function() {
    return !Ember.isBlank(this.get('styleSettings.style.propertyName'));
  }),

  /**
    Flag: indicates whether selected categories remove can be performed now or not.

    @property _removeCanBePerformed
    @type Boolean
    @private
    @readOnly
  */
  _removeCanBePerformed: Ember.computed('_selectedCategoriesCount', function() {
    return this.get('_selectedCategoriesCount') > 0;
  }),

  /**
    Hash containing indicators of selected categories.

    @property _selectedCategories
    @type Object
    @default null
    @private
  */
  _selectedCategories: null,

  /**
    Count of selected categories.

    @property _selectedCategoriesCount
    @type Number
    @default 0
    @private
  */
  _selectedCategoriesCount: 0,

  /**
    Flag: indicates whether all categories are selected or not.

    @property _allCategoriesAreSelected
    @type Boolean
    @default false
    @private
  */
  _allCategoriesAreSelected: false,

  /**
    Reference to active category.

    @property _activeCategory
    @type Object
    @default null
    @private
  */
  _activeCategory: null,

  /**
    Name of currently active editing cell.

    @property _editingCell
    @type String
    @default null
    @private
  */
  _editingCell: null,

  /**
    Flag indicates when stroke gradient enable.

    @property _strokeGradientEnable
    @type Boolean
    @default false
    @private
  */
  _strokeGradientEnable: false,

  /**
    Flag indicates when fill gradient enable.

    @property _fillGradientEnable
    @type Boolean
    @default false
    @private
  */
  _fillGradientEnable: false,

  /**
    First stroke color of automatic set color range. In HEX.

    @property _strokeGradientColorStart
    @type String
    @default null
    @private
  */
  _strokeGradientColorStart: null,

  /**
    Last stroke color of automatic set color range. In HEX.

    @property _strokeGradientColorEnd
    @type String
    @default null
    @private
  */
  _strokeGradientColorEnd: null,

  /**
    First fill color of automatic set color range. In HEX.

    @property _fillGradientColorStart
    @type String
    @default null
    @private
  */
  _fillGradientColorStart: null,

  /**
    Observers changes in categories.
    Renderes symbols related to them.

    @method _categoriesDidChange
    @private
  */
  _categoriesDidChange: Ember.observer('styleSettings.style.categories.[]', function() {
    Ember.run.scheduleOnce('afterRender', this, '_renderCategorySymbolsOnCanvases');
  }),

  /**
    Related leaflet layer.

    @property leafletLayer
    @type <a href="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>
    @default null
    @public
  */
  leafletLayer: null,

  /**
    Component's wrapping <div> CSS-classes names.

    @property classNames
    @type String[]
    @default null
  */
  classNames: null,

  /**
    Hash containing style settings.

    @property styleSettings
    @type Object
    @default null
  */
  styleSettings: null,

  /**
    Hash containing layer display settings.

    @property displaySettings
    @type Object
    @default null
  */
  displaySettings: null,

  /**
    Related layer's type.

    @property layerType
    @type String
    @default null
  */
  layerType: null,

  actions: {
    /**
      Handles 'add category' button click event.

      @method actions.onSelectAllCategoriesCheckboxChange
      @param {Object} e Event object.
      @param {Boolean} e.checked Flag indicating whether checkbox is checked now or not.
    */
    onSelectAllCategoriesCheckboxChange({ checked }) {
      if (checked) {
        let categoriesCount = this.get('styleSettings.style.categories.length');
        this.set('_selectedCategoriesCount', categoriesCount);

        let selectedCategories = {};
        for (let i = 0; i < categoriesCount; i++) {
          selectedCategories[i + ''] = true;
        }

        this.set('_selectedCategories', selectedCategories);
      } else {
        this.set('_selectedCategoriesCount', 0);
        this.set('_selectedCategories', {});
      }
    },

    /**
      Handles 'add category' button click event.

      @method actions.onSelectCategoryCheckboxChange
      @param {Object} e Event object.
      @param {Boolean} e.checked Flag indicating whether checkbox is checked now or not.
    */
    onSelectCategoryCheckboxChange(categoryIndex, { checked }) {
      let selectedCategoriesCount = this.get('_selectedCategoriesCount');
      if (checked) {
        selectedCategoriesCount++;
      } else {
        selectedCategoriesCount--;
      }

      let categoriesCount = this.get('styleSettings.style.categories.length');
      if (selectedCategoriesCount < 0) {
        selectedCategoriesCount = 0;
      } else if (selectedCategoriesCount > categoriesCount) {
        selectedCategoriesCount = categoriesCount;
      }

      if (categoriesCount > 0 && selectedCategoriesCount === categoriesCount) {
        this.set('_allCategoriesAreSelected', true);
      } else {
        this.set('_allCategoriesAreSelected', false);
      }

      this.set('_selectedCategoriesCount', selectedCategoriesCount);
    },

    /**
      Handles 'add category' button click event.

      @method actions.onAddCategoryButtonClick
      @param {Object} e Event object.
    */
    onAddCategoryButtonClick(e) {
      let layersStylesRenderer = this.get('_layersStylesRenderer');
      let categories = this.get('styleSettings.style.categories').slice(0);
      categories.push({
        name: categories.length,
        value: null,
        styleSettings: layersStylesRenderer.getDefaultStyleSettings('simple')
      });

      this.set('styleSettings.style.categories', categories);
      this.set('_allCategoriesAreSelected', false);
    },

    /**
      Handles 'remove selected categories' button click event.

      @method actions.onRemoveSelectedCategoriesButtonClick
      @param {Object} e Event object.
    */
    onRemoveSelectedCategoriesButtonClick() {
      if (this.get('_allCategoriesAreSelected')) {
        this.set('styleSettings.style.categories', []);
      } else {
        let newCategories = [];
        let categories = this.get('styleSettings.style.categories');
        let selectedCategories = this.get('_selectedCategories');

        for (let i = 0, len = categories.length; i < len; i++) {
          if (selectedCategories[i + ''] !== true) {
            newCategories.push(categories[i]);
          }
        }

        this.set('styleSettings.style.categories', newCategories);
      }

      this.set('_selectedCategories', {});
      this.set('_selectedCategoriesCount', 0);
      this.set('_allCategoriesAreSelected', false);
    },

    /**
      Opens category style editor.

      @method actions.onCategoryStyleEditorOpen
      @param {Object} e Event object.
    */
    onCategoryStyleEditorOpen(categoryIndex, e) {
      let categories = this.get('styleSettings.style.categories');
      this.set('_activeCategory', categories[categoryIndex]);

      let $categoryStyleEditor = this.$('.category-style-editor');
      $categoryStyleEditor.attr('category', categoryIndex);
      $categoryStyleEditor.addClass('active');

      let $styleSettingsTab = $categoryStyleEditor.closest('.tab.segment');
      $styleSettingsTab.attr('scrollTop', $styleSettingsTab.scrollTop());
      $styleSettingsTab.scrollTop(0);
      $styleSettingsTab.css('overflow', 'hidden');
    },

    /**
      Closes category style editor.

      @method actions.onCategoryStyleEditorClose
      @param {Object} e Event object.
    */
    onCategoryStyleEditorClose(e) {
      let $categoryStyleEditor = this.$('.category-style-editor');
      let categoryIndex = Number($categoryStyleEditor.attr('category'));
      $categoryStyleEditor.removeAttr('category');
      $categoryStyleEditor.removeClass('active');

      let $styleSettingsTab = $categoryStyleEditor.closest('.tab.segment');
      $styleSettingsTab.css('overflow', 'auto');
      $styleSettingsTab.scrollTop($styleSettingsTab.attr('scrollTop'));
      $styleSettingsTab.removeAttr('scrollTop');

      this.set('_activeCategory', null);

      this._renderCategorySymbolsOnCanvases(categoryIndex);
    },

    /**
      Handles editing cell 'click' event.

      @method actions.onEditingCellClick
      @param {Object} e Event object.
    */
    onEditingCellClick(editingCell, e) {
      this.set('_editingCell', editingCell);

      // Wait while input will be embeded into clicked cell (after render), and focus on it.
      Ember.run.schedule('afterRender', () => {
        let $cellInput = Ember.$(e.target).find('input').first();
        $cellInput.focus();
      });
    },

    /**
      Handles editing cell 'focusout' event.

      @method actions.onEditingCellFocusOut
      @param {String} inputText Actual input text.
      @param {Object} e Event object.
    */
    onEditingCellFocusOut(inputText, e) {
      this.set('_editingCell', null);
    },

    /**
      Handles editing cell 'keydown' event.

      @method actions.onEditingCellKeyDown
      @param {String} inputText Actual input text.
      @param {Object} e Event object.
    */
    onEditingCellKeyDown(inputText, e) {
      // If Enter (keycode: 13) or Esc (keycode: 27) was pressed, remove input from the cell.
      let code = e.keyCode || e.which;
      if (code === 13 || code === 27) {
        e.preventDefault();
        this.send('onEditingCellFocusOut', inputText, e);
      }
    }
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    this.set('_selectedCategories', {});
    this._loadGradientSettings();
  },

  /**
    Initializes component's DOM-related properties.
  */
  didInsertElement() {
    this._super(...arguments);

    this._categoriesDidChange();
  },

  /**
    Deinitializes component.
  */
  willDestroy() {
    this.set('_selectedCategories', null);

    this._super(...arguments);
  },

  /**
    Check saved gradient settings in layer styleSettings and sets them
    as current

    @method _loadGradientSettings
    @private
  */
  _loadGradientSettings() {
    let existPathSettings = this.get('styleSettings').style.path;
    let existCategories = this.get('styleSettings').style.categories;

    if (existCategories.length !== 0) {
      if (existPathSettings.fillGradientEnable) {
        this.set('_fillGradientEnable', true);
        let colorStart = existCategories[0].styleSettings.style.path.fillColor;
        let colorEnd = existCategories[existCategories.length - 1].styleSettings.style.path.fillColor;
        this.set('_fillGradientColorStart', colorStart);
        this.set('_fillGradientColorEnd', colorEnd);
      }

      if (existPathSettings.strokeGradientEnable) {
        this.set('_strokeGradientEnable', true);
        let colorStart = existCategories[0].styleSettings.style.path.color;
        let colorEnd = existCategories[existCategories.length - 1].styleSettings.style.path.color;
        this.set('_strokeGradientColorStart', colorStart);
        this.set('_strokeGradientColorEnd', colorEnd);
      }
    }
  },

  /**
    Renderes categories symbols on canvases related to them.

    @method _renderCategorySymbolsOnCanvases
    @param {Number} [categoryIndex] Index of category who's symbol must be rendered (if undefined then symbols for all categories will be rendered).
    @private
  */
  _renderCategorySymbolsOnCanvases(categoryIndex) {
    let layersStylesRenderer = this.get('_layersStylesRenderer');
    let categories = this.get('styleSettings.style.categories');
    if (!Ember.isArray(categories) || categories.length === 0) {
      return;
    }

    if (categoryIndex >= 0 && categoryIndex < categories.length) {
      // Render symbol for the specified category.
      let canvas = this.$('canvas.category-symbol-preview[category=' + categoryIndex + ']')[0];
      let category = categories[categoryIndex];
      let categoryStyleSettings = Ember.get(category, 'styleSettings');

      layersStylesRenderer.renderOnCanvas({ canvas, styleSettings: categoryStyleSettings, target: 'legend' });
    } else {
      // Render symbols for all categories.
      this.$('canvas.category-symbol-preview').each(function() {
        let canvas = this;
        let $canvas = Ember.$(canvas);
        let categoryIndex = Number($canvas.attr('category'));
        let category = categories[categoryIndex];
        let categoryStyleSettings = Ember.get(category, 'styleSettings');

        layersStylesRenderer.renderOnCanvas({ canvas, styleSettings: categoryStyleSettings, target: 'legend' });
      });
    }
  }
});
