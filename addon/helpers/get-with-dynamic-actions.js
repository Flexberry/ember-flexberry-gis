/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DynamicActionObject from '../objects/dynamic-action';
import renderString from '../utils/render-string';

// Validates helper's properties.
// Not a helper member, so yuidoc-comments are unnecessary.
let validateHelperProperties = function(args, hash) {
  Ember.assert(
    'Exactly two unnamed arguments must be passed to \`get-with-dynamic-actions\` helper.',
    args.length === 2);

  let propertyOwner = args[0];
  Ember.assert(
    `Wrong type of \`get-with-dynamic-actions\` helper's first argument: ` +
    `actual type is \`${Ember.typeOf(propertyOwner)}\`, but \`object\` or \`instance\` is expected.`,
    Ember.typeOf(propertyOwner) === 'object' || Ember.typeOf(propertyOwner) === 'instance');

  let propertyName = args[1];
  Ember.assert(
    `Wrong type of \`get-with-dynamic-actions\` helper's second argument: ` +
    `actual type is \`${Ember.typeOf(propertyName)}\`, but \`string\` is expected.`,
    Ember.typeOf(propertyName) === 'string');

  let hierarchyPropertyName = Ember.get(hash, 'hierarchyPropertyName');
  Ember.assert(
    `Wrong type of \`get-with-dynamic-actions\` helper's \`hierarchyPropertyName\` property: ` +
    `actual type is \`${Ember.typeOf(hierarchyPropertyName)}\`, but \`string\` is expected.`,
    Ember.isNone(hierarchyPropertyName) || Ember.typeOf(hierarchyPropertyName) === 'string');

  let dynamicActions = Ember.get(hash, 'dynamicActions');
  Ember.assert(
    `Wrong type of \`get-with-dynamic-actions\` helper's \`dynamicActions\` property: ` +
    `actual type is \`${Ember.typeOf(dynamicActions)}\`, but \`array\` is expected.`,
    Ember.isNone(dynamicActions) || Ember.isArray(dynamicActions));
};

// Returns new action arguments array where template-like substrings in string arguments
// are replaced with related context's properties.
// Not a helper member, so yuidoc-comments are unnecessary.
let getRenderedDynamicActionArguments = function(actionArguments, renderingContext) {
  if (!Ember.isArray(actionArguments)) {
    return Ember.A();
  }

  // Some action arguments could be a strings with following substrings (templates) inside them: {% path %}.
  // We should replace these templates with context's related properties (current object's path instead of {% path %}, etc.),
  // before arguments will be binded to dynamic actions.
  let renderedActionArguments = [];
  for (let i = 0, len = actionArguments.length; i < len; i++) {
    let actionArgument = actionArguments[i];
    if (Ember.typeOf(actionArgument) === 'string') {
      renderedActionArguments[i] = renderString(actionArgument, {
        context: renderingContext,
        delimiters: ['{%', '%}']
      });
    } else {
      renderedActionArguments[i] = actionArgument;
    }
  }

  return renderedActionArguments;
};

/**
  Get with dynamic actions helper.
  Retrieves property with the specified name from the specified object
  (exactly as [standard get helper](http://emberjs.com/api/classes/Ember.Templates.helpers.html#method_get) does),
  and additionally binds dynamic actions for retrieved property's nested object/objects
  (even if retrieved property has hierarchical structure).

  Helper must be used with those component's,
  which consumes their inner structure as [JSON-object](http://www.json.org/)
  or [Ember-object](http://emberjs.com/api/classes/Ember.Object.html)
  and there is no way to attach action handlers for their nested component's explicitly in hbs-markup.

  @class GetWithDynamicActionsHelper
  @extends <a href="http://emberjs.com/api/classes/Ember.Helper.html">Ember.Helper</a>

  Usage:
  templates/my-form.hbs
  ```handlebars
  {{flexberry-tree
    nodes=(get-with-dynamic-actions this "treeNodes"
      hierarchyPropertyName="nodes"
      dynamicActions=(array
        (hash
          on="headerClick"
          actionName="onTreenodeHeaderClick"
          actionArguments=(array "{% propertyPath %}")
        )
        (hash
          on="checkboxChange"
          actionName="onTreenodeCheckboxChange"
          actionArguments=(array "{% propertyPath %}.checkboxValue")
        )
      )
    )
  }}
  ```

  controllers/my-form.js
  ```javascript
  import Ember from 'ember';
  import TreeNodeObject from 'ember-flexberry-gis/objects/flexberry-treenode';

  export default Ember.Controller.extend({
    treeNodes: Ember.A([
      FlexberryTreenodeObject.create({
        caption: 'Node 1 (with child nodes)',
        hasCheckbox: true,
        checkboxValue: false,
        iconClass: 'map icon',
        nodes: Ember.A([
          caption: 'Node 1.1 (leaf node)',
          hasCheckbox: true,
          checkboxValue: false,
          iconClass: 'apple icon',
          nodes: null
        ])
      }),
      FlexberryTreenodeObject.create({
        caption: 'Node 2 (leaf node)',
        hasCheckbox: true,
        checkboxValue: false,
        iconClass: 'compass icon',
        nodes: null
      })
    ]),

    actions: {
      onTreenodeHeaderClick(...args) {
        let treeNodePath = args[0];
        let treeNodeHeaderClickActionEventObject = args[args.length - 1];

        console.log('Clicked tree node\'s properties:', this.get(treeNodePath));
        console.log('Clicked tree node\'s \'headerClick\' action event object:', treeNodeHeaderClickActionEventObject);
      },

      onTreenodeCheckboxChange(...args) {
        let treeNodeCheckboxValuePath = args[0];
        let treeNodeCheckboxChangeActionEventObject = args[args.length - 1];

        // Change tree node's 'checkboxValue' property. 
        this.set(treeNodeCheckboxValuePath, treeNodeCheckboxChangeActionEventObject.newValue);
      }
    }
  });
  ```
*/
export default Ember.Helper.extend({
  /**
    Owner of hierarchy root property.

    @property _rootPropertyOwner
    @type Object
    @default null
    @private
  */
  _rootPropertyOwner: null,

  /**
    Array with objects containing names hierarchy properties and observer handlers related to them.
    Each object in array has following structure: { propertyName: '...', propertyObserverHandler: function() { ... } }.

    @property _hierarchyPropertiesMetadata
    @type Object[]
    @default null
    @private
   */
  _hierarchyPropertiesMetadata: null,

  /**
    Adds observer for given hierarchy property, which will force helper to recompute
    on any changes in the specified hierarchy property.

    @method _addHierarchyPropertyObserver
    @param {String} propertyName Hierarchy property name.
    @private
  */
  _addHierarchyPropertyObserver(propertyName) {
    let hierarchyPropertiesMetadata = this.get('_hierarchyPropertiesMetadata');
    let rootPropertyOwner = this.get('_rootPropertyOwner');

    let observerHandler = () => {
      this.recompute();
    };

    Ember.addObserver(rootPropertyOwner, propertyName, observerHandler);
    hierarchyPropertiesMetadata.pushObject({
      propertyName: propertyName,
      propertyObserverHandler: observerHandler
    });
  },

  /**
    Removes all previously attached to hierarchy properties observers.

    @method _removeHierarchyPropertiesObservers
    @private
  */
  _removeHierarchyPropertiesObservers() {
    let hierarchyPropertiesMetadata = this.get('_hierarchyPropertiesMetadata');
    let rootPropertyOwner = this.get('_rootPropertyOwner');

    let len = hierarchyPropertiesMetadata.length;
    while(--len >= 0) {
      let metadata = hierarchyPropertiesMetadata[len];
      let propertyName = Ember.get(metadata, 'propertyName');
      let propertyObserverHandler = Ember.get(metadata, 'propertyObserverHandler');

      Ember.removeObserver(rootPropertyOwner, propertyName, propertyObserverHandler);
      hierarchyPropertiesMetadata.removeAt(len);
    }
  },

  /**
    Binds given dynamic actions to every object in the specified hierarchy.

    @method _bindDynamicActions
    @param {Object|Object[]} propertyValue Value of some property in the specified hierarchy.
    @param {String} propertyPath Path to property in the specified hierarchy.
    @param {String} Name of property that leads to nested child properties in the specified hierarchy.
    @param {DynamicAction[]} Specified dynamic actions.
    @private
  */
  _bindDynamicActions(options) {
    options = options || {};
    let propertyValue = Ember.get(options, 'propertyValue');
    let propertyPath = Ember.get(options, 'propertyPath');
    let hierarchyPropertyName = Ember.get(options, 'hierarchyPropertyName');
    let dynamicActions = Ember.get(options, 'dynamicActions');

    // Add & remember observer to force helper recompute, if some new objects appear in hierarchy.
      this._addHierarchyPropertyObserver(`${propertyPath}.[]`);

    if (Ember.isNone(propertyValue)) {
      return;
    }

    // If property is array, then attach dynamic action bindings for each object in array.
    if (Ember.isArray(propertyValue)) {
      for(let i = 0, len = propertyValue.length; i < len; i++) {
        let object = propertyValue[i];

        this._bindDynamicActions({
          propertyOwner: propertyValue,
          propertyValue: object,
          propertyPath: propertyPath + '.' + i,
          hierarchyPropertyName: hierarchyPropertyName,
          dynamicActions: dynamicActions
        });
      }

      return;
    }

    // Here 'propertyValue' must be strict an object or an instance.
    Ember.assert(
      `Wrong type of \`${propertyPath}\` property retrieved through \`get-with-action-bindings\` helper: ` +
      `actual type is \`${Ember.typeOf(propertyValue)}\`, but \`object\` or \`instance\` is expected.`,
      Ember.typeOf(propertyValue) === 'object' || Ember.typeOf(propertyValue) === 'instance');

    // Prepare & set dynamic action bindings for current 'propertyValue' (which is always object or instance here).
    if (Ember.isArray(dynamicActions)) {
      let preparedDynamicActions = Ember.A();

      for(let i = 0, len = dynamicActions.length; i < len; i++) {
        let dynamicAction = dynamicActions[i];

        // Helper shouldn't mutate given data, so we need to create new dynamic action with modified properties.
        let preparedDynamicAction = DynamicActionObject.create({
          on: Ember.get(dynamicAction, 'on'),
          actionHandler: Ember.get(dynamicAction, 'actionHandler'),
          actionName: Ember.get(dynamicAction, 'actionName'),

          // Use 'rootPropertyOwner' as action context (if context is not defined explicitly).
          actionContext: Ember.get(dynamicAction, 'actionContext') || this.get('_rootPropertyOwner'),

          // Perform template substitutions inside action arguments.
          actionArguments: getRenderedDynamicActionArguments(
            Ember.get(dynamicAction, 'actionArguments'), {
            propertyPath: propertyPath
          })
        });

        preparedDynamicActions.pushObject(preparedDynamicAction);
      }
      
      Ember.set(propertyValue, 'dynamicActions', preparedDynamicActions);
    }

    // Recursively bind dynamic actions to nested child objects.
    if (!Ember.isBlank(hierarchyPropertyName) && Ember.typeOf(hierarchyPropertyName) === 'string') {
      this._bindDynamicActions({
        propertyOwner: propertyValue,
        propertyValue: Ember.get(propertyValue, hierarchyPropertyName),
        propertyPath: propertyPath + '.' + hierarchyPropertyName,
        hierarchyPropertyName: hierarchyPropertyName,
        dynamicActions: dynamicActions
      });
    }
  },

  /**
    Overridden [Ember.Helper compute method](http://emberjs.com/api/classes/Ember.Helper.html#method_compute).
    Executes helper's logic, returns helper's value.

    @method compute
    @param {any[]} args [Helper arguments](https://guides.emberjs.com/v2.4.0/templates/writing-helpers/#toc_helper-arguments).
    @param {Object} args.0 Property owner, object containing property which must be retrieved & returned from helper
    (after dynamic action binding).
    Will be also used as action handlers context (if context wasn't specified explicitly in dynamic action bindings).
    @param {String} args.1 Name of those property which must be retrieved from owner & returned from helper
    (after dynamic actions binding).
    Owner's property (behind this name) must be an object or array of objects.
    @param {Object} [hash] Object containing
    [helper's named arguments](https://guides.emberjs.com/v2.4.0/templates/writing-helpers/#toc_named-arguments).
    @param {Object} [hash.hierarchyPropertyName] Name of nested property (inside retrieved one), through which
    child object/objects (objects hierarchy) will be available.
    @param {DynamicActionObject[]} [hash.dynamicActions] Dynamic actions, which will be binded
    to object/objects retrieved from the owner (and to all nested child objects).
    @return {Object|Object[]} Retrieved object/objects with binded dynamic actions (including nested child objects).
  */
  compute(args, hash) {
    validateHelperProperties(args, hash);

    let propertyOwner = args[0];
    let propertyName = args[1];
    let hierarchyPropertyName = Ember.get(hash, 'hierarchyPropertyName');
    let dynamicActions = Ember.get(hash, 'dynamicActions');

    this.set('_rootPropertyOwner', propertyOwner);

    let propertyValue = Ember.get(propertyOwner, propertyName);
    this._bindDynamicActions({
      propertyOwner: propertyOwner,
      propertyValue: propertyValue,
      propertyPath: propertyName,      
      hierarchyPropertyName: hierarchyPropertyName,
      dynamicActions: dynamicActions
    });

    return propertyValue;
  },

  /**
    Runs helper's {{#crossLink "GetWithDynamicActionsHelper/compute:method"}}'compute' method{{/crossLink}} again.
  */
  recompute() {
    this._removeHierarchyPropertiesObservers();

    this._super(...arguments);
  },

  /**
    Initializes helper.
  */
  init() {
    this._super(...arguments);

    this.set('_hierarchyPropertiesMetadata', Ember.A());
  },

  /**
    Destroys helper.
  */
  willDestroy() {
    this._super(...arguments);

    this._removeHierarchyPropertiesObservers();
    this.set('_rootPropertyOwner', null);
  }
});
