import Ember from 'ember';
import config from '../config/environment';

const version = config.APP.version;

/**
  Application controller.

  @class ApplicationController
  @extends <a href="http://emberjs.com/api/classes/Ember.Controller.html">Ember.Controller</a>
*/
export default Ember.Controller.extend({
  actions: {
    /**
      Toggles application sitemap's side bar.

      @method actions.toggleSidebar
    */
    toggleSidebar() {
      Ember.$('.ui.sidebar').sidebar('toggle');
    }
  },

  /**
    Currernt addon version.

    @property addonVersion
    @type String
  */
  addonVersion: version,

  /**
    Link to GitHub commit related to current addon version.

    @property addonVersionHref
    @type String
  */
  addonVersionHref: Ember.computed('addonVersion', function() {
    let addonVersion = this.get('addonVersion');
    let commitSha = addonVersion.split('+')[1];

    return 'https://github.com/Flexberry/ember-flexberry-gis/commit/' + commitSha;
  }),

  /**
    Flag: indicates whether current browser is internet explorer.

    @property browserIsInternetExplorer
    @type Boolean
  */
  browserIsInternetExplorer: Ember.computed(function() {
    let userAgent = window.navigator.userAgent;

    return userAgent.indexOf('MSIE ') > 0 || userAgent.indexOf('Trident/') > 0 || userAgent.indexOf('Edge/') > 0;
  }),

  /**
    Locales supported by application.

    @property locales
    @type String[]
    @default ['ru', 'en']
  */
  locales: ['ru', 'en'],

  /**
    Initializes controller.
  */
  init() {
    this._super(...arguments);

    let i18n = this.get('i18n');
    if (Ember.isNone(i18n)) {
      return;
    }

    // If i18n.locale is long value like 'ru-RU', 'en-GB', ... this code will return short variant 'ru', 'en', etc.
    let shortCurrentLocale = this.get('i18n.locale').split('-')[0];
    let availableLocales = Ember.A(this.get('locales'));

    // Force current locale to be one of available,
    // if browser's current language is not supported by dummy application,
    // or if browser's current locale is long value like 'ru-RU', 'en-GB', etc.
    if (!availableLocales.contains(shortCurrentLocale)) {
      i18n.set('locale', 'en');
    } else {
      i18n.set('locale', shortCurrentLocale);
    }
  },

  /**
    Application sitemap.

    @property sitemap
    @type Object
  */
  sitemap: Ember.computed('i18n.locale', function() {
    let i18n = this.get('i18n');

    return {
      nodes: [{
        link: 'index',
        caption: i18n.t('forms.application.sitemap.index.caption'),
        title: i18n.t('forms.application.sitemap.index.title'),
        children: null
      }, {
        link: null,
        caption: i18n.t('forms.application.sitemap.gis-objects.caption'),
        title: i18n.t('forms.application.sitemap.gis-objects.title'),
        children: [{
          link: 'new-platform-flexberry-g-i-s-map-l',
          caption: i18n.t('forms.application.sitemap.gis-objects.new-platform-flexberry-g-i-s-map-l.caption'),
          title: i18n.t('forms.application.sitemap.gis-objects.new-platform-flexberry-g-i-s-map-l.title'),
          children: null
        }, {
          link: 'maps',
          caption: i18n.t('forms.application.sitemap.gis-objects.maps.caption'),
          title: i18n.t('forms.application.sitemap.gis-objects.maps.title'),
          children: null
        }]
      }, {
        link: null,
        caption: i18n.t('forms.application.sitemap.components-examples.caption'),
        title: i18n.t('forms.application.sitemap.components-examples.title'),
        children: [{
          link: null,
          caption: i18n.t('forms.application.sitemap.components-examples.flexberry-ddau-checkbox.caption'),
          title: i18n.t('forms.application.sitemap.components-examples.flexberry-ddau-checkbox.title'),
          children: [{
            link: 'components-examples/flexberry-ddau-checkbox/settings-example',
            caption: i18n.t('forms.application.sitemap.components-examples.flexberry-ddau-checkbox.settings-example.caption'),
            title: i18n.t('forms.application.sitemap.components-examples.flexberry-ddau-checkbox.settings-example.title'),
            children: null
          }]
        }, {
          link: null,
          caption: i18n.t('forms.application.sitemap.components-examples.flexberry-tree.caption'),
          title: i18n.t('forms.application.sitemap.components-examples.flexberry-tree.title'),
          children: [{
            link: 'components-examples/flexberry-tree/settings-example',
            caption: i18n.t('forms.application.sitemap.components-examples.flexberry-tree.settings-example.caption'),
            title: i18n.t('forms.application.sitemap.components-examples.flexberry-tree.settings-example.title'),
            children: null
          }]
        }, {
          link: null,
          caption: i18n.t('forms.application.sitemap.components-examples.flexberry-layerstree.caption'),
          title: i18n.t('forms.application.sitemap.components-examples.flexberry-layerstree.title'),
          children: [{
            link: 'components-examples/flexberry-layerstree/settings-example',
            caption: i18n.t('forms.application.sitemap.components-examples.flexberry-layerstree.settings-example.caption'),
            title: i18n.t('forms.application.sitemap.components-examples.flexberry-layerstree.settings-example.title'),
            children: null
          }]
        }]
      }, {
        link: null,
        caption: i18n.t('forms.application.sitemap.integration-examples.caption'),
        title: i18n.t('forms.application.sitemap.integration-examples.title'),
        children: null
      }]
    };
  })
});
