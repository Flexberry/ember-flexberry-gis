import { A } from '@ember/array';
import { getOwner } from '@ember/application';

/**
  Finds crs by name in factory and create it.

  @method getCrsByName
  @param {String} crsName Name of coordinate reference system.
  @param {Object} that.
  @returns {Object} Сoordinate reference system and definition.
*/
let getCrsByName = function(crsName, that) {
  if (!crsName || !that) {
    return null;
  }

  let knownCrs = getOwner(that).knownForType('coordinate-reference-system');
  let knownCrsArray = A(Object.values(knownCrs));
  let crsLayer = knownCrsArray.findBy('code', crsName);
  let crs = crsLayer.create();
  let definition = crsLayer.definition;
  return { crs, definition };
};

export {
  getCrsByName
};
