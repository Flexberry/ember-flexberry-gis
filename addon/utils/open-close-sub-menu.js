import Ember from 'ember';

export default function openCloseSubmenu(context, moreButton, elements) {
  const isHidden = context.get('isSubmenu');
  context.set('isSubmenu', !isHidden);

  if (!isHidden) {
    const element = elements[0];
    const topMainButtons = window.document.getElementsByClassName('main-map-tab-bar')[0].getBoundingClientRect().top;
    Ember.run.next(() => {
      let { top } = moreButton[0].getBoundingClientRect();
      if (topMainButtons <= (top + element.getBoundingClientRect().height + 24)) {
        element.className = 'more submenu reversed';
      }
    });
    moreButton[0].parentElement.parentElement.addEventListener('mouseleave', function(e) {
      context.set('isSubmenu', false);
    }, { once: true });
  }
}

