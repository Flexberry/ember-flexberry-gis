/**
  @module ember-flexberry-gis
*/

import { isBlank } from '@ember/utils';

import { getOwner } from '@ember/application';
import { A } from '@ember/array';
import { computed, observer, get } from '@ember/object';
import Component from '@ember/component';
import {
  translationMacro as t
} from 'ember-i18n';
import layout from '../templates/components/flexberry-edit-crs';

// Proj4 CRS code.
// Will be initialized in 'init' method.
let proj4CrsCode = null;

/**
 * Component for editing Coordinate reference system fields.
 */
export default Component.extend({
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
  _showCoordinateReferenceSystemFields: computed('_coordinateReferenceSystemCode', function () {
    return this.get('_coordinateReferenceSystemCode') === proj4CrsCode;
  }),

  /**
    Creates inner hash containing layer CRS settings for different CRS codes.

    @method _createInnerCoordinateReferenceSystems
    @private
  */
  _createInnerCoordinateReferenceSystems() {
    const coordinateReferenceSystems = {};
    A(this.get('_availableCoordinateReferenceSystemsCodes') || []).forEach((code) => {
      coordinateReferenceSystems[code] = {
        code: code === proj4CrsCode ? null : code,
        definition: null,
      };
    });

    this.set('_coordinateReferenceSystems', coordinateReferenceSystems);
  },

  /**
    Observes _coordinateReferenceSystemCode changes & changes link to object containing code-related CRS settings.

    @method _coordinateReferenceSystemCodeDidChange
    @private
  */
  _coordinateReferenceSystemCodeDidChange: observer('_coordinateReferenceSystemCode', function () {
    const code = this.get('_coordinateReferenceSystemCode');
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

    // Retrieve & remember constant (proj4 CRS code).
    const proj4CrsFactory = getOwner(this).knownForType('coordinate-reference-system', 'proj4');
    proj4CrsCode = get(proj4CrsFactory, 'code');

    const owner = getOwner(this);

    // Available CRS codes for related dropdown.
    const crsFactories = owner.knownForType('coordinate-reference-system');
    const crsFactoriesNames = owner.knownNamesForType('coordinate-reference-system');
    this.set('_availableCoordinateReferenceSystemsCodes', A(crsFactoriesNames.map((crsFactoryName) => {
      const crsFactory = get(crsFactories, crsFactoryName);
      return get(crsFactory, 'code');
    })));

    const crs = this.get('coordinateReferenceSystem');
    let crsCode = get(crs, 'code');
    if (!isBlank(crsCode) && !this.get('_availableCoordinateReferenceSystemsCodes').includes(crsCode)) {
      // Unknown CRS code means that proj4 is used.
      crsCode = proj4CrsCode;
    }

    this.set('_coordinateReferenceSystemCode', crsCode);

    this._createInnerCoordinateReferenceSystems();
    this.set(`_coordinateReferenceSystems.${crsCode}`, crs);
  },
});
