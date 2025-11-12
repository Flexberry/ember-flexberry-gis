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

    if (this.get('_expanded')) {
      expand($treeNode.children(`.${flexberryClassNames.header}`).first());
      expand($treeNode.children(`.${flexberryClassNames.content}`).first());
    }
  })
});
