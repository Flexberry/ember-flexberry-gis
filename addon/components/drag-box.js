import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['drag-box', 'flexberry-drag-box'],

  classNameBindings: ['additionalClassName'],

  additionalClassName: null,

  container: null,

  zIndex: 3000,

  top: null,

  bottom: null,

  left: null,

  right: null,

  visible: false,

  setVisibility: Ember.observer('visible', function () {
    this.$().css('display', this.get('visible') ? '' : 'none');

    if (!this.get('visible')) {
      this.$().css('inset', '');

      if (!Ember.isNone(this.get('top'))) {
        this.$().css('top', this.get('top'));
      } else if (!Ember.isNone(this.get('bottom'))) {
        this.$().css('bottom', this.get('bottom'));
      }

      if (!Ember.isNone(this.get('left'))) {
        this.$().css('left', this.get('left'));
      } else if (!Ember.isNone(this.get('right'))) {
        this.$().css('right', this.get('right'));
      }
    }
  }),

  setStyle: Ember.observer('zIndex', '_selectedLayer', function () {
    this.$().css('z-index', this.get('zIndex'));
  }),

  didInsertElement() {
    let container = this.get('container');
    if (!Ember.isNone(container)) {
      Ember.$(container).css('position', 'relative');
      this.$().appendTo(Ember.$(container));

      if (!Ember.isNone(this.get('zIndex'))) {
        this.$().css('z-index', this.get('zIndex'));
      }

      if (!Ember.isNone(this.get('top'))) {
        this.$().css('top', this.get('top'));
      } else if (!Ember.isNone(this.get('bottom'))) {
        this.$().css('bottom', this.get('bottom'));
      }

      if (!Ember.isNone(this.get('left'))) {
        this.$().css('left', this.get('left'));
      } else if (!Ember.isNone(this.get('right'))) {
        this.$().css('right', this.get('right'));
      }

      this.$().css('position', 'absolute');
      this.$().dragOrResize({ mode: 'drag', containment: container });

      this.setVisibility();
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    this.$().dragOrResize('destroy');
  },
});
