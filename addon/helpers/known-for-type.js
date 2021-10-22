/**
  @module ember-flexberry-gis
*/

import { getOwner } from '@ember/application';

import Helper from '@ember/component/helper';

/**
  Known for type helper.
  Returns a flag is specified class are known in current application

  @class KnownForTypeHelper
  @extends <a href="http://emberjs.com/api/classes/Ember.Helper.html">Ember.Helper</a>

  Usage:
  templates/my-form.hbs
  ```handlebars
  {{if (known-for-type 'component' 'some-specific-component')}}
    {{component 'some-specific-component'}}
  {{/#if}}
  ```
*/
export default Helper.extend({
  compute([type, name]) {
    return getOwner(this).isKnownNameForType(type, name);
  }
});
