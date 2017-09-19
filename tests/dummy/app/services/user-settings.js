/**
  @module ember-flexberry-gis-dummy
*/

import UserSettingsService from 'ember-flexberry/services/user-settings';

/**
  Application user settings service.

  @class UserSettingsService
  @extends <a href="http://emberjs.com/api/classes/Ember.Service.html">Ember.Service</a>
*/
export default UserSettingsService.extend({
  /**
    User name.

    @property userName
    @type String
    @default 'admin'
    @for _userSettingsService
  **/
  userName: 'admin',

  /**
    Returns current user name.
    Method must be overridden if application uses some authentication.

    @method getCurrentUser
    @return {String} Current user name.
  */
  getCurrentUser() {
    let user = this.get('userName');
    return user;
  }
});
