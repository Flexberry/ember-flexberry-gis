/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Component for editing of layer settings that are kept as string but must be edited as object.

  @example
  In order to add component following template can be used:
  ```handlebars
  {{new-platform-flexberry-g-i-s-map-layer-setting
    value=model.settingsAsObject
    linkToFieldValue=model.type
    renderInto='new-platform-flexberry-g-i-s-map-layer-edit'
    saveValueToFieldName='settings'
  }}
  ```

  @class NewPlatformFlexberryGISMapLayerSettingComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Object value that is necessary to display on component.

    @property value
    @type Object
  */
  value: undefined,

  /**
    Name of model's field where updated value (as string) has to be saved to.

    @property saveValueToFieldName
    @type String
  */
  saveValueToFieldName: undefined,

  /**
    Name of model's field where updated value (as string) has to be saved to.

    @property linkToFieldValue
    @type String
  */
  linkToFieldValue: undefined,

  /**
    Name of action to handle setting value that should be displayed.
    Action will be send out of the component.

    @property renderMainTemplate
    @type String
    @default 'renderMainTemplate'
  */
  renderMainTemplate: 'renderMainTemplate',

  /**
    Name of current template where component is placed and where it will rerender forms.

    @property renderInto
    @type String
  */
  renderInto: undefined,

  /**
    It is called when the element of the view has been inserted into the DOM or after the view was re-rendered.
    For more information see [didInsertElement](http://emberjs.com/api/classes/Ember.Component.html#event_didInsertElement) event of [Ember.Component](http://emberjs.com/api/classes/Ember.Component.html).
  */
  didInsertElement() {
    this._super(...arguments);
    this._linkToFieldChanged();
    this.addObserver('linkToFieldValue', this, this._linkToFieldChanged);
  },

  /**
    Called when the element of the view is going to be destroyed.
    For more information see [willDestroyElement](http://emberjs.com/api/classes/Ember.Component.html#event_willDestroyElement) event of [Ember.Component](http://emberjs.com/api/classes/Ember.Component.html).
  */
  willDestroyElement() {
    this.removeObserver('linkToFieldValue', this, this._linkToFieldChanged);
  },

  /**
    It renders proper form corresponding to current data.

    @method _linkToFieldChanged
    @private
  */
  _linkToFieldChanged() {
    let renderInto = this.get('renderInto');
    Ember.assert('renderInto should be defined', renderInto);

    let saveValueToFieldName = this.get('saveValueToFieldName');
    Ember.assert('saveValueToFieldName should be defined', saveValueToFieldName);

    let linkToFieldValue = this.get('linkToFieldValue');
    let value = this.get('value');

    this.sendAction('renderMainTemplate', linkToFieldValue, value, renderInto, saveValueToFieldName);
  }
});
