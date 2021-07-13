import Ember from 'ember';
/**
    Sets indexes for layers hierarchy.

    @method setIndexes
    @param {Array} rootArray Array of layers to set indexes.
  */
let setIndexes = (rootArray, hierarchy) => {

  // Filter root array to avoid gaps in indexes.
  let index = rootArray.filter(layer => layer.get('isDeleted') === false).length;

  _setIndexes(hierarchy, index);
};

/**
  Sets indexes for layers hierarchy.

  @method _setIndexes
  @param {Array} layers Hierarchy of layers to set indexes.
  @param {Int} index Max index.
  @returns {Int} Min index.
  @private
*/
let _setIndexes = (layers, index) => {
  if (Ember.isArray(layers) && index > 0) {
    layers.forEach((layer) => {
      if (!layer.get('isDeleted')) {
        layer.set('index', index);
        index--;
        if (Ember.isArray(layer.get('layers'))) {
          index = _setIndexes(layer.get('layers'), index);
        }
      }
    });
  }

  return index;
};

export { setIndexes };
