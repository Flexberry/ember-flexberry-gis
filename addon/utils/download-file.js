import $ from 'jquery';
import { isNone } from '@ember/utils';
import { Promise } from 'rsvp';

/**
  Get wfs format.
  @param {string} outputFormat Output format.
  @param {Object} crs crs in which to download data.
  @return {Object} L.Format.
*/
const getWfsFormat = function (outputFormat, crs) {
  if (outputFormat === 'JSON') {
    return new L.Format.GeoJSON({ crs, });
  }

  const format = new L.Format.Base({ crs, });

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
const getFileExt = function (format) {
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
const downloadFile = function (layerModel, objectIds, outputFormat, crsOuput, crsLayer, url, header = {}) {
  return new Promise((resolve, reject) => {
    let req = null;
    let headers = {};
    let layerName;
    try {
      const type = layerModel.get('type');
      let layerSettings = layerModel.get('settingsAsObject');
      const readFormat = getWfsFormat(outputFormat, crsOuput.crs);
      layerName = layerModel.get('name');
      if (type === 'wms-wfs') {
        layerSettings = layerModel.get('settingsAsObject').wfs;
      }

      if (type !== 'odata-vector') {
        const wfsLayer = new L.WFS({
          crs: crsOuput.crs,
          url: layerSettings.url,
          typeNS: layerSettings.typeNS,
          typeName: layerSettings.typeName,
          geometryField: layerSettings.geometryField,
          showExisting: false,
        }, readFormat);

        const filters = objectIds.map((id) => new L.Filter.GmlObjectID(id));
        const allfilters = new L.Filter.Or(...filters);
        const wfsElem = wfsLayer.getFeature(allfilters);
        const layerHeaders = wfsLayer.options.headers;
        headers = layerHeaders;
        const doc = document.implementation.createDocument('', '', null);
        const geoserverElem = doc.createElement('geoserver');
        geoserverElem.setAttribute('url', layerSettings.url);
        wfsElem.appendChild(geoserverElem);
        req = wfsElem;
      } else {
        const doc = document.implementation.createDocument('', '', null);
        const odataElem = doc.createElement('odata');
        odataElem.setAttribute('outputFormat', outputFormat);
        const layerElem = doc.createElement('layer');
        layerElem.setAttribute('odataClass', layerSettings.odataClass);
        layerElem.setAttribute('odataUrl', layerSettings.odataUrl);
        if (!isNone(crsOuput.definition)) {
          layerElem.setAttribute('srsName', crsOuput.definition);
        } else {
          layerElem.setAttribute('srsName', crsOuput.crs.code);
        }

        layerElem.setAttribute('layerName', layerName);
        if (!isNone(crsLayer.definition)) {
          layerElem.setAttribute('srslayer', crsLayer.definition);
        } else {
          layerElem.setAttribute('srslayer', crsLayer.crs.code);
        }

        const pkListElem = doc.createElement('pkList');
        objectIds.forEach((id) => {
          const pkElem = doc.createElement('pk');
          pkElem.setAttribute('primarykey', id);
          pkListElem.appendChild(pkElem);
        });

        layerElem.appendChild(pkListElem);
        odataElem.appendChild(layerElem);
        req = odataElem;
        headers = header;
      }
    } catch (error) {
      reject(new Error(`Error getting data for the request: ${error}`));
    }

    $.ajax({
      async: true,
      method: 'POST',
      url,
      data: L.XmlUtil.serializeXmlDocumentString(req),
      contentType: 'text/xml',
      headers: headers || {},
      dataType: 'blob',
      success: (blob) => {
        const ext = getFileExt(outputFormat);
        const fileName = `${layerName}.${ext}`;
        resolve({ fileName, blob, });
      },
      error: (errorMessage) => {
        reject(new Error(`Layer upload error ${layerName}: ${errorMessage}`));
      },
    });
  });
};

/**
  Data loading.
  @param {string} filename File name.
  @param {Blob} blob Data array.
*/
const downloadBlob = function (filename, blob) {
  const element = document.createElement('a');

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
