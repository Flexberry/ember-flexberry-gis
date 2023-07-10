import OlvToolbar from 'ember-flexberry/components/olv-toolbar';

export function initialize() {
  OlvToolbar.reopen({
    classNames: ['flexberry-olv-toolbar']
  });
}

export default {
  name: 'olv-toolbar',
  initialize
};
