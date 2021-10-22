import $ from 'jquery';
import { isNone } from '@ember/utils';
import { observer } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
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

  setVisibility: observer('visible', function () {
    this.$().css('display', this.get('visible') ? '' : 'none');

    if (!this.get('visible')) {
      this.$().css('inset', '');

      if (!isNone(this.get('top'))) {
        this.$().css('top', this.get('top'));
      } else if (!isNone(this.get('bottom'))) {
        this.$().css('bottom', this.get('bottom'));
      }

      if (!isNone(this.get('left'))) {
        this.$().css('left', this.get('left'));
      } else if (!isNone(this.get('right'))) {
        this.$().css('right', this.get('right'));
      }
    }
  }),

  setStyle: observer('zIndex', '_selectedLayer', function () {
    this.$().css('z-index', this.get('zIndex'));
  }),

  didInsertElement() {
    const container = this.get('container');
    if (!isNone(container)) {
      $(container).css('position', 'relative');
      this.$().appendTo($(container));

      if (!isNone(this.get('zIndex'))) {
        this.$().css('z-index', this.get('zIndex'));
      }

      if (!isNone(this.get('top'))) {
        this.$().css('top', this.get('top'));
      } else if (!isNone(this.get('bottom'))) {
        this.$().css('bottom', this.get('bottom'));
      }

      if (!isNone(this.get('left'))) {
        this.$().css('left', this.get('left'));
      } else if (!isNone(this.get('right'))) {
        this.$().css('right', this.get('right'));
      }

      this.$().css('position', 'absolute');
      this.$().dragOrResize({ mode: 'drag', containment: container, });

      this.setVisibility();
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    this.$().dragOrResize('destroy');
  },
});
