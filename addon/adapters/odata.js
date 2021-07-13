import Ember from 'ember';
import { Projection, Adapter } from 'ember-flexberry-data';
import ODataQueryAdapter from 'ember-flexberry-data/query/odata-adapter';
import { getResponseMeta, getBatchResponses, parseBatchResponse } from 'ember-flexberry-data/utils/batch-queries';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';

export default Adapter.Odata.extend(Projection.AdapterMixin, {
  batchLoadModel(modelName, query, store) {
    if (Ember.isNone(modelName) || Ember.isNone(query)) {
      return Ember.RSVP.reject();
    }

    if (Ember.isNone(store)) {
      store = this.get('store');
    }

    const boundary = `batch_${generateUniqueId()}`;
    let requestBody = `--${boundary}\r\n`;

    requestBody += 'Content-Type: application/http\r\n';
    requestBody += 'Content-Transfer-Encoding: binary\r\n';

    const getUrl = this._buildURL(modelName, null);
    const queryAdapter = new ODataQueryAdapter(getUrl, store);
    const fullUrl = queryAdapter.getODataFullUrl(query);

    requestBody += '\r\nGET ' + fullUrl + ' HTTP/1.1\r\n';
    requestBody += 'Content-Type: application/json;type=entry\r\n';
    requestBody += 'Prefer: return=representation\r\n';

    const url = `${this._buildURL()}/$batch`;

    const headers = Ember.$.extend({}, this.get('headers'));
    headers['Content-Type'] = `multipart/mixed;boundary=${boundary}`;
    const httpMethod = 'POST';

    const options = {
      method: httpMethod,
      headers,
      dataType: 'text',
      data: requestBody };

    return new Ember.RSVP.Promise((resolve, reject) => Ember.$.ajax(url, options).done((response, statusText, xhr) => {
      const meta = getResponseMeta(xhr.getResponseHeader('Content-Type'));
      if (meta.contentType !== 'multipart/mixed') {
        return reject(new Ember.DS.AdapterError('Invalid response type.'));
      }

      try {
        const batchResponses = getBatchResponses(response, meta.boundary).map(parseBatchResponse);
        const result = batchResponses.filter(r => r.contentType === 'application/http')[0];

        const normalizedRecords = { data: Ember.A(), included: Ember.A() };
        let odataValue = result.response.body.value;
        if (!Ember.isNone(odataValue)) {
          odataValue.forEach(record => {
            const normalized = store.normalize(modelName, record);
            normalizedRecords.data.addObject(normalized.data);
            if (normalized.included) {
              normalizedRecords.included.addObjects(normalized.included);
            }
          });
        } else {
          console.error('Error batch: ' + result.response.body);
        }

        return resolve(Ember.run(store, store.push, normalizedRecords));
      } catch (e) {
        return reject(e);
      }
    }).fail(reject));
  }
});
