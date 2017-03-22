/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DynamicActionObject from '../objects/dynamic-action';
import { render } from '../utils/string';
import { getRecord } from '../utils/extended-get';

// Validates helper's properties.
// Not a helper member, so yuidoc-comments are unnecessary.
let validateHelperProperties = function(args, hash) {
  Ember.assert(
    'Exactly two unnamed arguments must be passed to \`get-with-dynamic-actions\` helper.',
    args.length === 2);

  let propertyOwner = args[0];
  Ember.assert(
    `Wrong type of \`get-with-dynamic-actions\` helper\`s first argument: ` +
    `actual type is \`${Ember.typeOf(propertyOwner)}\`, but \`object\` or \`instance\` is expected.`,
    Ember.typeOf(propertyOwner) === 'object' || Ember.typeOf(propertyOwner) === 'instance');

  let propertyName = args[1];
  Ember.assert(
    `Wrong type of \`get-with-dynamic-actions\` helper\`s second argument: ` +
    `actual type is \`${Ember.typeOf(propertyName)}\`, but \`string\` is expected.`,
    Ember.typeOf(propertyName) === 'string');

  let hierarchyPropertyName = Ember.get(hash, 'hierarchyPropertyName');
  Ember.assert(
    `Wrong type of \`get-with-dynamic-actions\` helper\`s \`hierarchyPropertyName\` property: ` +
    `actual type is \`${Ember.typeOf(hierarchyPropertyName)}\`, but \`string\` is expected.`,
    Ember.isNone(hierarchyPropertyName) || Ember.typeOf(hierarchyPropertyName) === 'string');

  let dynamicActions = Ember.get(hash, 'dynamicActions');
  Ember.assert(
    `Wrong type of \`get-with-dynamic-actions\` helper\`s \`dynamicActions\` property: ` +
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
      renderedActionArguments[i] = render(actionArgument, {
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
  {{!-- Without custom "path" keyword (default keyword "path" will be used) --}}
  {{flexberry-tree
    nodes=(get-with-dynamic-actions this "treeNodes"
      hierarchyPropertyName="nodes"
      dynamicActions=(array
        (hash
          on="headerClick"
          actionName="onTreenodeHeaderClick"
          actionArguments=(array "{% path %}")
        )
        (hash
          on="checkboxChange"
          actionName="onTreenodeCheckboxChange"
          actionArguments=(array "{% path %}.checkboxValue")
        )
      )
    )
  }}

  {{!-- With custom "path" keyword --}}
  {{flexberry-tree
    nodes=(get-with-dynamic-actions this "treeNodes"
      hierarchyPropertyName="nodes"
      pathKeyword="nodePath"
      dynamicActions=(array
        (hash
          on="headerClick"
          actionName="onTreenodeHeaderClick"
          actionArguments=(array "{% nodePath %}")
        )
        (hash
          on="checkboxChange"
          actionName="onTreenodeCheckboxChange"
          actionArguments=(array "{% nodePath %}.checkboxValue")
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
    Name of those property which must be retrieved from owner & returned from helper
    (after dynamic actions binding).

    @property _rootPropertyName
    @type String
    @private
  */
  _rootPropertyName: null,

  /**
    Name of nested property (inside retrieved one), through which
    child object/objects (objects hierarchy) is/are available.

    @property _hierarchyPropertyName
    @type String
    @private
  */
  _hierarchyPropertyName: null,

  /**
    Dynamic actions, which will be binded to object/objects retrieved from the
    {{#crossLink "GetWithDynamicActionsHelper/_rootPropertyOwner:property"}}owner{{/crossLink}}
    (and to all nested child objects).

    @property _dynamicActions
    @type DynamicActionObject[]
    @private
  */
  _dynamicActions: null,

  /**
    Array with objects containing names of hierarchy properties and observer handlers related to them.
    Each object in array has following structure: { propertyPath: '...', observerHandler: function() { ... } }.

    @property _hierarchyPropertiesObservers
    @type Object[]
    @default null
    @private
   */
  _hierarchyPropertiesObservers: null,

  /**
    Adds observer for given hierarchy property, which will force helper to recompute
    on any changes in the specified hierarchy property.

    @method _addHierarchyPropertyObserver
    @param {String} propertyPath Path to observable property.
    @private
  */
  _addHierarchyPropertyObserver(propertyPath) {
    let hierarchyPropertiesObservers = this.get('_hierarchyPropertiesObservers');
    if (Ember.isNone(hierarchyPropertiesObservers)) {
      hierarchyPropertiesObservers = Ember.A();
      this.set('_hierarchyPropertiesObservers', hierarchyPropertiesObservers);
    }

    let observer = hierarchyPropertiesObservers.find((observer) => {
      return Ember.get(observer, 'propertyPath') === propertyPath;
    });
    if (Ember.isNone(observer)) {
      observer = {
        propertyPath: propertyPath,
        referenceObserver: null,
        arrayObserver: null
      };
      hierarchyPropertiesObservers.pushObject(observer);
    }

    let arrayObserver = {
      arrayWillChange: (arr, start, removeCount, addCount) => {
        // Remove observers from removing properties (while properties still exists).
        for (let i = start; removeCount > 0 && i < start + removeCount; i++) {
          let removingPropertyPath = `${propertyPath}.${i}`;

          this._removeHierarchyPropertiesObservers({
            propertyPathStartsWith: removingPropertyPath
          });
        }
      },

      arrayDidChange: (arr, start, removeCount, addCount) => {
        // Bind dynamic actions for added property, and rebind for following ones (till the end of array), or
        // rebind dynamic actions for properties following after removed ones (till the end of array).
        for (let i = start, len = arr.length; i < len; i++) {
          let addedOrMovedPropertyPath = `${propertyPath}.${i}`;
          let addedOrMovedPropertyValue = getRecord(this, `_rootPropertyOwner.${addedOrMovedPropertyPath}`);

          this._bindDynamicActions({
            propertyPath: addedOrMovedPropertyPath,
            propertyValue: addedOrMovedPropertyValue
          });
        }
      }
    };

    let referenceObserver = () => {
      let rootPropertyOwner = this.get('_rootPropertyOwner');
      let propertyValue = getRecord(rootPropertyOwner, propertyPath);

      // Property-object reference changed.
      // Remove old observers.
      this._removeHierarchyPropertiesObservers({
        propertyPathStartsWith: propertyPath
      });

      // Bind dynamic actions for new property-object.
      // It will add new observers.
      this._bindDynamicActions({
        propertyValue: propertyValue,
        propertyPath: propertyPath
      });
    };

    let rootPropertyOwner = this.get('_rootPropertyOwner');
    let propertyValue = getRecord(rootPropertyOwner, propertyPath);

    // Observe property reference.
    if (Ember.isNone(Ember.get(observer, 'referenceObserver'))) {
      Ember.set(observer, 'referenceObserver', referenceObserver);
      Ember.addObserver(rootPropertyOwner, propertyPath, referenceObserver);
    }

    // Observe property content.
    if (Ember.isArray(propertyValue) && Ember.isNone(Ember.get(observer, 'arrayObserver'))) {
      Ember.set(observer, 'arrayObserver', referenceObserver);
      propertyValue.addArrayObserver(arrayObserver);
    }
  },

  /**
    Removes all previously attached to hierarchy properties observers.

    @method _removeHierarchyPropertiesObservers
    @param {Object} options Method options.
    @param {String} options.propertyPath Path to property from which observers must be removed.
    @param {String} options.propertyPathStartsWith Prefix of path to properties from which observers must be removed.
    @private
  */
  _removeHierarchyPropertiesObservers(options) {
    options = options || {};
    let propertyPath =  Ember.get(options, 'propertyPath');
    let propertyPathStartsWith = Ember.get(options, 'propertyPathStartsWith');
    let observerCanBeRemoved = function(observer) {
      let observerPropertyPath = Ember.get(observer, 'propertyPath');

      return Ember.isNone(propertyPath) && Ember.isNone(propertyPathStartsWith) ||
        Ember.typeOf(propertyPath) === 'string' && observerPropertyPath === propertyPath ||
        Ember.typeOf(propertyPathStartsWith) === 'string' && observerPropertyPath.indexOf(propertyPathStartsWith) === 0;
    };

    let rootPropertyOwner = this.get('_rootPropertyOwner');
    let hierarchyPropertiesObservers = this.get('_hierarchyPropertiesObservers');
    let len = hierarchyPropertiesObservers.length;
    while (--len >= 0) {
      let observer = hierarchyPropertiesObservers[len];
      if (!observerCanBeRemoved(observer)) {
        break;
      }

      let observerPropertyPath = Ember.get(observer, 'propertyPath');
      let observerPropertyValue = getRecord(rootPropertyOwner, observerPropertyPath);

      let referenceObserver = Ember.get(observer, 'referenceObserver');
      Ember.removeObserver(rootPropertyOwner, observerPropertyPath, referenceObserver);

      let arrayObserver = Ember.get(observer, 'arrayObserver');
      if (Ember.isArray(observerPropertyValue)) {
        observerPropertyValue.removeArrayObserver(arrayObserver);
      }

      hierarchyPropertiesObservers.removeAt(len);
    }

    if (hierarchyPropertiesObservers.length === 0) {
      this.set('_hierarchyPropertiesObservers', null);
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
    let propertyIsObservable = Ember.get(options, 'propertyIsObservable');

    let hierarchyPropertyName = this.get('_hierarchyPropertyName');
    let dynamicActions = this.get('_dynamicActions');

    if (propertyIsObservable !== false) {
      // Add property observer to force helper recompute, if some new objects appear/remove in hierarchy.
      this._addHierarchyPropertyObserver(`${propertyPath}`);
    }

    if (Ember.isNone(propertyValue)) {
      return;
    }

    // If property is array, then attach dynamic actions for each object in array.
    if (Ember.isArray(propertyValue)) {
      for (let i = 0, len = propertyValue.length; i < len; i++) {
        this._bindDynamicActions({
          propertyValue: propertyValue.objectAt(i),
          propertyPath: `${propertyPath}.${i}`,

          // Don't observe properties containing inside arrays,
          // it's unnecessary, because whole array has special observer.
          propertyIsObservable: false
        });
      }

      return;
    }

    // Here 'propertyValue' is strict an object or an instance.
    Ember.assert(
      `Wrong type of \`${propertyPath}\` property retrieved through \`get-with-dynamic-actions\` helper: ` +
      `actual type is \`${Ember.typeOf(propertyValue)}\`, but \`object\` or \`instance\` is expected.`,
      Ember.typeOf(propertyValue) === 'object' || Ember.typeOf(propertyValue) === 'instance');

    // Prepare & add dynamic actions for current 'propertyValue' (which is always object or instance here).
    if (Ember.isArray(dynamicActions)) {
      let preparedDynamicActions = Ember.A();

      for (let i = 0, len = dynamicActions.length; i < len; i++) {
        let dynamicAction = dynamicActions[i];

        let argumentsRenderingContext = {};
        argumentsRenderingContext[this.get('_pathKeyword')] = propertyPath;

        // Helper shouldn't mutate given data, so we need to create new dynamic action with modified properties.
        let preparedDynamicAction = DynamicActionObject.create({
          on: Ember.get(dynamicAction, 'on'),
          actionHandler: Ember.get(dynamicAction, 'actionHandler'),
          actionName: Ember.get(dynamicAction, 'actionName'),

          // Use 'rootPropertyOwner' as action context (if context is not defined explicitly).
          actionContext: Ember.get(dynamicAction, 'actionContext') || this.get('_rootPropertyOwner'),

          // Perform template substitutions inside action arguments.
          actionArguments: getRenderedDynamicActionArguments(
            Ember.get(dynamicAction, 'actionArguments'),
            argumentsRenderingContext)
        });

        preparedDynamicActions.pushObject(preparedDynamicAction);
      }

      Ember.set(propertyValue, 'dynamicActions', preparedDynamicActions);
    }

    // Recursively bind dynamic actions to nested child properties.
    if (!Ember.isBlank(hierarchyPropertyName) && Ember.typeOf(hierarchyPropertyName) === 'string') {
      this._bindDynamicActions({
        propertyValue: Ember.get(propertyValue, hierarchyPropertyName),
        propertyPath: `${propertyPath}.${hierarchyPropertyName}`
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
    let pathKeyword = Ember.get(hash, 'pathKeyword') || 'path';
    let dynamicActions = Ember.get(hash, 'dynamicActions');

    this.set('_rootPropertyOwner', propertyOwner);
    this.set('_rootPropertyName', propertyName);
    this.set('_hierarchyPropertyName', hierarchyPropertyName);
    this.set('_pathKeyword', pathKeyword);
    this.set('_dynamicActions', dynamicActions);

    let propertyValue = Ember.get(propertyOwner, propertyName);
    this._bindDynamicActions({
      propertyValue: propertyValue,
      propertyPath: propertyName,
    });

    return propertyValue;
  },

  /**
    Destroys helper.
  */
  willDestroy() {
    this._super(...arguments);

    this._removeHierarchyPropertiesObservers();
    this.set('_rootPropertyOwner', null);
    this.set('_dynamicActions', null);
  }
});
