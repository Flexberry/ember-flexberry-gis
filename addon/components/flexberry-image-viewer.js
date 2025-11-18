import Ember from 'ember';
import layout from '../templates/components/flexberry-image-viewer';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';
import { Query } from 'ember-flexberry-data';

export default Ember.Component.extend({
  layout,

  store: Ember.inject.service('store'),

  tagName: '',

  galleryDialogIsRequested: false,

  galleryDialogIsVisible: false,

  showFileAdd: false,

  showFileDelete: false,

  activeIndex: 0,

  filesJson: null,

  images: Ember.A(),

  feature: null,

  //uploadUrlFiles: 'https://rgispk.skyori.ru/s11e44a9c2b014c43b3e53d03e432892c/odata/File',

  uploadUrlFiles: 'https://localhost:5001/s11e44a9c2b014c43b3e53d03e432892c/odata/File',

  init() {
    this._super(...arguments);

    // Evented stub for flexberry-file's 'relatedModel' property.
    let relatedModelStub = Ember.Object.extend(Ember.Evented, {}).create();
    this.set('_relatedModelStub', relatedModelStub);

    if (this.feature.layerModel.settingsAsObject.photosEnabled) {
      this.getFhotoLayer();
    }
  },

  limitImages: Ember.computed('images.[]', function() {
    return this.get('images').slice(0, 5);
  }),

  getFhotoLayer() {
    let store = this.get('store');
    let feature = this.get('feature');
    let modelName;
    let projectionName;

    if (feature.layerModel.settingsAsObject.odataUrl) {
      modelName = feature.layerModel.settingsAsObject.modelName + 'files';
      projectionName = feature.layerModel.settingsAsObject.projectionName;
    } else {
      modelName = feature.layerModel.settingsAsObject.typeNS.toLowerCase() + '-' + feature.layerModel.settingsAsObject.typeName + 'files';
      projectionName = feature.layerModel.settingsAsObject.typeName + 'files';
    }

    let queryBuilder = new Query.Builder(store)
      .from(modelName)
      .selectByProjection(projectionName);
    let build = queryBuilder.build();
    let adapter = store.adapterFor(modelName);

    adapter.batchLoadModel(modelName, build, store).then(({ res, count }) => {
      let images = res.map(item => {
        if (item.get('filePath')) {
          let filePath = JSON.parse(item.get('filePath'));

          return {
            source: filePath.fileUrl,
            preview: filePath.fileUrl
          };
        }
      });

      this.set('images', images);
    });
  },

  actions: {
    showAll() {
      this.set('galleryDialogIsRequested', true);
      this.set('galleryDialogIsVisible', true);
    },

    onHideCarousel() {
      this.set('galleryDialogIsRequested', false);
      this.set('galleryDialogIsVisible', false);
    },

    onAddPhoto() {
      this.set('showFileAdd', true);
    },

    onHideAddFile() {
      this.set('showFileAdd', false);
    },

    onShowDeletePhoto() {
      this.set('showFileDelete', true);
    },

    onHideDeletePhoto() {
      this.set('showFileDelete', false);
    },

    delete(item) {
      //let images = this.get('images');
      //let image = images.objectAt(item.iindex - 1);
      //images.removeObject(image);
      //this.set('images', images);
      //this.set('activeIndex', item.iindex - 1);
      this.send('onShowDeletePhoto');
    },

    savePhoto() {
      let json = this.get('filesJson');
      if (!json) {
        console.error('Нет файлов для сохранения');
        return;
      }

      let files = [];
      try {
        files = JSON.parse(json);
      } catch (e) {
        console.error('Ошибка парсинга JSON:', e);
        return;
      }

      if (!Ember.isArray(files) || files.length === 0) {
        console.error('Нет файлов для сохранения');
        return;
      }

      let store = this.get('store');
      let records = [];
      let feature = this.get('feature');
      let modelName;

      if (feature.layerModel.settingsAsObject.odataUrl) {
        modelName = feature.layerModel.settingsAsObject.modelName + 'files';
      } else {
        modelName = feature.layerModel.settingsAsObject.typeNS.toLowerCase() + '-' + feature.layerModel.settingsAsObject.typeName + 'files';
      }

      files.forEach((file) => {
        let record = store.createRecord(modelName, {
          id: generateUniqueId(),
          filePath: JSON.stringify(file),
          fileName: file.fileName || null,
          mime: file.fileMimeType || null,
          width: file.width || null,//!!
          height: file.height || null,//!!
        });

        records.push(record);
      });

      let images = this.get('images');
      let adapter = store.adapterFor(modelName);
      adapter.batchUpdate(store, records).then((result) => {
        console.log(`Сохранено файлов: ${result.length}`);
        result.forEach((file) => {
          if (file.get('filePath')) {
            let filePath = JSON.parse(file.get('filePath'));
            images.pushObject({
              source: filePath.fileUrl,
              preview: filePath.fileUrl
            });
          }
        });
      }).catch((error) => {
        console.error('Ошибка при сохранении файлов:', error);
      });
    },
  }
});
