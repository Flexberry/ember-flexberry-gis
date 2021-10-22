import Component from '@ember/component';
import layout from '../../../templates/components/layers-dialogs/settings/tile-vector';

export default Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Overridden ['tagName'](http://emberjs.com/api/classes/Ember.Component.html#property_tagName)
    is empty to disable component's wrapping <div>.

    @property tagName
    @type String
    @default ''
  */
  tagName: '',

  /**
    Editing layer deserialized type-related settings.

    @property settings
    @type Object
    @default null
  */
  settings: null,
});
