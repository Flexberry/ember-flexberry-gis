import Ember from 'ember';

export default Ember.Service.extend({
  /**
    Flag: indicates whether tool is performed when right-clicking on map.

    @property isRightClickToolAvailable
    @type Bool
    @default false
  */
  isRightClickToolAvailable: false,

  /**
    Map tool that should be enabled when right clicking

    @property rightClickToolName
    @type String
    @default 'identify-visible-rectangle'
  */
  rightClickToolName: 'identify-visible-rectangle',

  /**
    Right click map tool options

    @property rightClickToolProperties
    @type Object
    @default null
  */
  rightClickToolProperties: null,

  /**
    List of available tools for switching to rightClickTool-mode and saving active state of working tool after
    @property rightClickAvailiblePrevMapTools
    @type String []
  */
  rightClickAvailiblePrevMapTools: ['drag', 'zoom-in', 'zoom-out']
});
