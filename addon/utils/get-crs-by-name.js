import { A } from '@ember/array';
import { getOwner } from '@ember/application';

/**
  Finds crs by name in factory and create it.

  @method getCrsByName
  @param {String} crsName Name of coordinate reference system.
  @param {Object} that.
  @returns {Object} Сoordinate reference system and definition.
*/
const getCrsByName = function (crsName, that) {
  if (!crsName || !that) {
    return null;
  }

  const knownCrs = getOwner(that).knownForType('coordinate-reference-system');
  const knownCrsArray = A(Object.values(knownCrs));
  const crsLayer = knownCrsArray.findBy('code', crsName);
  const crs = crsLayer.create();
  const { definition, } = crsLayer;
  return { crs, definition, };
};

export {
  getCrsByName
};
