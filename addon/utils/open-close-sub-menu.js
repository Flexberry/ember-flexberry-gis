import { isNone } from '@ember/utils';
import { next } from '@ember/runloop';

export default function openCloseSubmenu(context, moreButton, elements, incTop, decLeft) {
  const isHidden = context.get('isSubmenu');
  context.set('isSubmenu', !isHidden);

  if (!isHidden) {
    const element = elements[0];
    const topMainButtons = window.document.getElementsByClassName('main-map-tab-bar')[0].getBoundingClientRect().top;
    next(() => {
      // Устанавливаем фиксированное позиционирование для подменю, чтобы не зависеть от внешнего контенера.
      let { top, } = moreButton[0].getBoundingClientRect();
      const { left, } = moreButton[0].getBoundingClientRect();
      if (topMainButtons <= (top + 1 + element.getBoundingClientRect().height)) {
        element.className = 'more submenu reversed';
        top = top - element.getBoundingClientRect().height + 18;
      } else {
        element.className = 'more submenu ';
      }

      element.style.position = 'fixed';
      element.style.left = `${left - (isNone(decLeft) ? 0 : decLeft)}px`;
      element.style.top = `${top + incTop}px`;
    });
  }
}
