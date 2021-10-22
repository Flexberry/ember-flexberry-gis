## Module Report
### Unknown Global

**Global**: `Ember.none`

**Location**: `addon\map-commands\search-show.js` at line 51

```js
        let featureProperties = Ember.get(feature, 'properties') || {};

        let displayValue = Ember.none;
        displayProperty.forEach((prop) => {
          if (featureProperties.hasOwnProperty(prop)) {
```

### Unknown Global

**Global**: `Ember.none`

**Location**: `addon\map-commands\search-show.js` at line 51

```js
        let featureProperties = Ember.get(feature, 'properties') || {};

        let displayValue = Ember.none;
        displayProperty.forEach((prop) => {
          if (featureProperties.hasOwnProperty(prop)) {
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `addon\services\layers-styles-renderer.js` at line 44

```js
    let layerStyle = this.get(`_layersStyles.${type}`);
    if (Ember.isNone(layerStyle)) {
      Ember.Logger.error(`Service 'layers-styles-renderer' can't find '${type}' layers-style, it doesn't exist.`);
    }

```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `addon\services\layers-styles-renderer.js` at line 88

```js
    let layerStyle = this._getLayerStyle(type);
    if (Ember.isNone(layerStyle)) {
      Ember.Logger.error(`Service 'layers-styles-renderer' can't get default style settings for '${type}' layers-style.`);
      return null;
    }
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `addon\services\layers-styles-renderer.js` at line 110

```js
    let layerStyle = this._getLayerStyle(type);
    if (Ember.isNone(layerStyle)) {
      Ember.Logger.error(`Service 'layers-styles-renderer' can't get visible leaflet layers for  '${type}' layers-style.`);
      return [];
    }
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `addon\services\layers-styles-renderer.js` at line 132

```js
    let layerStyle = this._getLayerStyle(type);
    if (Ember.isNone(layerStyle)) {
      Ember.Logger.error(`Service 'layers-styles-renderer' can't render '${type}' layers-style on leaflet layer.`);
      return;
    }
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `addon\services\layers-styles-renderer.js` at line 156

```js
    let layerStyle = this._getLayerStyle(type);
    if (Ember.isNone(layerStyle)) {
      Ember.Logger.error(`Service 'layers-styles-renderer' can't render '${type}' layers-style on canvas.`);
      return;
    }
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `addon\services\markers-styles-renderer.js` at line 44

```js
    let markerStyle = this.get(`_markersStyles.${type}`);
    if (Ember.isNone(markerStyle)) {
      Ember.Logger.error(`Service 'markers-styles-renderer' can't find '${type}' markers-style, it doesn't exist.`);
    }

```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `addon\services\markers-styles-renderer.js` at line 88

```js
    let markerStyle = this._getMarkerStyle(type);
    if (Ember.isNone(markerStyle)) {
      Ember.Logger.error(`Service 'markers-styles-renderer' can't get default style settings for '${type}' markers-style.`);
      return null;
    }
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `addon\services\markers-styles-renderer.js` at line 113

```js
    let markerStyle = this._getMarkerStyle(type);
    if (Ember.isNone(markerStyle)) {
      Ember.Logger.error(`Service 'markers-styles-renderer' can't render '${type}' markers-style on leaflet marker.`);
      return;
    }
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `addon\services\markers-styles-renderer.js` at line 137

```js
    let markerStyle = this._getMarkerStyle(type);
    if (Ember.isNone(markerStyle)) {
      Ember.Logger.error(`Service 'markers-styles-renderer' can't render '${type}' markers-style on canvas.`);
      return;
    }
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `addon\components\legends\wms-legend.js` at line 36

```js
      let url = Ember.get(layerSettings, 'legendSettings.url') || Ember.get(layerSettings, 'url');
      if (Ember.isBlank(url)) {
        Ember.Logger.error(
          `Unable to compute legends for '${this.get('layer.name')}' layer, because both required settings 'url' and 'legendSettings.url' are blank`
        );
```

### Unknown Global

**Global**: `Ember.String`

**Location**: `addon\components\layers\odata-vector-layer.js` at line 1512

```js
        url: layerModel.get('_leafletObject.options.metadataUrl') + layerModel.get('_leafletObject.modelName') + '.json',
        success: function (dataClass) {
          let odataQueryName =  Ember.String.pluralize(capitalize(camelize(dataClass.modelName)));
          let odataUrl = _this.get('odataUrl');
          obj.adapter.callAction(
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests\unit\components\flexberry-map-test.js` at line 89

```js
  // After update to leaflet-1.0.0 panTo not directly change center,
  // it will changed after animation will trigger 'moveend' event.
  let promise = new Ember.Test.promise((resolve) => {
    leafletMap.on('moveend', () => {
      setTimeout(resolve, 500);
```

### Unknown Global

**Global**: `Ember.DS`

**Location**: `addon\adapters\odata.js` at line 46

```js
      const meta = getResponseMeta(xhr.getResponseHeader('Content-Type'));
      if (meta.contentType !== 'multipart/mixed') {
        return reject(new Ember.DS.AdapterError('Invalid response type.'));
      }

```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `addon\components\flexberry-boundingbox.js` at line 518

```js
        updateAreaSelect();
      }).catch((error) => {
        Ember.Logger.error(error);
      }).finally(() => {
        // Bind 'change' event handler again.
```

### Unknown Global

**Global**: `Ember.none`

**Location**: `addon\components\layer-result-list.js` at line 426

```js
        }

        let displayValue = Ember.none;
        displayProperty.forEach((prop) => {
          if (featureProperties.hasOwnProperty(prop)) {
```

### Unknown Global

**Global**: `Ember.none`

**Location**: `addon\components\layer-result-list.js` at line 426

```js
        }

        let displayValue = Ember.none;
        displayProperty.forEach((prop) => {
          if (featureProperties.hasOwnProperty(prop)) {
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `addon\components\base-layer.js` at line 307

```js
        return leafletLayer;
      }).catch((errorMessage) => {
        Ember.Logger.error(`Failed to create leaflet layer for '${this.get('layerModel.name')}': ${errorMessage}`);
      }));
    },
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `addon\mixins\layer-model.js` at line 49

```js
        settingsAsObject = Ember.$.extend(true, defaultSettings, JSON.parse(stringToDeserialize));
      } catch (e) {
        Ember.Logger.error(`Computation of 'settingsAsObject' property for '${this.get('name')}' layer has been failed: ${e}`);
      }
    }
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `addon\mixins\layer-model.js` at line 186

```js
      }
    } catch (e) {
      Ember.Logger.error(`Computation of 'layers' property for '${this.get('name')}' layer has been failed: ${e}`);
    }

```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `addon\mixins\flexberry-maplayer-actions-handler.js` at line 276

```js
        }
      }).catch((errorMessage) => {
        Ember.Logger.error(errorMessage);
      }).finally(() => {
        this.set(loadingPath, false);
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `addon\mixins\flexberry-maplayer-actions-handler.js` at line 325

```js

      }).catch((errorMessage) => {
        Ember.Logger.error(errorMessage);
      }).finally(() => {
        this.set(loadingPath, false);
```

### Unknown Global

**Global**: `Ember.Handlebars`

**Location**: `addon\components\map-tools\base.js` at line 88

```js
    return Ember.typeOf(caption) === 'string' && Ember.$.trim(caption) !== '' ||
      Ember.typeOf(Ember.String.isHTMLSafe) === 'function' && Ember.String.isHTMLSafe(caption) && Ember.$.trim(Ember.get(caption, 'string')) !== '' ||
      caption instanceof Ember.Handlebars.SafeString && Ember.$.trim(Ember.get(caption, 'string')) !== '';
  }),

```

### Unknown Global

**Global**: `Ember.Handlebars`

**Location**: `tests\dummy\app\helpers\to-safe-string.js` at line 15

```js
export default Ember.Helper.extend({
  compute: function ([value]) {
    return new Ember.Handlebars.SafeString(value);
  }
});
```
