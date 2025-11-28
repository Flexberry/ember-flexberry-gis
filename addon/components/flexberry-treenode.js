import Ember from 'ember';
import FlexberryTreenode from 'ember-flexberry/components/flexberry-treenode';

const flexberryClassNamesPrefix = 'flexberry-treenode';
const flexberryClassNames = {
  header: flexberryClassNamesPrefix + '-header',
  content: flexberryClassNamesPrefix + '-content'
};

export default FlexberryTreenode.extend({
  _expandedDidChange: Ember.observer('_expanded', function () {
    let $treeNode = this.$();
    if (Ember.isNone($treeNode)) {
      return;
    }

    let expand = function ($element) {
      let active = Ember.$.fn.accordion.settings.className.active;
      if (!Ember.isNone($element) && !$element.hasClass(active)) {
        $element.addClass(active);
      }
    };

    let collapse = function ($element) {
      let active = Ember.$.fn.accordion.settings.className.active;
      if (!Ember.isNone($element) && $element.hasClass(active)) {
        $element.removeClass(active);
      }
    };

    // если this.get('_expanded') is null, то не трогаем
    if (this.get('_expanded') === true) {
      expand($treeNode.children(`.${flexberryClassNames.header}`).first());
      expand($treeNode.children(`.${flexberryClassNames.content}`).first());
    }

    if (this.get('_expanded') === false) {
      collapse($treeNode.children(`.${flexberryClassNames.header}`).first());
      collapse($treeNode.children(`.${flexberryClassNames.content}`).first());
    }
  })
});
