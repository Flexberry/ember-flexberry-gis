/**
  @module ember-flexberry-gis-dummy
*/

import { A } from '@ember/array';

import { isNone } from '@ember/utils';
import { computed, observer } from '@ember/object';
import $ from 'jquery';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import config from '../config/environment';

const { version, } = config.APP;

/**
  Application controller.

  @class ApplicationController
  @extends <a href="http://emberjs.com/api/classes/Ember.Controller.html">Ember.Controller</a>
*/
export default Controller.extend({
  /**
    Service that triggers objectlistview events.

    @property objectlistviewEventsService
    @type Service
  */
  objectlistviewEventsService: service('objectlistview-events'),

  /**
    Service for managing the state of the application.
     @property appState
    @type AppStateService
  */
  appState: service(),

  actions: {
    /**
      Call `updateWidthTrigger` for `objectlistviewEventsService`.
      @method actions.updateWidth
    */
    updateWidth() {
      this.get('objectlistviewEventsService').updateWidthTrigger();
    },

    /**
      Toggles application sitemap's side bar.

      @method actions.toggleSidebar
    */
    toggleSidebar() {
      const sidebar = $('.ui.sidebar.main.menu');
      sidebar.sidebar('toggle');

      if ($('.inverted.vertical.main.menu').hasClass('visible')) {
        $('.sidebar.icon.text-menu-show').removeClass('hidden');
        $('.sidebar.icon.text-menu-hide').addClass('hidden');
        $('.bgw-opacity').addClass('hidden');
        $('.full.height').css({ transition: 'width 0.45s ease-in-out 0s', width: '100%', });
      } else {
        $('.sidebar.icon.text-menu-show').addClass('hidden');
        $('.sidebar.icon.text-menu-hide').removeClass('hidden');
        $('.bgw-opacity').removeClass('hidden');
        $('.full.height').css({ transition: 'width 0.3s ease-in-out 0s', width: `calc(100% - ${sidebar.width()}px)`, });
      }
    },

    /**
      Toggles application sitemap's side bar in mobile view.

      @method actions.toggleSidebarMobile
    */
    toggleSidebarMobile() {
      $('.ui.sidebar.main.menu').sidebar('toggle');

      if ($('.inverted.vertical.main.menu').hasClass('visible')) {
        $('.sidebar.icon.text-menu-show').removeClass('hidden');
        $('.sidebar.icon.text-menu-hide').addClass('hidden');
        $('.bgw-opacity').addClass('hidden');
      } else {
        $('.sidebar.icon.text-menu-show').addClass('hidden');
        $('.sidebar.icon.text-menu-hide').removeClass('hidden');
        $('.bgw-opacity').removeClass('hidden');
      }
    },
  },

  /**
    Flag: indicates that form to which controller is related designed for acceptance tests &
    all additional markup in application.hbs mustn't be rendered.

    @property isInAcceptanceTestMode
    @type Boolean
    @default false
  */
  isInAcceptanceTestMode: false,

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
  addonVersionHref: computed('addonVersion', function () {
    const addonVersion = this.get('addonVersion');
    const commitSha = addonVersion.split('+')[1];

    return `https://github.com/Flexberry/ember-flexberry/commit/${commitSha}`;
  }),

  /**
    Flag: indicates whether current browser is internet explorer.

    @property browserIsInternetExplorer
    @type Boolean
  */
  browserIsInternetExplorer: computed(function () {
    const { userAgent, } = window.navigator;

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
    Handles changes in userSettingsService.isUserSettingsServiceEnabled.

    @method _userSettingsServiceChanged
    @private
  */
  _userSettingsServiceChanged: observer('userSettingsService.isUserSettingsServiceEnabled', function () {
    this.get('target.router').refresh();
  }),

  /**
    Initializes controller.
  */
  init() {
    this._super(...arguments);

    const i18n = this.get('i18n');
    if (isNone(i18n)) {
      return;
    }

    // If i18n.locale is long value like 'ru-RU', 'en-GB', ... this code will return short variant 'ru', 'en', etc.
    const shortCurrentLocale = this.get('i18n.locale').split('-')[0];
    const availableLocales = A(this.get('locales'));

    // Force current locale to be one of available,
    // if browser's current language is not supported by dummy application,
    // or if browser's current locale is long value like 'ru-RU', 'en-GB', etc.
    if (!availableLocales.includes(shortCurrentLocale)) {
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
  sitemap: computed('i18n.locale', function () {
    const i18n = this.get('i18n');

    return {
      nodes: [{
        link: 'index',
        caption: i18n.t('forms.application.sitemap.index.caption'),
        title: i18n.t('forms.application.sitemap.index.title'),
        children: null,
      }, {
        link: null,
        caption: i18n.t('forms.application.sitemap.gis.caption'),
        title: i18n.t('forms.application.sitemap.gis.title'),
        children: [{
          link: 'maps',
          caption: i18n.t('forms.application.sitemap.gis.maps.caption'),
          title: i18n.t('forms.application.sitemap.gis.maps.title'),
          children: null,
        }, {
          link: 'new-platform-flexberry-g-i-s-layer-metadata-l',
          caption: i18n.t('forms.application.sitemap.gis.map-metadata.caption'),
          title: i18n.t('forms.application.sitemap.gis.map-metadata.title'),
          children: null,
        }, {
          link: 'gis-search-form',
          caption: i18n.t('forms.application.sitemap.gis.gis-search-form.caption'),
          title: i18n.t('forms.application.sitemap.gis.gis-search-form.title'),
          children: null,
        }, {
          link: 'new-platform-flexberry-g-i-s-map-object-setting-l',
          caption: i18n.t('forms.application.sitemap.map-object-setting.caption'),
          title: i18n.t('forms.application.sitemap.map-object-setting.title'),
          children: null,
        }],
      }, {
        link: null,
        caption: i18n.t('forms.application.sitemap.components-examples.caption'),
        title: i18n.t('forms.application.sitemap.components-examples.title'),
        children: [{
          link: 'components-examples/flexberry-boundingbox/settings-example',
          caption: i18n.t('forms.application.sitemap.components-examples.flexberry-boundingbox.caption'),
          title: i18n.t('forms.application.sitemap.components-examples.flexberry-boundingbox.title'),
          children: null,
        }],
      }],
    };
  }),
});
