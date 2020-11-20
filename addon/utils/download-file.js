import Ember from 'ember';

/**
  Finds crs by name in factory and create it.

  @method getCrsByName
  @param {String} crsName Name of coordinate reference system.
  @param {Object} that.
  @returns {Object} Сoordinate reference system.
*/
let downloadFile = function(layerModel, objectIds, outputFormat, crsOuput, crsLayer, url) {
  return new Ember.RSVP.Promise((resolve, reject) => {
    let req = null;
    let headers = {};
    let layerName;
    try {
      let type = layerModel.get('type');
      let layerSettings = layerModel.get('settingsAsObject');
      let readFormat = getWfsFormat(outputFormat, crsOuput.crs);
      layerName = layerModel.get('name');
      if (type === 'wms-wfs') {
        layerSettings = layerModel.get('settingsAsObject').wfs;
      }

      if (type !== 'odata-vector') {
        let wfsLayer = new L.WFS({
          crs: crsOuput.crs,
          url: layerSettings.url,
          typeNS: layerSettings.typeNS,
          typeName: layerSettings.typeName,
          geometryField: layerSettings.geometryField,
          showExisting: false
        }, readFormat);

        let filters = objectIds.map((id) => new L.Filter.GmlObjectID(id));
        let allfilters = new L.Filter.Or(...filters);
        let wfsElem = wfsLayer.getFeature(allfilters);
        headers = wfsLayer.options.headers;
        let doc = document.implementation.createDocument('', '', null);
        let geoserverElem = doc.createElement('geoserver');
        geoserverElem.setAttribute('url', layerSettings.url);
        wfsElem.appendChild(geoserverElem);
        req = wfsElem;

      } else {
        let doc = document.implementation.createDocument('', '', null);
        let odataElem = doc.createElement('odata');
        odataElem.setAttribute('outputFormat', outputFormat);
        let layerElem = doc.createElement('layer');
        layerElem.setAttribute('odataClass', layerSettings.odataClass);
        layerElem.setAttribute('odataUrl', layerSettings.odataUrl);
        if (!Ember.isNone(crsOuput.definition)) {
          layerElem.setAttribute('srsName', crsOuput.definition);
        } else {
          layerElem.setAttribute('srsName', crsOuput.crs.code);
        }

        layerElem.setAttribute('layerName', layerName);
        if (!Ember.isNone(crsLayer.definition)) {
          layerElem.setAttribute('srslayer', crsLayer.definition);
        } else {
          layerElem.setAttribute('srslayer', crsLayer.crs.code);
        }

        let pkListElem = doc.createElement('pkList');
        objectIds.forEach((id) => {
          let pkElem = doc.createElement('pk');
          pkElem.setAttribute('primarykey', id);
          pkListElem.appendChild(pkElem);
        });

        layerElem.appendChild(pkListElem);
        odataElem.appendChild(layerElem);
        req = odataElem;
        headers = layerModel.get('headers');
      }
    } catch (error) {
      reject('Error getting data for the request: ' + error);
    }

    Ember.$.ajax({
      async: true,
      method: 'POST',
      url: url,
      data: L.XmlUtil.serializeXmlDocumentString(req),
      contentType: 'text/xml',
      headers: headers || {},
      dataType: 'blob',
      success: (blob) => {
        let ext = getFileExt(outputFormat);
        let fileName = layerName + '.' + ext;
        resolve({ fileName, blob });
      },
      error: (errorMessage) => {
        reject('Layer upload error ' + layerName + ': ' + errorMessage);
      }
    });
  });
};

let getWfsFormat = function(outputFormat, crs) {
  if (outputFormat === 'JSON') {
    return new L.Format.GeoJSON({ crs: crs });
  }

  let format = new L.Format.Base({ crs: crs });

  format.outputFormat = outputFormat;

  if (outputFormat === 'Shape Zip') {
    format.outputFormat = 'Shape';
  }

  return format;
};

/**
  Get file extension.
  @param {string} format Output format.
  @return {string} file extension.
*/
let getFileExt = function(format) {
  switch (format) {
    case 'JSON':
      return 'json';
    case 'GML2':
    case 'GML3':
      return 'xml';
    case 'KML':
      return 'kml';
    case 'CSV':
      return 'csv';
    case 'GPX':
    case 'Shape Zip':
    case 'MIF':
      return 'zip';
    default:
      return 'txt';
  }
};

/**
  Data loading.
  @param {string} filename File name.
  @param {Blob} blob Data array.
*/
let downloadBlob = function(filename, blob) {
  let element = document.createElement('a');

  element.setAttribute('href', window.URL.createObjectURL(blob));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

export {
  downloadFile,
  downloadBlob
};
