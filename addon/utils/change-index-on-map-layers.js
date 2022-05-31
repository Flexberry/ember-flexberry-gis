import { isArray } from '@ember/array';

/**
  Sets indexes for layers hierarchy.

  @method _setIndexes
  @param {Array} layers Hierarchy of layers to set indexes.
  @param {Int} index Max index.
  @returns {Int} Min index.
  @private
*/
const _setIndexes = (layers, index) => {
  if (isArray(layers) && index > 0) {
    layers.forEach((layer) => {
      if (!layer.get('isDeleted')) {
        layer.set('index', index);
        index -= 1;
        if (isArray(layer.get('layers'))) {
          index = _setIndexes(layer.get('layers'), index);
        }
      }
    });
  }

  return index;
};

/**
  Sets indexes for layers hierarchy.

  @method setIndexes
  @param {Array} rootArray Array of layers to set indexes.
*/
const setIndexes = (rootArray, hierarchy) => {
  // Filter root array to avoid gaps in indexes.
  const index = rootArray.filter((layer) => layer.get('isDeleted') === false).length;

  _setIndexes(hierarchy, index);
};

export { setIndexes };
