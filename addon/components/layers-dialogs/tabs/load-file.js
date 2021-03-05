import Ember from 'ember';
import layout from '../../../templates/components/layers-dialogs/tabs/load-file';
import { translationMacro as t } from 'ember-i18n';

export default Ember.Component.extend({
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
      let file = e.target.files[0];
      this.set('_importInProcess', false);
      this.sendAction('onUploadFile', file);
    },

    /**
      Handles clickFile.

      @method actions.clickFile
    */
    clickFile() {
      this.set('_importInProcess', true);
    }
  }
});
