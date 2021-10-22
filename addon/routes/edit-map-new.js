/**
  @module ember-flexberry-gis
*/

import { assert } from '@ember/debug';

import { isPresent, typeOf } from '@ember/utils';
import { A } from '@ember/array';
import { Promise } from 'rsvp';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';
import EditMapRoute from './edit-map';

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
    return new Promise((resolve, reject) => {
      const mapProject = this.store.createRecord(this.get('modelName'), { id: generateUniqueId(), });
      mapProject.set('mapLayer', A());

      if (isPresent(params.metadata)) {
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
    const templateName = this.get('templateName');
    assert(
      'Wrong type of controller`s `templateName` property: '
      + `actual type is \`${typeOf(templateName)}\`, but \`string\` is expected.`,
      typeOf(templateName) === 'string'
    );

    this.render(templateName, { model, controller, });
  },
});
