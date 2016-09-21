/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin containing logic which builds leaflet coordinate reference system (CRS).

  @class LeafletCrsMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  /**
    Leaflet CRS relies on 'coordinateReferenceSystem' property,
    which  is CRS must be a serialized JSON with the following structure: { code: '...', definition: '...' },
    'code' is necessary CRS code, 'definition' is optional CRS definition in Proj4 format.

    @property crs
    @type <a href="http://leafletjs.com/reference-1.0.0.html#crs">L.CRS</a>
    @readOnly
  */
  crs: Ember.computed('coordinateReferenceSystem', function () {
    let coordinateReferenceSystem = this.get('coordinateReferenceSystem');
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
    let owner = Ember.getOwner(this);
    if (Ember.isBlank(definition)) {
      // Only code is defined.
      // Try to find existing CRS with the same code.
      let availableCrsCodes =Ember.A();
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
        `Allowed values are: [\`${availableCrsCodes.join(`\`, \``)}\`].`,
        !Ember.isNone(crs));
    } else {
      // CRS has definition.
      // Try to create CRS from proj4.
      crs = owner.knownForType('coordinate-reference-system', 'proj4').create(code, definition);
    }

    return crs;
  })
});
