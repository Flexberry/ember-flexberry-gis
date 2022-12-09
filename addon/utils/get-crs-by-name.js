import Ember from 'ember';

/**
  Finds crs by name in factory and create it.

  @method getCrsByName
  @param {String} crsName Name of coordinate reference system.
  @param {Object} that.
  @returns {Object} Сoordinate reference system and definition.
*/
let getCrsByName = function (crsName, that) {
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

let getAvailableCoordinateReferenceSystemsCodes = function (that) {
  let owner = Ember.getOwner(that);

  let crsFactories = owner.knownForType('coordinate-reference-system');
  let crsFactoriesNames = owner.knownNamesForType('coordinate-reference-system');
  return Ember.A(crsFactoriesNames.map((crsFactoryName) => {
    let crsFactory = Ember.get(crsFactories, crsFactoryName);
    return Ember.get(crsFactory, 'code');
  }));
};

/**
  Get crs code

  @method getCrsCode
  @param {Object} crs Coordinate reference system.
  @param {Object} that.
  @returns {String} Сoordinate reference system code
*/
let getCrsCode = function (crs, that) {
  let _availableCoordinateReferenceSystemsCodes = getAvailableCoordinateReferenceSystemsCodes(that);

  let crsCode = Ember.get(crs, 'code');
  if (!Ember.isBlank(crsCode) && !_availableCoordinateReferenceSystemsCodes.contains(crsCode)) {
    let proj4CrsFactory = Ember.getOwner(that).knownForType('coordinate-reference-system', 'proj4');
    crsCode = Ember.get(proj4CrsFactory, 'code');
  }

  return crsCode;
};

export {
  getCrsByName,
  getCrsCode,
  getAvailableCoordinateReferenceSystemsCodes
};
