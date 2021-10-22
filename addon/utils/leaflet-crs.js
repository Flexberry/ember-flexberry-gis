/**
  @module ember-flexberry-gis
*/

import { assert } from '@ember/debug';

import { A } from '@ember/array';
import { getOwner } from '@ember/application';
import { get } from '@ember/object';
import { isBlank, isNone } from '@ember/utils';

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
const getLeafletCrs = (coordinateReferenceSystem, context) => {
  coordinateReferenceSystem = isBlank(coordinateReferenceSystem) ? null : JSON.parse(coordinateReferenceSystem);

  if (isNone(coordinateReferenceSystem)) {
    return null;
  }

  const code = get(coordinateReferenceSystem, 'code');
  const definition = get(coordinateReferenceSystem, 'definition');
  if (isBlank(code) && isBlank(definition)) {
    return null;
  }

  let crs = null;
  const owner = getOwner(context);
  if (isBlank(definition)) {
    // Only code is defined.
    // Try to find existing CRS with the same code.
    const availableCrsCodes = A();
    const crsFactories = owner.knownForType('coordinate-reference-system');
    owner.knownNamesForType('coordinate-reference-system').forEach((crsName) => {
      const crsFactory = get(crsFactories, crsName);
      const crsFactoryCode = get(crsFactory, 'code');
      availableCrsCodes.pushObject(crsFactoryCode);

      // CRS code is the same.
      // Create CRS from factory, remember it & break loop.
      if (crsFactoryCode === code) {
        crs = crsFactory.create(code, definition);
        return false;
      }
    });

    assert(
      `Wrong value of \`coordinateReferenceSystem.code\` parameter: \`${code}\`. `
      + `Allowed values are: [\`${availableCrsCodes.join('`, `')}\`].`, !isNone(crs)
    );
  } else if (!isBlank(definition)) {
    // CRS has definition.
    // Try to create CRS from proj4.
    const options = get(coordinateReferenceSystem, 'options');
    crs = owner.knownForType('coordinate-reference-system', 'proj4').create(code, definition, options);
  }

  return crs;
};

export {
  getLeafletCrs
};
