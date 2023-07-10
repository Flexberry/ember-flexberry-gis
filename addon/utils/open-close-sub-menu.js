import Ember from 'ember';

export default function openCloseSubmenu(context, moreButton, elements, incTop, decLeft) {
  const isHidden = context.get('isSubmenu');
  context.set('isSubmenu', !isHidden);

  if (!isHidden) {
    const element = elements[0];
    const { top: mapTop, left: mapLeft } = window.document.getElementsByClassName('flexberry-map')[0].getBoundingClientRect();
    const topMainButtons = window.document.getElementsByClassName('main-map-tab-bar')[0].getBoundingClientRect().top;
    Ember.run.next(() => {
      // Устанавливаем фиксированное позиционирование для подменю, чтобы не зависеть от внешнего контенера.
      let { top, left, width } = moreButton[0].getBoundingClientRect();
      if (topMainButtons <= (top + 1 + element.getBoundingClientRect().height)) {
        element.className = 'more submenu reversed';
        top = top - element.getBoundingClientRect().height + 18;
      } else {
        element.className = 'more submenu ';
      }

      element.style.position = 'fixed';
      element.style.top = `${top + incTop - mapTop}px`;

      const isMobile = context.get('isMobile');
      if (!isMobile) {
        element.style.left = `${left - (Ember.isNone(decLeft) ? 0 : decLeft) - mapLeft}px`;
      } else {
        element.firstElementChild.style.textAlign = 'right';
        element.style.left = `${left - element.getBoundingClientRect().width + width}px`;

        window.document.addEventListener('click', function(e) {
          if (context.get('isSubmenu')) {
            context.set('isSubmenu', false);
          }
        }, { once: true });
      }
    });
  }
}

