/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-flexberry-gis',

  included: function(app) {
    this._super.included.apply(this._super, arguments);

    // Extensions for jQuery 'hasClass' method ($('...').hasClass(...)).
    app.import('vendor/jquery.hasClass.extensions/jquery.hasClass.extensions.js');
  }
};
