/* jshint node: true */

module.exports = function (environment) {
  var backendUrl = 'http://134.209.30.115:1818';

  if (environment === 'development-loc') {
    // Use `ember server --environment=development-loc` command for local backend usage.
    backendUrl = 'http://localhost:6500';
  }

  if (environment === 'mssql-backend') {
    // Use `ember server --environment=mssql-backend` command for mssql backend usage.
    backendUrl = 'https://flexberry-gis-test-stand.azurewebsites.net';
  }

  if (environment === 'production') {
    if (process.argv.indexOf('--postfix=-mssql') >= 0) {
      backendUrl = 'https://flexberry-gis-test-stand.azurewebsites.net';
    }
  }

  var ENV = {
    repositoryName: 'ember-flexberry-gis',
    modulePrefix: 'dummy',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      backendUrl: backendUrl,

      // It's a custom property, used to prevent duplicate backend urls in sources.
      backendUrls: {
        root: backendUrl,
        api: backendUrl + '/odata'
      },

      // Log service settings.
      log: {
        // Flag: indicates whether log service is enabled or not.
        enabled: false
      },

      // Flag: indicates whether to use user settings service or not.
      useUserSettingsService: false,

      // Custom property with offline mode settings.
      offline: {
        dbName: 'ember-flexberry-gis-dummy',

        // Flag that indicates whether offline mode in application is enabled or not.
        offlineEnabled: false,

        // Flag that indicates whether to switch to offline mode when got online connection errors or not.
        modeSwitchOnErrorsEnabled: false,

        // Flag that indicates whether to sync down all work with records when online or not.
        // This let user to continue work without online connection.
        syncDownWhenOnlineEnabled: false,
      },
    },

    userSettings: {
      // Max opacity values for geometries
      maxGeometryOpacity: 0.65,
      maxGeometryFillOpacity: 0.2
    }
  };

  // Read more about ember-i18n: https://github.com/jamesarosen/ember-i18n.
  ENV.i18n = {
    // Should be defined to avoid ember-i18n deprecations.
    // Locale will be changed then to navigator current locale (in instance initializer).
    defaultLocale: 'en'
  };

  // Read more about ember-moment: https://github.com/stefanpenner/ember-moment.
  // Locale will be changed then to same as ember-i18n locale (and will be changed every time when i18n locale changes).
  ENV.moment = {
    outputFormat: 'L'
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // Keep test console output quieter.
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    // Configure production version settings here.
  }

  // Read more about CSP:
  // http://www.ember-cli.com/#content-security-policy
  // https://github.com/rwjblue/ember-cli-content-security-policy
  // http://content-security-policy.com
  ENV.contentSecurityPolicy = {
    'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
    'font-src': "'self' data: https://fonts.gstatic.com",
    'connect-src': "'self' " + ENV.APP.backendUrls.root
  };

  // Change paths to application assets if build has been started with the following parameters:
  // ember build --gh-pages --brunch=<brunch-to-publish-on-gh-pages>.
  if (process.argv.indexOf('--gh-pages') >= 0) {
    var brunch;
    var postfix = "";

    // Retrieve brunch name and postfix from process arguments.
    process.argv.forEach(function(value, index) {
      if (value.indexOf('--brunch=') >=0) {
        brunch=value.split('=')[1];
        return;
      }

      if (value.indexOf('--postfix=') >=0) {
        postfix=value.split('=')[1];
        return;
      }
    });

    // Change base URL to force paths to application assets be relative.
    ENV.baseURL = '/' + ENV.repositoryName + '/' + brunch + postfix + '/';
    ENV.locationType = 'hash';
  }

  return ENV;
};
