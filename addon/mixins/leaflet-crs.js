/**
  @module ember-flexberry-gis
*/

import { computed } from '@ember/object';

import Mixin from '@ember/object/mixin';
import {
  getLeafletCrs
} from '../utils/leaflet-crs';

/**
  Mixin containing logic which builds leaflet coordinate reference system (CRS).

  @class LeafletCrsMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Mixin.create({
  /**
    Leaflet CRS relies on 'coordinateReferenceSystem' property,
    which  is CRS must be a serialized JSON with the following structure: { code: '...', definition: '...' },
    'code' is necessary CRS code, 'definition' is optional CRS definition in Proj4 format.

    @property crs
    @type <a href="http://leafletjs.com/reference-1.0.0.html#crs">L.CRS</a>
    @readOnly
  */
  crs: computed('coordinateReferenceSystem', function () {
    const coordinateReferenceSystem = this.get('coordinateReferenceSystem');

    return getLeafletCrs(coordinateReferenceSystem, this);
  }),
});
