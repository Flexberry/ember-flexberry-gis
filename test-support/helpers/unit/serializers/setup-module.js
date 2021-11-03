import $ from 'jquery';
import { moduleForModel as qunitModule } from 'ember-qunit';

export default function (fullName, description, options = {}) {
  const def = {
    needs: [
      'service:syncer',
      'transform:decimal',
      'transform:file',
      'transform:guid',
      'validator:alias',
      'validator:belongs-to',
      'validator:collection',
      'validator:confirmation',
      'validator:date',
      'validator:dependent',
      'validator:ds-error',
      'validator:exclusion',
      'validator:format',
      'validator:has-many',
      'validator:inclusion',
      'validator:length',
      'validator:messages',
      'validator:number',
      'validator:presence'
    ],
  };

  def.needs.pushObjects(options.needs || []);

  delete options.needs;

  const setupFn = options.setup;

  options.setup = function () {
    if (setupFn) {
      setupFn.apply(this, ...arguments);
    }
  };

  qunitModule(fullName, description, $.extend({}, def, options));
}
