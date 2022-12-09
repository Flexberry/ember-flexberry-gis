/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-edit-crs';
import { getCrsCode, getAvailableCoordinateReferenceSystemsCodes } from '../utils/get-crs-by-name';
import {
  translationMacro as t
} from 'ember-i18n';

// Proj4 CRS code.
// Will be initialized in 'init' method.
let proj4CrsCode = null;

/**
 * Component for editing Coordinate reference system fields.
 */
export default Ember.Component.extend({
  layout,

  /**
    Array containing user friendly coordinate reference systems (CRS) codes.
    For example ['ESPG:4326', 'PROJ4'].

    @property _availableCoordinateReferenceSystemsCodes
    @type String[]
    @default null
    @private
  */
  _availableCoordinateReferenceSystemsCodes: null,

  /**
    User friendly coordinate reference system (CRS) code.
    For example 'ESPG:4326'.

    @property _coordinateReferenceSystemCode
    @type String
    @default null
    @private
  */
  _coordinateReferenceSystemCode: null,

  /**
    Flag: indicates whether coordinate reference system (CRS) edit fields must be shown.

    @property _showCoordinateReferenceSystemFields
    @type Boolean
    @readonly
  */
  _showCoordinateReferenceSystemFields: Ember.computed('_coordinateReferenceSystemCode', function () {
    return this.get('_coordinateReferenceSystemCode') === proj4CrsCode;
  }),

  /**
    Creates inner hash containing layer CRS settings for different CRS codes.

    @method _createInnerCoordinateReferenceSystems
    @private
  */
  _createInnerCoordinateReferenceSystems() {
    let coordinateReferenceSystems = {};
    Ember.A(this.get('_availableCoordinateReferenceSystemsCodes') || []).forEach((code) => {
      coordinateReferenceSystems[code] = {
        code: code === proj4CrsCode ? null : code,
        definition: null
      };
    });

    this.set('_coordinateReferenceSystems', coordinateReferenceSystems);
  },

  /**
    Observes _coordinateReferenceSystemCode changes & changes link to object containing code-related CRS settings.

    @method _coordinateReferenceSystemCodeDidChange
    @private
  */
  _coordinateReferenceSystemCodeDidChange: Ember.observer('_coordinateReferenceSystemCode', function () {
    let code = this.get('_coordinateReferenceSystemCode');
    this.set('coordinateReferenceSystem', this.get(`_coordinateReferenceSystems.${code}`));
  }),

  /**
   * Coordinate reference system.
   */
  coordinateReferenceSystem: null,

  /**
    Dialog's 'CRS' segment caption.

    @property crsCaption
    @type String
    @default t('components.flexberry-edit-crs.caption')
  */
  crsCaption: t('components.flexberry-edit-crs.caption'),

  /**
    Dialog's 'CRS' segment's name textbox caption.

    @property crsNameTextboxCaption
    @type String
    @default t('components.flexberry-edit-crs.name-textbox.caption')
  */
  crsNameTextboxCaption: t('components.flexberry-edit-crs.name-textbox.caption'),

  /**
    Dialog's 'CRS' segment's code textbox caption.

    @property crsCodeTextboxCaption
    @type String
    @default t('components.flexberry-edit-crs.code-textbox.caption')
  */
  crsCodeTextboxCaption: t('components.flexberry-edit-crs.code-textbox.caption'),

  /**
    Dialog's 'CRS' segment's definition textarea caption.

    @property crsDefinitionTextareaCaption
    @type String
    @default t('components.flexberry-edit-crs.definition-textarea.caption')
  */
  crsDefinitionTextareaCaption: t('components.flexberry-edit-crs.definition-textarea.caption'),

  init() {
    this._super(...arguments);

    // Available CRS codes for related dropdown.
    this.set('_availableCoordinateReferenceSystemsCodes', getAvailableCoordinateReferenceSystemsCodes(this));

    let crs = this.get('coordinateReferenceSystem');
    let crsCode = getCrsCode(crs, this);

    this.set('_coordinateReferenceSystemCode', crsCode);

    this._createInnerCoordinateReferenceSystems();
    this.set(`_coordinateReferenceSystems.${crsCode}`, crs);
  }
});
