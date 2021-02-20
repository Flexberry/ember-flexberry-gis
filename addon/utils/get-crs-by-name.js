import Ember from 'ember';

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

  let knownCrs = Ember.getOwner(that).knownForType('coordinate-reference-system');
  let knownCrsArray = Ember.A(Object.values(knownCrs));
  let crsLayer = knownCrsArray.findBy('code', crsName);
  let crs = crsLayer.create();
  let definition = crsLayer.definition;
  return { crs, definition };
};

export {
  getCrsByName
};
