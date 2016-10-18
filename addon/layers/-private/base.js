/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

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
    Possible values are 'add', 'edit', 'remove', 'search', 'identify'.

    @property operations
    @type String[]
    @default null
  */
  operations: null,

  /**
    Creates common identify settings object that will be injected as 'searchSettings' property into result of
    call to {{#crossLink "BaseLayer/createSettings:method"}}'createSettings' method{{/crossLink}}.

    @method createCommonSearchSettings
    @return Object Created search settings.
  */
  createCommonSearchSettings() {
    return {
      canBeSearched: true,
      displayPropertyName: undefined
    };
  },

  /**
    Creates common identify settings object that will be injected as 'identifySettings' property into result of
    call to {{#crossLink "BaseLayer/createSettings:method"}}'createSettings' method{{/crossLink}}.

    @method createCommonIdentifySettings
    @return Object Created identify settings.
  */
  createCommonIdentifySettings() {
    return {
      canBeIdentified: true,
      displayPropertyName: undefined
    };
  },

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    let settings = {};

    // Inject search & identify settings.
    let availableOperations = Ember.A(this.get('operations') || []);

    if (availableOperations.contains('search')) {
      Ember.set(settings, 'searchSettings', this.createCommonSearchSettings());
    }

    if (availableOperations.contains('identify')) {
      Ember.set(settings, 'identifySettings', this.createCommonIdentifySettings());
    }

    return settings;
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
