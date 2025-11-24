import Ember from 'ember';
import layout from '../templates/components/success-modal';

export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  isFadingOut: false,
  extraClass: '',
  autoClose: true,

  iconClass: 'success',

  init() {
    this._super();

    const duration = this.get('duration');
    const router = Ember.getOwner(this).lookup('router:main');

    this.set('router', router);

    if (this.get('autoClose')) {
      this._closeTimer = Ember.run.later(
        this,
        () => {
          this.send('closeModal');
        },
        duration
      );
    }
  },

  currentPathDidChange: Ember.observer('router.currentPath', function () {
    const onClose = this.get('onClose');
    if (onClose) {
      onClose();
    }
  }),

  willDestroyElement() {
    this._super();

    if (this._closeTimer) {
      Ember.run.cancel(this._closeTimer);
    }
  },

  actions: {
    closeModal(timer = 200) {
      const onClose = this.get('onClose');

      this.set('isFadingOut', true);

      Ember.run.later(
        this,
        () => {
          if (onClose) {
            onClose();
          }
        },
        timer
      );
    },
  },
});
