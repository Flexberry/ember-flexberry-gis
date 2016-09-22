/**
  @module ember-flexberry-gis
*/

import ListFormRoute from 'ember-flexberry/routes/list-form';

/**
  List map route.

  @class ListMapRoute
  @extends ListFormRoute
*/
export default ListFormRoute.extend({
  /**
    Name of model projection to be used as record's properties limitation.

    @property modelProjection
    @type String
    @default 'MapL'
  */
  modelProjection: 'MapL',

  /**
    Name of model to be used as form's record type.

    @property modelName
    @type String
    @default 'new-platform-flexberry-g-i-s-map'
  */
  modelName: 'new-platform-flexberry-g-i-s-map',

  developerUserSettings: { NewPlatformFlexerryGISMapL: {} }
});
