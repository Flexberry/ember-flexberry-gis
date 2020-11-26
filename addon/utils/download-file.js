import Ember from 'ember';

/**
  Download file. Create request in xml format. Specific request for odata layer.
  Makes a request for other layers by creating a wfs layer. Makes a ajax-request for the url
  and gets blob.

  @method downloadFile
  @param {Object} layerModel Layer model.
  @param {Array} objectIds Array of objects IDs.
  @param {String} outputFormat Output format file.
  @param {Object} crsOuput crs in which to download data.
  @param {crsLayer} crsLayer crs in which data of layer.
  @param {String} url url of controller for download file.
  @param {Object} header headers for request odata.
  @return {Promise} Object consist of fileName and blob.
*/
let downloadFile = function(layerModel, objectIds, outputFormat, crsOuput, crsLayer, url, header = {}) {
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
        headers = header;
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

/**
  Get wfs format.
  @param {string} outputFormat Output format.
  @param {Object} crs crs in which to download data.
  @return {Object} L.Format.
*/
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
