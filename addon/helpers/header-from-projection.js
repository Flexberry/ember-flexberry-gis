/**
  @module ember-flexberry-gis
*/

import { isPresent } from '@ember/utils';

import { capitalize } from '@ember/string';
import { assert } from '@ember/debug';
import { observer, get } from '@ember/object';
import { inject as service } from '@ember/service';
import Helper from '@ember/component/helper';
import { getValueFromLocales } from 'ember-flexberry-data/utils/model-functions';

/**
  Header from projection helper.
  Returns an object composed of the model fields and their names in accordance with the projection and current locale.

  @class HeaderFromProjectionHelper
  @extends <a href="http://emberjs.com/api/classes/Ember.Helper.html">Ember.Helper</a>

  Usage:
  templates/my-form.hbs
  ```handlebars
  {{my-component header=(header-from-projection modelName='test' projectionName='testView')}}
  ```
*/
export default Helper.extend({

  /**
    Explicit injection of internalization service.
  */
  i18n: service('i18n'),

  /**
    Explicit injection of store service.
  */
  store: service('store'),

  /**
    Observer that recomputes the value of helper when locale changes.
  */
  _localeDidChange: observer('i18n.locale', function () {
    this.recompute();
  }),

  /**
    Generate the columns.

    @method _generateColumns
    @private
  */
  _generateColumns(attributes, columnsBuf, relationshipPath) {
    columnsBuf = columnsBuf || [];
    relationshipPath = relationshipPath || '';

    attributes.forEach((attrName) => {
      let currentRelationshipPath = relationshipPath;
      if (!Object.prototype.hasOwnProperty.call(attributes, attrName)) {
        return;
      }

      const attr = attributes[attrName];
      assert(`Unknown kind of projection attribute: ${attr.kind}`, attr.kind === 'attr' || attr.kind === 'belongsTo' || attr.kind === 'hasMany');
      switch (attr.kind) {
        case 'hasMany':
          break;

        case 'belongsTo':
          if (!attr.options.hidden) {
            const bindingPath = currentRelationshipPath + attrName;
            const column = this._createColumn(attr, attrName, bindingPath);

            if (column.cellComponent.componentName === undefined) {
              if (attr.options.displayMemberPath) {
                column.propName += `.${attr.options.displayMemberPath}`;
              } else {
                column.propName += '.id';
              }
            }

            columnsBuf.push(column);
          }

          currentRelationshipPath += `${attrName}.`;
          this._generateColumns(attr.attributes, columnsBuf, currentRelationshipPath);
          break;

        case 'attr': {
          if (attr.options.hidden) {
            break;
          }

          const bindingPath = currentRelationshipPath + attrName;
          const column = this._createColumn(attr, attrName, bindingPath);
          columnsBuf.push(column);
          break;
        }
        default:
      }
    });

    return columnsBuf;
  },

  /**
    Create the column.

    @method _createColumn
    @private
  */
  _createColumn(attr, attrName, bindingPath) {
    const key = this._createKey(bindingPath);
    const valueFromLocales = getValueFromLocales(this.get('i18n'), key);

    const column = {
      header: valueFromLocales || attr.caption || capitalize(attrName),
      propName: bindingPath, // TODO: rename column.propName
    };

    if (valueFromLocales) {
      column.keyLocale = key;
    }

    return column;
  },

  /**
    Create the key from locales.
  */
  _createKey(bindingPath) {
    const projection = this.get('modelProjection');
    const { modelName, } = projection;
    return `models.${modelName}.projections.${projection.projectionName}.${bindingPath}.__caption__`;
  },

  /**
    Overridden [Ember.Helper compute method](http://emberjs.com/api/classes/Ember.Helper.html#method_compute).
    Executes helper's logic, returns an object composed of the model fields and their names in accordance with the projection and current locale.

    @method compute
    @param {String[]} args Model name and projection name passed to helper
    @param {Object} hash Model name and projection name passed as hash
    @return {Object} Object.
  */
  compute(args, hash) {
    let modelName = null;
    let projectionName = null;

    if (args.length && args.length === 2) {
      [modelName, projectionName] = args;
    } else {
      modelName = get(hash, 'modelName');
      projectionName = get(hash, 'projectionName');
    }

    const modelClass = this.get('store').modelFor(modelName);
    assert(
      `Unable to find a model with name ${modelName}`,
      isPresent(modelClass)
    );
    const projection = modelClass.projections.get(projectionName);

    assert(
      `Unable to find a projection ${projectionName} in model ${modelName}`,
      isPresent(projection)
    );
    this.set('modelProjection', projection);

    const cols = this._generateColumns(projection.attributes);
    const result = {};
    cols.forEach(function (item) {
      result[item.propName] = item.header.string;
    });
    return result;
  },
});
