import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['drag-box', 'flexberry-drag-box'],

  classNameBindings: ['additionalClassName'],

  additionalClassName: null,

  container: null,

  zIndex: 999,

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
    const container = this.get('container');

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
    const containmentElem = Ember.$(container)[0];
    let absoluteOffsetLeft;
    let absoluteOffsetTop;
    const borderWidth = 6;
    const borderHeight = 6;
    this.$().draggable({
      containment: container,
      start: function (event, ui) {
        let left = parseInt(ui.helper.css('left'), 10);
        left = isNaN(left) ? 0 : left;
        let top = parseInt(ui.helper.css('top'), 10);
        top = isNaN(top) ? 0 : top;

        // Вычисляем правильное смещение при position:absolute
        absoluteOffsetLeft = left - ui.position.left;
        absoluteOffsetTop = top - ui.position.top;
      },
      drag: function (event, ui) {
        // Применяем смещение
        const newLeft = ui.position.left + absoluteOffsetLeft;
        const newTop = ui.position.top + absoluteOffsetTop;

        // Ограничиваем выход за границы, встроенный draggable.containment не учитывает transform()
        ui.position.left = Math.min(newLeft, containmentElem.clientWidth - ui.helper.context.clientWidth - borderWidth);
        ui.position.top = Math.min(newTop, containmentElem.clientHeight - ui.helper.context.clientHeight - borderHeight);
      },
    });

    if (this.get('resizable')) {
      this.$().resizable();
    }

    this.setVisibility();
  },
});
