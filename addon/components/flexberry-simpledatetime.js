import SimpleDatetime from 'ember-flexberry/components/flexberry-simpledatetime';
import layout from '../templates/components/flexberry-simpledatetime';
import Ember from 'ember';
/**
 * При встраивании компонента в Flexberry-treenode появилась проблема:
 *    клик на инпут каледаря, помимо открытия календаря, вызывал сворачивание/разворачивание самой ноды
 * Решение с добавлением календарю класса preventExpandCollapse не помогало, так как в этом случае переставала работать логика самого календаря
 * Это происходило из-за того, что клик на inpur срабатывал ПОСЛЕ обработчика клика по самому treenode,
 * т.к. обработчик в treenode был задан через DOM (onClick={{action ...}}) - а они ВСЕГДА срабатывают раньше, чем обработчики ember
 * Получается, что нам необходимо задать обработчики на Input и на кнопку также через DOM, чтобы они вызвались раньше, чем click на treenode
 * Обработчик на кнопку очистки переопределим в шаблоне (добавим onClick=...), а для Input зададим при создании
 */
export default SimpleDatetime.extend({
  layout,
  _flatpickr: null,

  /**
    Namespase for page event.
    @property eventNamespace
    @type String
  */
  eventNamespace: undefined,

  inputClick(_this, e) {
    e.stopPropagation();
    _this.sendAction('closeOtherCalendar');
    if (_this.get('canClick') && !(_this.get('useBrowserInput') && _this.get('currentTypeSupported')) && !_this.get('readonly')) {
      _this.set('canClick', false);
      _this.get('_flatpickr').open();
    }
  },

  click() {
    // Переопределим родительский метод, он тут не нужен. Будем вызывать событие через DOM - так оно сработает раньше
  },

  willDestroyElement() {
    this._super(...arguments);

    let namespace = this.get('eventNamespace');
    Ember.$(this.get('scrollSelectors').join()).off(`scroll.${namespace}`);
    Ember.$(document).off(`mousedown.${namespace}`);
  },

  _flatpickrCreate() {
    this._super(...arguments);

    let namespace = this.elementId;
    this.set('eventNamespace', namespace);
    Ember.$(document).on(`mousedown.${namespace}`, e => {
      let clicky = Ember.$(e.target);
      if (clicky.closest('.flatpickr-calendar').length === 0 && clicky.get(0) !== this.$('.custom-flatpickr').get(0)) {
        this.get('_flatpickr').close();
      }
    });
    this.$('.custom-flatpickr').on('click', (e) => { this.inputClick(this, e); });
    this.$('.button').on('click', (e) => { this.actions.remove(this, e); });
  }
});
