import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['drag-box', 'flexberry-drag-box'],

  classNameBindings: ['additionalClassName'],

  additionalClassName: null,

  container: null,

  zIndex: 500,

  top: null,

  bottom: null,

  left: null,

  right: null,

  visible: false,

  resizable: false,

  clearPositionOnHide: true,

  setVisibility: Ember.observer('visible', function () {
    this.$().css('display', this.get('visible') ? '' : 'none');

    if (!this.get('visible') && this.get('clearPositionOnHide')) {
      this.$().css('inset', '');

      const top = this.get('top');
      const right = this.get('right');
      const bottom = this.get('bottom');
      const left = this.get('left');

      if (!Ember.isNone(top)) {
        this.$().css('top', top);
      }

      if (!Ember.isNone(bottom)) {
        this.$().css('bottom', bottom);
      }

      if (!Ember.isNone(left)) {
        this.$().css('left', left);
      }

      if (!Ember.isNone(right)) {
        this.$().css('right', right);
      }
    }
  }),

  setStyle: Ember.observer('zIndex', '_selectedLayer', function () {
    this.$().css('z-index', this.get('zIndex'));
  }),

  didInsertElement() {
    let container = this.get('container');
    if (Ember.isNone(container)) {
      return;
    }

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

    // Patching JQuery-ui draggable() for position:absolute
    let __dx;
    let __dy;
    let __recoupLeft, __recoupTop;
    const that = this;
    this.$().draggable({
      containment: container,
      drag: function (event, ui) {
        //resize bug fix ui drag `enter code here`
        __dx = ui.position.left - ui.originalPosition.left;
        __dy = ui.position.top - ui.originalPosition.top;
        ui.position.left = ui.originalPosition.left + __dx;
        ui.position.top = ui.originalPosition.top + __dy;

        ui.position.left += __recoupLeft;
        ui.position.top += __recoupTop;
      },
      start: function (event, ui) {
        that.$(this).css('cursor', 'pointer');
        //resize bug fix ui drag
        let left = parseInt(that.$(this).css('left'), 10);
        left = isNaN(left) ? 0 : left;
        let top = parseInt(that.$(this).css('top'), 10);
        top = isNaN(top) ? 0 : top;
        __recoupLeft = left - ui.position.left;
        __recoupTop = top - ui.position.top;
      },
      create: function (event, ui) {
        that.$(this).attr('oriLeft', that.$(this).css('left'));
        that.$(this).attr('oriTop', that.$(this).css('top'));
      },
    });

    if (this.get('resizable')) {
      this.$().resizable();
    }

    this.setVisibility();
  },
});
