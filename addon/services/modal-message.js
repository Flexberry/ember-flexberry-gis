import Ember from 'ember';

export default Ember.Service.extend({
  show: false,
  messageCaption: '',
  messageText: '',
  applicationController: null,

  init() {
    this._super(...arguments);
    const container = Ember.getOwner(this).lookup('controller:application');
    this.set('applicationController', container);
  },

  showModal(options) {
    const controller = this.get('applicationController');

    const onClose = function () {
      controller.set('isModalVisible', false);
      if (options.onClose) {
        options.onClose();
      }
    };

    controller.setProperties({
      isModalVisible: true,
      modalTitle: options.title,
      modalText: options.text,
      modalDuration: options.duration || 5000,
      modalOnClose: onClose,
      modalExtraClass: options.extraClass || '',
      modalAutoClose: options.autoClose === undefined ? true : options.autoClose,
    });
  },

  showWarningModal(options) {
    const controller = this.get('applicationController');

    const onClose = function () {
      controller.set('isWarningModalVisible', false);
      if (options.onClose) {
        options.onClose();
      }
    };

    controller.setProperties({
      isWarningModalVisible: true,
      warningModalText: options.text,
      warningModalOnClose: onClose,
    });
  },

  removeWarningModal() {
    const controller = this.get('applicationController');
    controller.set('isWarningModalVisible', false);
  },

  showErrorModal(options) {
    const controller = this.get('applicationController');

    controller.setProperties({
      isErrorModalVisible: true,
      errorModalTitle: options.title,
      errorModalText: options.text,
    });
  },

  setModalMessage(caption, text) {
    this.setProperties({
      show: true,
      messageCaption: caption,
      messageText: text,
    });
  },

  clearModalMessage() {
    this.setProperties({
      show: false,
      messageCaption: '',
      messageText: '',
    });
  },
});
