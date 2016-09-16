import Ember from 'ember';
import DS from 'ember-data';
import BaseModel from 'ember-flexberry/models/base';
import Proj from 'ember-flexberry-data';

let Model = BaseModel.extend({
  name: DS.attr('string'),
  type: DS.attr('string'),
  visibility: DS.attr('boolean'),
  settings: DS.attr('string'),
  coordinateReferenceSystem: DS.attr('string'),
  index: DS.attr('number'),
  parent: DS.belongsTo('new-platform-flexberry-g-i-s-map-layer', { inverse: null, async: false }),

  settingsAsObject: Ember.computed('settings', function () {
    let stringToDeserialize = this.get('settings');
    if (!Ember.isBlank(stringToDeserialize)) {
      return JSON.parse(stringToDeserialize);
    }
    return {};
  }),

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
  }),

  layers: null
});

Model.defineProjection('MapLayerE', 'new-platform-flexberry-g-i-s-map-layer', {
  name: Proj.attr('Name'),
  type: Proj.attr('Type'),
  visibility: Proj.attr('Visibility'),
  settings: Proj.attr('Settings'),
  coordinateReferenceSystem: Proj.attr('CRS'),
  index: Proj.attr('Index'),
  parent: Proj.belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Parent layer', {
    name: Proj.attr('Name', {
      hidden: true
    })
  }, {
    displayMemberPath: 'name'
  })
});

Model.defineProjection('MapLayerL', 'new-platform-flexberry-g-i-s-map-layer', {
  name: Proj.attr('Name'),
  type: Proj.attr('Type'),
  visibility: Proj.attr('Visibility')
});

export default Model;
