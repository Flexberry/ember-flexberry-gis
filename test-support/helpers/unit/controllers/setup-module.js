import $ from 'jquery';
import { moduleFor as qunitModule } from 'ember-qunit';

export default function (fullName, description, options = {}) {
  const def = {
    needs: [
      'service:app-state',
      'service:objectlistview-events',
      'service:can',
      'service:security',
      'service:session',
      'service:notifications',
      'service:modal-dialog-caller',
      'service:route-history',
      'service:user-settings',
      'controller:advlimit-dialog',
      'controller:filters-dialog',
      'controller:colsconfig-dialog',
      'service:advLimit',
      'ability:model'
    ],
  };

  def.needs.pushObjects(options.needs || []);

  delete options.needs;

  qunitModule(fullName, description, $.extend({}, def, options));
}
