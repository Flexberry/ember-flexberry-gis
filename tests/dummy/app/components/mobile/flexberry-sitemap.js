/**
  @module ember-flexberry
*/

import { translationMacro as t } from 'ember-i18n';
import FlexberrySitemapComponent from '../flexberry-sitemap';
import Ember from 'ember';

/**
  Component for sitemap render from the object with links.

  @example
    templates/my-form.hbs
    ```handlebars
    {{flexberry-sitemap sitemap=sitemap}}
    ```

  @class FlexberrySitemapComponent
  @extends <a href="https://emberjs.com/api/ember/release/classes/Component">Component</a>
*/
export default FlexberrySitemapComponent.extend({

  /**
    Component's parent menu caption.

    @property parent
    @type String
    @default t('forms.application.sitemap.main-menu.caption')
  */
  parent: t('forms.application.sitemap.main-menu.caption'),

  /**
    Called when the element of the view has been inserted into the DOM or after the view was re-rendered.
    [More info](https://emberjs.com/api/ember/release/classes/Component#event_didInsertElement).

    @method didInsertElement
  */
  didInsertElement() {
    this._super(...arguments);
    if (this.isDropDown) {
      Ember.$(this.element).dropdown({
        maxSelections: 1,
        transition: 'slide left',
        onChange: () => {
          let selectedItem = Ember.$(this.element).closest('.main.menu').find('.active.selected');
          if (selectedItem.length > 0) {
            selectedItem.removeClass('active selected');
          }
        }
      });
    }
  },

  actions: {
    /**
      Back in menu.

      @method actions.menuBack
    */
    menuBack() {
      if (Ember.get(this, 'isDropDown')) {
        Ember.$(this.element).dropdown('hide');
      } else {
        Ember.$('> .menu.visible', this.element).transition('slide left');
      }
    }
  },
});
