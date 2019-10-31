/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-maptoolbar';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-maptoolbar').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-maptoolbar').
  @readonly
  @static

  @for FlexberryMaptoolbarComponent
*/
const flexberryClassNamesPrefix = 'flexberry-maptoolbar';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix
};

/**
  Map toolbar component.
  Component must be used in combination with any map tool components as a wrapper for them.

  Usage:
  templates/my-map-form.hbs
  ```handlebars
  {{#flexberry-maptoolbar}}
    {{map-tools/base name="my-map-tool" leafletMap=leafletMap}}
  {{/flexberry-maptoolbar}}
  ```

  @class FlexberryMaptoolbarComponet
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
let FlexberryMaptoolbarComponent = Ember.Component.extend({
  /**
    Component's template reference.
  */
  layout,

  /**
    Reference to component's CSS-classes names.
    Must be also a component's instance property to be available from component's .hbs template.
  */
  flexberryClassNames,

  /**
    Component's wrapping <div> CSS-classes names.

    Any other CSS-classes can be added through component's 'class' property.
    ```handlebars
    {{flexberry-maptoolbar
      class="secondary"
    }}
    ```

    @property classNames
    @type String[]
    @default ['flexberry-maptoolbar', 'ui', 'menu']
  */
  classNames: [flexberryClassNames.wrapper, 'ui', 'menu']
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryMaptoolbarComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryMaptoolbarComponent;
