/**
  @module ember-flexberry-gis
*/

/**
  Define custom proections forproj4.

  @for ApplicationInitializer
  @method proj4crs.initialize
  @param {<a href="http://emberjs.com/api/classes/Ember.Application.html">Ember.Application</a>} application Ember application.
*/
export function initialize(application) {
  proj4.defs([
    [
      'EPSG:32640',
      '+proj=utm +zone=40 +datum=WGS84 +units=m +no_defs'
    ],
    [
      'EPSG:59001',
      '+proj=tmerc +lat_0=0 +lon_0=53.55 +k=1 +x_0=1250000 +y_0=-5914743.504 +ellps=krass +units=m +no_defs +towgs84=23.57,-140.95,-79.8,0.0,0.35,0.79,0.22'
    ],
    [
      'EPSG:59002',
      '+proj=tmerc +lat_0=0 +lon_0=56.55 +k=1 +x_0=2250000 +y_0=-5914743.504 +ellps=krass +units=m +no_defs'+
      ' +towgs84=23.57,-140.95,-79.8,0.0,0.35,0.79,-0.22'
    ],
    [
      'EPSG:59003',
      '+proj=tmerc +lat_0=0 +lon_0=59.55 +k=1 +x_0=3250000 +y_0=-5914743.504 +ellps=krass +units=m +no_defs +towgs84=23.57,-140.95,-79.8,0.0,0.35,0.79,0.22'
    ]
  ]);
}

export default {
  name: 'proj4crs',
  initialize
};