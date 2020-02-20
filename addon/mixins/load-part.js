import Ember from 'ember';

export default Ember.Mixin.create({
  /**
    Loads features of layer.
  
    @method loadPart
    @param {Object} layer.
    @param {Object[]} featureIds Array of id feature.
    @return {Promise} Returns promise
  */
  loadFeaturesOfLayer(layer, featureIds) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletObject = Ember.get(layer, '_leafletObject');
      if (!leafletObject.options.showExisting) {
        let loadIds = [];
        leafletObject.eachLayer((shape) => {
          const id = this._getLayerFeatureId(layer, shape);
    
          if (!Ember.isNone(id) && featureIds.indexOf(id) !== -1) {
            loadIds.push(id);
          }
        });
    
        if (loadIds.length !== featureIds.length) {
          let remainingFeat = featureIds.filter((item) => {
            return loadIds.indexOf(item) == -1;
          });
    
          let filter = null;
          if (!Ember.isNone(remainingFeat)) {
            let equals = Ember.A();
            remainingFeat.forEach((id) => {
              let pkField = this._getPkField(layer);
              if (featureIds.includes(id)) {
                equals.pushObject(new L.Filter.EQ(pkField, id));
              }
            });
    
            filter = new L.Filter.Or(...equals);
          }
    
          leafletObject.loadFeatures(filter);
          leafletObject.once('load', (layers) => {
            resolve(leafletObject);
          });
        } else {
          resolve(leafletObject);
        }
      } else {
        resolve(leafletObject);
      }
    });
  },

  /**
    Get features of layer.
  
    @method loadPart
    @param {Object} layer.
    @param {Object[]} featureIds Array of id feature.
    @return {Promise} Returns promise
  */
  getFeaturesOfLayer(layer, featureIds) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletObject = Ember.get(layer, '_leafletObject');
      if (!leafletObject.options.showExisting) {
        let filter = null;
        if (Ember.isArray(featureIds) && !Ember.isNone(featureIds)) {
          let equals = Ember.A();
          featureIds.forEach((id) => {
            let pkField = this._getPkField(layer);
            equals.pushObject(new L.Filter.EQ(pkField, id));
          });

          filter = new L.Filter.Or(...equals);
        }

        L.Util.request({
          url: leafletObject.options.url,
          data: L.XmlUtil.serializeXmlDocumentString(leafletObject.getFeature(filter)),
          headers: leafletObject.options.headers || {},
          withCredentials: leafletObject.options.withCredentials,
          success: function (responseText) {
            let exceptionReport = L.XmlUtil.parseOwsExceptionReport(responseText);
            if (exceptionReport) {
              reject(exceptionReport.message);
            }

            let layers = leafletObject.readFormat.responseToLayers(responseText, {
              coordsToLatLng: leafletObject.options.coordsToLatLng,
              pointToLayer: leafletObject.options.pointToLayer
            });

            resolve(layers);
          },
          error: function (errorMessage) {
            reject(errorMessage);
          }
        });
      } else {
        if (Ember.isArray(featureIds) && !Ember.isNone(featureIds)) {
          let objects = [];
          featureIds.forEach((id) => {
            let features = leafletObject._layers;
            let obj = Object.values(features).find(feature => {
              return this._getLayerFeatureId(layer, feature) === id;
            });
            if (!Ember.isNone(obj)) {
              objects.push(obj);
            }
          });
          resolve(objects);
        } else {
          resolve(Object.values(leafletObject._layers));
        }
      }
    });
  }
});
