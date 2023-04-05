import Ember from 'ember';
import DS from 'ember-data';
import { Projection, Adapter, Query } from 'ember-flexberry-data';
import ODataQueryAdapter from 'ember-flexberry-data/query/odata-adapter';
import { getResponseMeta, getBatchResponses, parseBatchResponse } from 'ember-flexberry-data/utils/batch-queries';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';
import SnapshotTransform from 'ember-flexberry-data/utils/snapshot-transform';

const { Builder } = Query;

export default Adapter.Odata.extend(Projection.AdapterMixin, {
  /**
    A method to send batch update, create or delete models in single transaction.

    All models saving using this method must have identifiers.

    The array which fulfilled the promise may contain the following values:
    - `same model object` - for created, updated or unaltered records.
    - `null` - for deleted records.

    @method batchUpdate (overridden method from efd/query/odata-adapter)
    @param {DS.Store} store The store.
    @param {DS.Model[]|DS.Model} models Is array of models or single model for batch update.
    @return {Promise} A promise that fulfilled with an array of models in the new state.
  */
  batchUpdate(store, models) {
    if (Ember.isEmpty(models)) {
      return Ember.RSVP.resolve(models);
    }

    models = Ember.isArray(models) ? models : Ember.A([models]);

    return Ember.RSVP.all(models.map((m) => m.save({ softSave: true }))).then(() => {
      const boundary = `batch_${generateUniqueId()}`;

      let requestBody = '--' + boundary + '\r\n';

      const changeSetBoundary = `changeset_${generateUniqueId()}`;
      requestBody += 'Content-Type: multipart/mixed;boundary=' + changeSetBoundary + '\r\n\r\n';

      let contentId = 0;
      const getQueries = [];
      models.forEach((model) => {
        if (!model.get('id')) {
          throw new Error(`Models saved using the 'batchUpdate' method must be created with identifiers.`);
        }

        let modelDirtyType = model.get('dirtyType');

        if (!modelDirtyType) {
          if (model.hasChangedBelongsTo() || model.hasChangedHasMany()) {
            modelDirtyType = 'updated';
          } else {
            return;
          }
        }

        requestBody += '--' + changeSetBoundary + '\r\n';
        requestBody += 'Content-Type: application/http\r\n';
        requestBody += 'Content-Transfer-Encoding: binary\r\n';

        contentId++;
        requestBody += 'Content-ID: ' + contentId + '\r\n\r\n';

        const skipUnchangedAttrs = true;
        const snapshot = model._createSnapshot();
        SnapshotTransform.transformForSerialize(snapshot, skipUnchangedAttrs);

        let modelHttpMethod = 'POST';
        switch (modelDirtyType) {
          case 'created':
            modelHttpMethod = 'POST';
            break;

          case 'updated':
            modelHttpMethod = skipUnchangedAttrs ? 'PATCH' : 'PUT';
            break;

          case 'deleted':
            modelHttpMethod = 'DELETE';
            break;

          default:
            throw new Error(`Unknown requestType: ${modelDirtyType}`);
        }

        if (!this.store) {
          this.store = store;
        }

        const modelUrl =  this._buildURL(snapshot.type.modelName, modelDirtyType === 'created' ? undefined : model.get('id'));

        requestBody += modelHttpMethod + ' ' + modelUrl + ' HTTP/1.1\r\n';
        requestBody += 'Content-Type: application/json;type=entry\r\n';
        requestBody += 'Prefer: return=representation\r\n\r\n';

        // Don't need to send any data for deleting.
        if (modelDirtyType !== 'deleted') {
          const serializer = store.serializerFor(snapshot.type.modelName);
          const data = {};
          serializer.serializeIntoHash(data, snapshot.type, snapshot);
          requestBody += JSON.stringify(data) + '\r\n';

          // Add a GET request for created or updated models.
          let getQuery = '\r\n--' + boundary + '\r\n';
          getQuery += 'Content-Type: application/http\r\n';
          getQuery += 'Content-Transfer-Encoding: binary\r\n';

          const relationships = [];
          model.eachRelationship((name) => {
            // If attr serializable value hadn't been set up, it'll be { serialize: 'id' } by default from DS.EmbeddedRecordsMixin.
            let attrSerializeVal =
              serializer && serializer.attrs && serializer.attrs[name] && serializer.attrs[name].serialize;

            if (attrSerializeVal !== false) {
              relationships.push(`${name}.id`);
            }
          });

          const getUrl = this._buildURL(snapshot.type.modelName, model.get('id'));

          let expand;
          if (relationships.length) {
            const query = new Builder(store, snapshot.type.modelName).select(relationships.join(',')).build();
            const queryAdapter = new ODataQueryAdapter(getUrl, store);
            expand = queryAdapter.getODataQuery(query).$expand;
          }

          getQuery += '\r\nGET ' + getUrl + (expand ? '?$expand=' + expand : '') + ' HTTP/1.1\r\n';
          getQuery += 'Content-Type: application/json;type=entry\r\n';
          getQuery += 'Prefer: return=representation\r\n';
          getQueries.push(getQuery);
        }
      });

      requestBody += '--' + changeSetBoundary + '--';
      requestBody += getQueries.join('');
      requestBody += '\r\n--' + boundary + '--';

      const url = `${this._buildURL()}/$batch`;

      const headers = Ember.$.extend({}, this.get('headers'));
      headers['Content-Type'] = `multipart/mixed;boundary=${boundary}`;
      const httpMethod = 'POST';

      const options = {
        method: httpMethod,
        headers,
        dataType: 'text',
        data: requestBody,
      };

      return new Ember.RSVP.Promise((resolve, reject) => Ember.$.ajax(url, options).done((response, statusText, xhr) => {
        const meta = getResponseMeta(xhr.getResponseHeader('Content-Type'));
        if (meta.contentType !== 'multipart/mixed') {
          return reject(new DS.AdapterError('Invalid response type.'));
        }

        const batchResponses = getBatchResponses(response, meta.boundary).map(parseBatchResponse);
        const getResponses = batchResponses.filter(r => r.contentType === 'application/http');
        const updateResponse = batchResponses.find(r => r.contentType === 'multipart/mixed');

        const errorsChangesets = updateResponse.changesets.filter(c => !this.isSuccess(c.meta.status));
        if (errorsChangesets.length) {
          return reject(errorsChangesets.map(c => new DS.AdapterError(c.body)));
        }

        const errors = [];
        const result = [];
        models.forEach((model) => {
          const modelDirtyType = model.get('dirtyType');
          if (modelDirtyType === 'deleted') {
            Ember.run(store, store.unloadRecord, model);
          } else if (modelDirtyType === 'created' || modelDirtyType === 'updated' || model.hasChangedBelongsTo()) {
            const { response } = getResponses.shift();
            if (this.isSuccess(response.meta.status)) {
              const modelName = model.constructor.modelName;
              const payload = { [modelName]: response.body };
              Ember.run(() => {
                store.pushPayload(modelName, payload);
              });
            } else {
              errors.push(new DS.AdapterError(response.body));
            }
          }

          result.push(modelDirtyType === 'deleted' ? null : model);
        });

        return errors.length ? reject(errors) : resolve(result);
      }).fail(reject));
    });
  },

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
