import Ember from 'ember';
import BaseControl from './flexberry-base-control';

export default BaseControl.extend({
  leafletOptions: ['position', 'maxWidth', 'metric', 'imperial', 'updateWhenIdle'],

  createControl() {
    return L.control.scale(this.get('options'));
  }
});
