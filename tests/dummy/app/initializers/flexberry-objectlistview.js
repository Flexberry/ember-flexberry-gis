import FlexberryObjectlistview from 'ember-flexberry/components/flexberry-objectlistview';

export function initialize() {
  FlexberryObjectlistview.reopen({
    classNames: ['flexberry-objectlistview']
  });
}

export default {
  name: 'flexberry-objectlistview',
  initialize
};
