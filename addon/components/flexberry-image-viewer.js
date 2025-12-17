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

  images: Ember.A([]),

  deleteRecordsFiles: Ember.A([]),

  uploadFilesLater: Ember.A([]),

  galleryDialogIsRequested: false,

  showFileAdd: false,

  showFileDelete: false,

  deleteIndex: null,

  filesJson: null,

  feature: null,

  uploadUrlFiles: null,

  token: null,

  modelFilesStub: null,

  uploadIsInProgressFiles: null,

  availableEdit: null,

  showAll: false,

  displayedImagesLimit: 5,

  hasFiles: false,

  editLayerForm: null,

  settingsAsObject: null,

  layerType: null,

  _modalClickHandler: null,

  init() {
    this._super(...arguments);

    this.set('images', Ember.A([]));
    if (Ember.isNone(this.get('modelFilesStub'))) {
      let modelFilesStub = Ember.Object.extend(Ember.Evented, {}).create();
      this.set('modelFilesStub', modelFilesStub);
    }

    let settingsAsObject = this.get('settingsAsObject');
    if (Ember.isNone(settingsAsObject) || !settingsAsObject.displaySettings.photosEnabled) {
      return;
    }

    if (Ember.isEmpty(settingsAsObject.uploadUrlFiles)) {
      console.error('Пустой uploadUrlFiles. Раздел фото не будет загружен.');
    } else {
      this.set('uploadUrlFiles', settingsAsObject.uploadUrlFiles);

      this.set('token', this.get('session.isAuthenticated') ? `Bearer ${this.get('session.data.authenticated.access_token')}` : null);

      // если feature null значит мы пришли с формы создания объекта, ничего не подгружаем.
      if (!Ember.isNone(this.get('feature'))) {
        this.getFhotoLayer();
      }

      if (this.get('editLayerForm')) {
        this.toggleProperty('showAll');
      }
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
    let settingsAsObject = this.get('settingsAsObject');
    let modelName = settingsAsObject.modelNameFiles;
    let projectionName = settingsAsObject.projectionNameFiles;
    let layerType = this.get('layerType');

    let predicateAtr;

    if (layerType === 'odata-vector') {
      predicateAtr = settingsAsObject.modelName.split('-')[1];
    } else if (layerType === 'wms-wfs') {
      predicateAtr = settingsAsObject.wfs.typeName;
    } else {
      predicateAtr = settingsAsObject.typeName;
    }

    let predicate = new Query.SimplePredicate(
      predicateAtr,
      Query.FilterOperator.Eq,
      feature.properties.primarykey);
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
            isBase64: false,
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
    let modelFilesStub = this.get('modelFilesStub');
    if (modelFilesStub) {
      modelFilesStub.off('uploadFiles');
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
    let settingsAsObject = this.get('settingsAsObject');
    let modelName = settingsAsObject.modelNameFiles;
    let layerType = this.get('layerType');
    let records = [];

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
      if (layerType === 'odata-vector') {
        record.set(settingsAsObject.modelName.split('-')[1], feature.leafletLayer.model);
      } else if (layerType === 'wms-wfs') {
        record.set(settingsAsObject.wfs.typeName, feature.properties.primarykey);
      } else {
        record.set(settingsAsObject.typeName, feature.properties.primarykey);
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
              isBase64: false,
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

  _addModalClickHandler() {
    Ember.run.next(this, () => {
      const modal = document.querySelector('.ui.modal.carousel');
      if (!modal) return;

      const clickHandler = (event) => {
        if (!event.target.closest('.actions, .button, .img-responsive, .file-name')) {
          this.send('onHideCarousel');
        }
      };

      modal.addEventListener('click', clickHandler);
      this._modalClickHandler = { modal, clickHandler };
    });
  },

  _removeModalClickHandler() {
    if (this._modalClickHandler) {
      const { modal, clickHandler } = this._modalClickHandler;
      modal.removeEventListener('click', clickHandler);
      this._modalClickHandler = null;
    }
  },

  saveFilesLaterFunc(modelFilesStub) {
    modelFilesStub.trigger('saveFilesLater');
    let images = this.get('images');
    let uploadFilesLater = this.get('uploadFilesLater');
    uploadFilesLater.forEach((file) => {
      if (!file.id) {
        file.id = generateUniqueId();
      }

      if (!images.any(img => img.id === file.id)) {
        images.pushObject({
          preview: file.files[0]._previewBase64,
          id: file.id,
          isBase64: true,
        });
      }
    });
    this.set('showFileAdd', false);
    modelFilesStub.off('saveFilesLater');
  },

  actions: {
    showCurrent(index) {
      if (!this.get('editLayerForm')) {
        this.set('activeIndex', index);
        this.set('galleryDialogIsRequested', true);
        Ember.run.scheduleOnce('afterRender', this, this._addModalClickHandler);
      }
    },

    toggleShowAll() {
      this.toggleProperty('showAll');
    },

    onHideCarousel() {
      this.set('galleryDialogIsRequested', false);
      this._removeModalClickHandler();
    },

    onAddPhoto() {
      this.set('showFileAdd', true);
    },

    onShowDeletePhoto() {
      this.set('showFileDelete', true);
    },

    onHideDeletePhoto() {
      this.set('showFileDelete', false);
    },

    onDeny(e) {
      e.closeDialog = false;

      let modelFilesStub = this.get('modelFilesStub');
      if (modelFilesStub) {
        modelFilesStub.off('uploadFiles');
      }

      this.set('showFileAdd', false);
    },

    onApprove(e) {
      this.set('hasFiles', false);
      e.closeDialog = false;

      let modelFilesStub = this.get('modelFilesStub');
      if (modelFilesStub) {
        if (this.get('editLayerForm')) {
          this.saveFilesLaterFunc(modelFilesStub);
        } else {
          modelFilesStub.trigger('uploadFiles');
          this.checkUploadStatus();
        }
      }
    },

    /**
     * Удаление фото.
     */
    delete() {
      let _this = this;
      let deleteIndex = _this.get('activeIndex');
      if (!Ember.isEmpty(deleteIndex)) {
        let images = _this.get('images');
        let store = _this.get('store');
        let image = images.objectAt(deleteIndex);
        let settingsAsObject = _this.get('settingsAsObject');
        let modelName = settingsAsObject.modelNameFiles;
        let obj = store.peekRecord(modelName, image.id);

        if (!Ember.isEmpty(obj)) {
          obj.deleteRecord();
          obj
          .save()
          .then(() => {
            _this.set('activeIndex', deleteIndex > 0 ?  --deleteIndex : 0);
            Ember.run.next(()=> {
              images.removeObject(image);
            });
          })
          .catch((error) => {
            console.error('Ошибка при удалении. ', error);
            obj.rollbackAttributes();
          });
        }
      }
    },

    onFilesChange(hasFiles) {
      this.set('hasFiles', hasFiles);
    },

    deleteSingleFile(image) {
      let images = this.get('images');
      let deleteRecordsFiles = this.get('deleteRecordsFiles');
      let store = this.get('store');
      let settingsAsObject = this.get('settingsAsObject');
      let modelName = settingsAsObject.modelNameFiles;
      let obj = store.peekRecord(modelName, image.id);

      Ember.run.next(()=> {
        images.removeObject(image);
        if (Ember.isEmpty(obj)) {
          let uploadFilesLater = this.get('uploadFilesLater');
          let fileToRemove = uploadFilesLater.find(file => file.id === image.id);

          if (fileToRemove) {
            // Удаляем из массива на сохранение файл.
            uploadFilesLater.removeObject(fileToRemove);
          }
        } else {
          obj.deleteRecord();
          deleteRecordsFiles.pushObject(obj);
        }
      });
    },
  },
});
