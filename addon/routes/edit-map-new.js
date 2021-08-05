/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import EditMapRoute from './edit-map';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';

/**
  Edit new map route.
  Creates map project & layers of related layers hierarchy.

  @class EditMapNewRoute
  @extends EditMapRoute
*/
export default EditMapRoute.extend({
  /**
    Name of template to be rendered.

    @property templateName
    @type String
    @default null
  */
  templateName: null,

  /**
    [Model hook](http://emberjs.com/api/classes/Ember.Route.html#method_model) that returns a map project for current route.
    Additionally loads layers according to metadata param.

    @method model
    @param {Object} params
    @param {Object} transition
    @return {*} Model of map project for current route.
  */
  model(params, transition) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let mapProject = this.store.createRecord(this.get('modelName'), { id: generateUniqueId() });
      mapProject.set('mapLayer', Ember.A());

      if (Ember.isPresent(params.metadata)) {
        this._getMetadata(params.metadata).then((metadata) => {
          this._addMetadata(mapProject, metadata);
          resolve(mapProject);
        }).catch((error) => {
          reject(error);
        });
      } else {
        resolve(mapProject);
      }
    });
  },

  /**
    [Render template hook](http://emberjs.com/api/classes/Ember.Route.html#method_renderTemplate)
    that renders template for the current route.

    @method renderTemplate
    @param {Object} controller
    @param {Object} model
  */
  renderTemplate(controller, model) {
    let templateName = this.get('templateName');
    Ember.assert(
      `Wrong type of controller\`s \`templateName\` property: ` +
      `actual type is \`${Ember.typeOf(templateName)}\`, but \`string\` is expected.`,
      Ember.typeOf(templateName) === 'string');

    this.render(templateName, { model, controller });
  }
});
