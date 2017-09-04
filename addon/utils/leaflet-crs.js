/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Builds leaflet coordinate reference system (CRS).

  @for Utils.Layers
  @method getLeafletCrs
  @param {String} coordinateReferenceSystem Serialized JSON with the following structure: { code: '...', definition: '...' },
        'code' is necessary CRS code, 'definition' is optional CRS definition in Proj4 format.
  @param {String} context Ember object with available getOwner method.

  Usage:
  controllers/my-form.js
  ```javascript
    import { getLeafletCrs } from 'ember-flexberry-gis/utils/leaflet-crs'l
    let crs = getLeafletCrs('{ code: "ESPG:3857", definition: "" }', this)

  ```
*/
let getLeafletCrs = (coordinateReferenceSystem, context) => {
  coordinateReferenceSystem = Ember.isBlank(coordinateReferenceSystem) ? null : JSON.parse(coordinateReferenceSystem);

  if (Ember.isNone(coordinateReferenceSystem)) {
    return null;
  }

  let code = Ember.get(coordinateReferenceSystem, 'code');
  let definition = Ember.get(coordinateReferenceSystem, 'definition');
  if (Ember.isBlank(code) && Ember.isBlank(definition)) {
    return null;
  }

  let crs = null;
  let owner = Ember.getOwner(context);
  if (Ember.isBlank(definition)) {
    // Only code is defined.
    // Try to find existing CRS with the same code.
    let availableCrsCodes = Ember.A();
    let crsFactories = owner.knownForType('coordinate-reference-system');
    owner.knownNamesForType('coordinate-reference-system').forEach((crsName) => {
      let crsFactory = Ember.get(crsFactories, crsName);
      let crsFactoryCode = Ember.get(crsFactory, 'code');
      availableCrsCodes.pushObject(crsFactoryCode);

      // CRS code is the same.
      // Create CRS from factory, remember it & break loop.
      if (crsFactoryCode === code) {
        crs = crsFactory.create(code, definition);
        return false;
      }
    });

    Ember.assert(
      `Wrong value of \`coordinateReferenceSystem.code\` parameter: \`${code}\`. ` +
      `Allowed values are: [\`${availableCrsCodes.join(`\`, \``)}\`].`, !Ember.isNone(crs));
  } else if (!Ember.isBlank(definition)) {
    // CRS has definition.
    // Try to create CRS from proj4.
    let options = Ember.get(coordinateReferenceSystem, 'options');
    crs = owner.knownForType('coordinate-reference-system', 'proj4').create(code, definition, options);
  }

  return crs;
};

export {
  getLeafletCrs
};
