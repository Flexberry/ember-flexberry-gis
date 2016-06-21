import ListFormRoute from 'ember-flexberry/routes/list-form';

export default ListFormRoute.extend({
  /**
    Name of model projection to be used as record's properties limitation.

    @property modelProjection
    @type String
    @default 'MapL'
   */
  modelProjection: 'MapL',

  /**
    Name of model to be used as list's records types.

    @property modelName
    @type String
    @default 'new-platform-flexberry-g-i-s-map'
   */
  modelName: 'new-platform-flexberry-g-i-s-map'
});
