import Ember from 'ember';
import layout from '../templates/components/flexberry-image-viewer';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';
import { Query } from 'ember-flexberry-data';
import moment from 'moment';

export default Ember.Component.extend({
  layout,

  store: Ember.inject.service('store'),

  session: Ember.inject.service(),

  tagName: '',

  images: Ember.A(),

  galleryDialogIsRequested: false,

  showFileAdd: false,

  showFileDelete: false,

  deleteIndex: null,

  filesJson: null,

  feature: null,

  uploadUrlFiles: null,

  token: null,

  _relatedModelStub: null,

  uploadIsInProgressFiles: null,

  availableEdit: null,

  showAll: false,

  displayedImagesLimit: 5,

  init() {
    this._super(...arguments);

    let relatedModelStub = Ember.Object.extend(Ember.Evented, {}).create();
    this.set('_relatedModelStub', relatedModelStub);

    if (!this.feature.layerModel.settingsAsObject.displaySettings.photosEnabled) {
      return;
    }

    if (Ember.isEmpty(this.feature.layerModel.settingsAsObject.uploadUrlFiles)) {
      console.error('Пустой uploadUrlFiles. Раздел фото не будет загружен.');
    } else {
      this.set('uploadUrlFiles', this.feature.layerModel.settingsAsObject.uploadUrlFiles);

      this.set('token', this.get('session.isAuthenticated') ? `Bearer ${this.get('session.data.authenticated.access_token')}` : null);
      this.getFhotoLayer();
    }
  },

  displayedImages: Ember.computed('images.[]', 'showAll', function() {
    const images = this.get('images') || [];
    return this.get('showAll') ? images : images.slice(0, this.get('displayedImagesLimit'));
  }),

  /**
   * Можно добавить максимум 20 фото.
   */
  visibleAddPhoto: Ember.computed('images.[]', function () {
    return this.get('images.length') < 20;
  }),

  /**
   * Вычитать фото.
   */
  getFhotoLayer() {
    let store = this.get('store');
    let feature = this.get('feature');
    let modelName = this.feature.layerModel.settingsAsObject.modelNameFiles;
    let projectionName = this.feature.layerModel.settingsAsObject.projectionNameFiles;
    let predicate;

    if (feature.layerModel.get('type') === 'odata-vector') {
      predicate = new Query.SimplePredicate(
        feature.layerModel.settingsAsObject.modelName.split('-')[1],
        Query.FilterOperator.Eq,
        feature.properties.primarykey
      );
    } else {
      predicate = new Query.SimplePredicate(feature.layerModel.settingsAsObject.typeName, Query.FilterOperator.Eq, feature.properties.primarykey);
    }

    let queryBuilder = new Query.Builder(store).from(modelName).selectByProjection(projectionName).where(predicate);
    let build = queryBuilder.build();
    let adapter = store.adapterFor(modelName);

    adapter.batchLoadModel(modelName, build, store).then(({ res, count }) => {
      let images = res.map((item) => {
        if (item.get('filePath')) {
          let filePath = JSON.parse(item.get('filePath'));

          let fileName = item.get('fileName');
          if (fileName && fileName.length > 100) {
            fileName = fileName.substring(0, 97) + '...';
          }

          return {
            preview: filePath.previewUrl,
            creator: item.get('creator'),
            createTime: moment(item.get('createTime')).format('DD.MM.YYYY'),
            id: item.get('id'),
            fileName: fileName,
          };
        }
      });

      this.set('images', images);
    });
  },

  /**
   * Следим за статусом загрузки файлов, если true, значит загрузка идеит и нужно ждать
   */
  checkUploadStatus() {
    if (this.get('uploadIsInProgressFiles') === true) {
      Ember.run.later(() => {
        this.checkUploadStatus();
      }, 100);
    } else {
      this.saveFile();
    }
  },

  /**
   * Сохранение фото.
   */
  saveFile() {
    let relatedModel = this.get('_relatedModelStub');
    if (relatedModel) {
      relatedModel.off('uploadFiles');
    }

    this.set('showFileAdd', false);

    let json = this.get('filesJson');
    if (Ember.isEmpty(json)) {
      console.error('Нет файлов для сохранения');
      return;
    }

    let arrayFiles = [];
    try {
      arrayFiles = JSON.parse(json);
    } catch (e) {
      console.error('Ошибка парсинга JSON:', e);
      return;
    }

    if (!Ember.isArray(arrayFiles) || arrayFiles.length === 0) {
      console.error('Нет файлов для сохранения');
      return;
    }

    let store = this.get('store');
    let feature = this.get('feature');
    let images = this.get('images');
    let records = [];
    let modelName = this.feature.layerModel.settingsAsObject.modelNameFiles;

    arrayFiles.forEach((file) => {
      let record = store.createRecord(modelName, {
        id: generateUniqueId(),
        filePath: JSON.stringify(file),
        fileName: file.fileName || null,
        mime: file.fileMimeType || null,
        width: file.width || null, //TODO: заполнять
        height: file.height || null, //TODO: заполнять
      });

      //Для одаты надо сделать set модели т.к. связь BelongTo, для остального пишем ключ.
      if (feature.layerModel.get('type') === 'odata-vector') {
        record.set(feature.layerModel.settingsAsObject.modelName.split('-')[1], feature.leafletLayer.model);
      } else {
        record.set(feature.layerModel.settingsAsObject.typeName, feature.properties.primarykey);
      }

      records.push(record);
    });

    let promises = [];
    records.forEach((file) => {
      promises.pushObject(file.save());
    });

    Ember.RSVP.allSettled(promises).then((result) => {
      result.forEach((file) => {
        if (file.state === 'fulfilled') {
          if (file.value.get('filePath')) {
            let filePath = JSON.parse(file.value.get('filePath'));

            let fileName = file.value.get('fileName');
            if (fileName && fileName.length > 100) {
              fileName = fileName.substring(0, 97) + '...';
            }

            //TODO: После сохранения не подтягиваются актуальные поля с бека
            images.pushObject({
              preview: filePath.previewUrl,
              creator: file.value.get('creator'),
              createTime: moment(file.value.get('createTime')).format('DD.MM.YYYY'),
              id: file.value.get('id'),
              fileName: fileName,
            });
          }
        } else {
          console.error(`Ошибка при сохранении файла: ${file.reason}`);
        }
      });
    });
  },

  _addDimmerClass: Ember.observer('galleryDialogIsRequested', function() {
    Ember.run.scheduleOnce('afterRender', this, function() {
      if (this.get('galleryDialogIsRequested')) {
        let $modal = Ember.$('.ui.basic.fullscreen.carousel.modal');
        if ($modal.length) {
          let $dimmer = $modal.closest('.ui.dimmer.modals');
          if ($dimmer.length) {
            $dimmer.addClass('carousel-dimmer');
          }
        }
      } else {
        Ember.$('.ui.dimmer.modals.carousel-dimmer').removeClass('carousel-dimmer');
      }
    });
  }),

  willDestroyElement() {
    this._super(...arguments);
    Ember.$('.ui.dimmer.modals.carousel-dimmer').removeClass('carousel-dimmer');
  },

  actions: {
    showCurrent(index) {
      this.set('activeIndex', index)
      this.set('galleryDialogIsRequested', true);
    },

    toggleShowAll() {
      this.toggleProperty('showAll');
    },

    onHideCarousel() {
      this.set('galleryDialogIsRequested', false);
    },

    onAddPhoto() {
      this.set('showFileAdd', true);
    },

    onShowDeletePhoto(index) {
      this.set('showFileDelete', true);
      this.set('deleteIndex', index);
    },

    onHideDeletePhoto() {
      this.set('showFileDelete', false);
    },

    onDeny(e) {
      e.closeDialog = false;

      let relatedModel = this.get('_relatedModelStub');
      if (relatedModel) {
        relatedModel.off('uploadFiles');
      }

      this.set('showFileAdd', false);
    },

    onApprove(e) {
      e.closeDialog = false;

      let relatedModel = this.get('_relatedModelStub');
      if (relatedModel) {
        relatedModel.trigger('uploadFiles');

        this.checkUploadStatus();
      }
    },

    /**
     * Удаление фото.
     */
    delete() {
      let _this = this;
      let deleteIndex = _this.get('deleteIndex');
      if (!Ember.isEmpty(deleteIndex)) {
        let images = _this.get('images');
        let store = _this.get('store');
        let image = images.objectAt(deleteIndex);
        let feature = _this.get('feature');
        let modelName = feature.layerModel.settingsAsObject.modelNameFiles;
        let obj = store.peekRecord(modelName, image.id);

        if (!Ember.isEmpty(obj)) {
          obj.deleteRecord();
          obj
            .save()
            .then(() => {
              var imageToRemove = images.findBy('id', image.id);
              if (imageToRemove) {
                images.removeObject(imageToRemove);
              }

              _this.set('images', images);
              _this.set('deleteIndex', null);
            })
            .catch((error) => {
              console.error('Ошибка при удалении. ', error);
              obj.rollbackAttributes();
            });
        }
      }
    },
  },
});
