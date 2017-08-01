/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

const createFeaturesPropertiesSettings = function () {
  return {
    displayPropertyIsCallback: false,
    displayProperty: null,
    excludedProperties: [],
    localizedProperties: {
      ru: {},
      en: {}
    }
  };
};

const createDisplaySettings = function () {
  return {
    dateFormat: 'DD.MM.YYYY',
    featuresPropertiesSettings: createFeaturesPropertiesSettings()
  };
};

const createCommonSearchSettings = function () {
  return {
    canBeSearched: false,
    canBeContextSearched: false,
    contextSearchFields: null,
    searchFields: null,
  };
};

const createCommonIdentifySettings = function () {
  return {
    canBeIdentified: true
  };
};

const createCommonLegendSettings = function () {
  return {
    legendCanBeDisplayed: true
  };
};

/**
  Class describing base layer metadata.

  @class BaseLayer
*/
export default Ember.Object.extend({
  /**
    Icon class related to layer type.

    @property iconClass
    @type String
    @default null
  */
  iconClass: null,

  /**
    Permitted operations related to layer type.
    Possible values are 'add', 'edit', 'remove', 'search', 'identify', 'legend'.

    @property operations
    @type String[]
    @default null
  */
  operations: null,

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    let settings = {
      opacity: 1,
      bounds: [
        [-180, -180],
        [180, 180]
      ],
    };

    // Inject search & identify settings.
    let availableOperations = Ember.A(this.get('operations') || []);

    if (availableOperations.contains('search')) {
      Ember.set(settings, 'searchSettings', createCommonSearchSettings());
    }

    if (availableOperations.contains('identify')) {
      Ember.set(settings, 'identifySettings', createCommonIdentifySettings());
    }

    Ember.set(settings, 'displaySettings', createDisplaySettings());

    if (availableOperations.contains('legend')) {
      Ember.set(settings, 'legendSettings', createCommonLegendSettings());
    }

    return settings;
  },

  /**
    Creates new settings object (with settings related to layer-type) from the specified CSW record.

    @method createSetingsFromCsw
    @param {Object} Specified CSW record.
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSetingsFromCsw(record) {
    return this.createSettings();
  },

  /**
    Creates new search settings object (with search settings related to layer-type).

    @method createSearchSettings
    @returns {Object} New search settings object (with search settings related to layer-type).
  */
  createSearchSettings() {
    return {};
  }
});
