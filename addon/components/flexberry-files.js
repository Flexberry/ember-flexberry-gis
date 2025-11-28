import FlexberryFileComponent from 'ember-flexberry/components/flexberry-file';
import Ember from 'ember';
import { getSizeInUnits } from 'ember-flexberry/utils/file-size-units-converter';
import layout from '../templates/components/flexberry-files';

export default FlexberryFileComponent.extend({
  layout,

  _files: Ember.A([]),

  maxFiles: 20,

  errorMessages: Ember.A([]),

  init() {
    this._super(...arguments);
    this.set('_files', Ember.A([]));
    this.set('errorMessages', Ember.A([]));
  },

  didInsertElement() {
    this._super(...arguments);
    let _this = this;

    _this.$('.flexberry-file-file-input').fileupload({
      autoUpload: false,
      dataType: 'json',
      maxNumberOfFiles: _this.get('maxFiles'),
      singleFileUploads: true,
      dropZone: _this.$('.flexberry-file-dropzone'),
      url: _this.get('uploadUrl'),
      change: null,
      add: function(e, uploadData) {
        _this.onFileAdd(uploadData.files);
        uploadData.headers = _this.get('headers');
        _this.set('_uploadData', uploadData);
      },
    });

    let dropZone = _this.element.querySelector('.flexberry-file-dropzone');
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
      });

      dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
        _this.onFileAdd(e.dataTransfer.files);
      });
    }

    let relatedModel = this.get('relatedModel');
    if (relatedModel) {
      relatedModel.on('uploadFiles', () => {
        this.send('uploadButtonClick');
      });
    }
  },

  /**
   * Есть ли выбранные файлы
   */
  _hasFile: Ember.computed('_files.[]', function() {
    let files = this.get('_files');

    if (!files || !Array.isArray(files)) {
      return false;
    }

    return files.get('length') > 0 && files.any(file => !file._hasError);
  }),

  /**
   * Имя выбранных файлов
   */
  _fileName: Ember.computed('_files.[]', function() {
    let files = this.get('_files');
    if (Ember.isArray(files) && files.length > 0) {
      return files.map(f => f.name).join(', ');
    }

    return null;
  }),

  /**
   * true, если хотя бы одно превью загружено
   */
  _canLoadPreview: Ember.computed('_files.@each._previewBase64', function() {
    return this.get('_files').any(f => !!f._previewBase64);
  }),

  /**
   * true, если хотя бы одно превью сейчас загружается
   */
  _previewDownloadIsInProgress: Ember.computed('_files.@each._isPreviewLoading', function() {
    return this.get('_files').any(f => f._isPreviewLoading);
  }),

  /**
   * Имена файлов, у которых превью не удалось загрузить
   */
  _previewErrorFileNames: Ember.computed('_files.@each._previewError', function() {
    let files = this.get('_files') || [];
    let errorFiles = files.filter(f => f._previewError);
    return errorFiles.length > 0 ? errorFiles.map(f => f.name).join(', ') : null;
  }),

  /**
   * Кнопка "Добавить" активна, если не достигнут лимит и нет ошибок
   */
  _addButtonIsEnabled: Ember.computed('_files.[]', function() {
    let files = this.get('_files');
    return files.length < this.get('maxFiles') && files.every(f => !f._hasError);
  }),

  /**
   * Кнопка "Удалить" активна, если есть файлы
   */
  _removeButtonIsEnabled: Ember.computed('_uploadIsInProgress', '_files.[]', function() {
    let filesWithErrors = this.get('_files').filter(f => f._hasError);
    return !(this.get('_uploadIsInProgress')) || filesWithErrors.length > 0;
  }),

  onFileAdd: function(selectedFiles) {
    if (!selectedFiles || selectedFiles.length === 0) return;

    let existingFiles = this.get('_files');
    let existingFileNames = existingFiles.map(file => file.name);
    selectedFiles = Array.from(selectedFiles).filter(file => !existingFileNames.includes(file.name));

    if (selectedFiles.length === 0) return;

    if (existingFiles.length + selectedFiles.length > this.get('maxFiles')) {
      this.addErrorMessage(`Можно добавить максимум ${this.get('maxFiles')} изображений.`);
      return;
    }

    selectedFiles.forEach(selectedFile => {
      let accept = this.get('accept');
      let fileType = selectedFile.type;
      let fileName = selectedFile.name;

      if (!this._isValidTypeFile(fileType, accept)) {
        Ember.set(selectedFile, '_hasError', true);
        this.addErrorMessage(`Файл "${fileName}" имеет неподдерживаемый формат.`);
        return;
      }

      let maxUploadFileSize = this.get('maxUploadFileSize');
      if (!Ember.isNone(maxUploadFileSize)) {
        let sizeUnit = this.get('maxUploadFileSizeUnit');
        if (!(sizeUnit in this.get('_fileSizeUnits'))) {
          sizeUnit = Object.keys(this.get('_fileSizeUnits'))[0];
        }

        let fileSizeInUnits = getSizeInUnits(selectedFile.size, sizeUnit);
        if (fileSizeInUnits > maxUploadFileSize) {
          Ember.set(selectedFile, '_hasError', true);
          this.addErrorMessage(`Файл "${fileName}" превышает максимально допустимый размер.`);
          return;
        }
      }

      if (fileType && fileType.startsWith('image/')) {
        let reader = new FileReader();
        reader.onload = function(event) {
          Ember.set(selectedFile, '_previewBase64', event.target.result);
        };
        reader.readAsDataURL(selectedFile);
      }
    });

    this.get('_files').pushObjects(selectedFiles);
  },

  /**
   * Добавление ошибки в список ошибок
   */
  addErrorMessage(message) {
    console.error(message);
    let errorMessages = this.get('errorMessages');
    if (!errorMessages.includes(message)) {
      errorMessages.pushObject(message);
    }
  },

  /**
   * Очистка списка ошибок
   */
  clearErrorMessages() {
    this.set('errorMessages', Ember.A([]));
  },

  willDestroyElement() {
    Ember.run.next(this, function() {
      this._super(...arguments);
    });
  },

  actions: {
    /**
     * Удаление одного конкретного файла.
     */
    removeSingleFile(file) {
      this.get('_files').removeObject(file);

      if (this.get('_files.length') === 0) {
        this.clearErrorMessages();
        let jsonValue = this.get('_jsonValue');
        if (jsonValue) {
          Ember.setProperties(jsonValue, {
            fileName: null,
            fileMimeType: null,
            fileSize: null,
          });
        }
      }
    },

    /**
     * Очистка всех выбранных файлов.
     */
    removeButtonClick() {
      this.set('_files', Ember.A([]));
      this.clearErrorMessages();
      this._super(...arguments);
    },

    /**
     * Загрузка всех файлов.
     */
    uploadButtonClick() {
      if (this.get('_files.length') > 0 && this.get('errorMessages.length') === 0) {
        return this._uploadFilesSequentially(this.get('_files'))
      }
    },
  },

  /**
  * Последовательная загрузка файлов
  */
  _uploadFilesSequentially(files) {
    if (!files || files.length === 0) return Ember.RSVP.resolve();
    let uploadData = this.get('_uploadData');
    this.set('_uploadIsInProgress', true);

    let chain = Ember.RSVP.resolve();
    files.forEach((file, index) => {
      chain = chain.then(() => {
        return new Ember.RSVP.Promise((resolve, reject) => {
          let uploadClone = Object.assign({}, uploadData, {
            files: [file],
          });

          uploadClone.submit().done((result) => {
            let prevValue = this.get('value');
            let arr = [];

            try {
              arr = JSON.parse(prevValue) || [];
              if (!Array.isArray(arr)) {
                arr = [];
              }
            } catch (e) {
              arr = [];
            }

            arr.push(result);
            this.set('value', JSON.stringify(arr));

            this.sendAction('uploadSuccess', result, index);
            resolve();
          }).fail((jqXhr, textStatus, errorThrown) => {
            this.set('_uploadIsInProgress', false);
            this.addErrorMessage(`Ошибка загрузки файла "${file.name}": ${errorThrown}`);
            this.sendAction('uploadFail', errorThrown, index);
            reject(errorThrown);
          });
        });
      });
    });

    return chain.finally(() => {
      this.set('_uploadIsInProgress', false);
      this.set('_files', Ember.A([]));
    });
  },
});
