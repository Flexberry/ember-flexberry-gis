/**
  @module ember-flexberry-gis-dummy
*/

import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';

/**
  Application store.

  @class Store
  @extends <a href="http://emberjs.com/api/data/classes/DS.Store.html">DS.Store</a>
  @uses StoreMixin
*/
export default DS.Store.reopen(Projection.StoreMixin);
