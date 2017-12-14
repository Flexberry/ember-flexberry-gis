import Ember from 'ember';

export default Ember.Component.extend({
  /**
    Observes changhes in application's current locale, and refreshes some GUI related to it.

    @method localeDidChange
    @private
  */
  _localeDidChange: Ember.observer('i18n.locale', function() {
    this.$('.mapItems .default.text').text(this.get('i18n').t('forms.gis-search-form.layer-metadata.select-a-map'));
  }),

  /**
    Initializes page's DOM-related properties.
  */
  didInsertElement() {
    this._super(...arguments);

    // Initialize Semantic UI tabs.
    this.$('.tabular.menu .item').tab();

    // Initialize Semantic UI dropdown.
    this.$('.mapItems').dropdown();

    // Initialize Semantic UI accordion.
    this.$('.ui.accordion').accordion();
  },

  /**
    Deinitializes page's DOM-related properties.
  */
  willDestroyElement() {
    // Deinitialize Semantic UI tabs.
    this.$('.tabular.menu .item').tab('destroy');

    // Deinitialize Semantic UI dropdown.
    this.$('.mapItems').dropdown('destroy');

    // Deinitialize Semantic UI accordion.
    this.$('.ui.accordion').accordion('destroy');

    this._super(...arguments);
  }
});
