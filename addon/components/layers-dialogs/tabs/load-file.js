import Component from '@ember/component';
import { translationMacro as t } from 'ember-i18n';
import layout from '../../../templates/components/layers-dialogs/tabs/load-file';

export default Component.extend({
  layout,

  loadButtonCaption: t('components.layers-dialogs.add.loadFile.load-button-caption'),

  /**
    Flag indicates whether import is in process or not.

    @property _importInProcess
    @type Boolean
    @default false
    @private
  */
  _importInProcess: false,

  actions: {
    /**
      Handles uploadFile.

      @method actions.uploadFile
    */
    uploadFile(e) {
      const file = e.target.files[0];
      this.set('_importInProcess', false);
      this.sendAction('onUploadFile', file);
    },

    /**
      Handles clickFile.

      @method actions.clickFile
    */
    clickFile() {
      this.set('_importInProcess', true);
    },
  },
});
