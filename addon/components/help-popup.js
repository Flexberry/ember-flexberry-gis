import Ember from 'ember';
import layout from '../templates/components/help-popup';

export default Ember.Component.extend({
  layout,

  /**
    See [EmberJS API](https://emberjs.com/api/).

    @property classNames
  */
  classNames: ['ui', 'basic', 'help-button'],

  /**
    See [EmberJS API](https://emberjs.com/api/).

    @property tagName
  */
  tagName: 'button',

  /**
    See [EmberJS API](https://emberjs.com/api/).

    @property attributeBindings
  */
  attributeBindings: ['message:data-content', 'htmlMessage:data-html', 'variation:data-variation', 'position:data-position'],

  /**
    Popup message.

    @property message
    @type String
    @default
  */
  message: '',

  htmlMessage: '',

  small: false,

  /**
    See [EmberJS API](https://emberjs.com/api/).

    @method didInsertElement
  */
  didInsertElement() {
    this._super(...arguments);
    this.$().popup({
      on: 'hover',
      hoverable: true,
      transition: 'fade',
      className: { popup: `ui popup help-popup ${this.get('small') ? 'small' : ''}` }
    });
  }
});
