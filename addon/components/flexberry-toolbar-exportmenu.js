import Ember from 'ember';
import layout from '../templates/components/flexberry-toolbar-exportmenu';
import { translationMacro as t } from 'ember-i18n';

export default Ember.Component.extend({
  i18n: Ember.inject.service(),

  layout,

  _toolname:null,

  _loading: '',

  _dialog: null,

  _options: {
    caption: '',
    font: '30px Arial',
    fillStyle: 'black',
    x:10,
    y:100,
    zoomChecked: true,
    attributionChecked: true,
    type: 'PNG',
    fileName: 'map.png'
  },

  _showExportDialog: false,

  _showDownloadOptions: false,

  _printCaption: t('components.flexberry-export.printCaption'),

  _downloadCaption: t('components.flexberry-export.downloadCaption'),

  _header: '',

  _availableImageTypes: [],

  _mimeTypes: { },

  actions: {

    configureExport(toolname) {
      let map = this.get('map');
      let i18n = this.get('i18n');
      map.exportError.wrongBeginSelector = i18n.t('components.flexberry-export.wrongBeginSelector').toString();
      map.exportError.wrongEndSelector = i18n.t('components.flexberry-export.wrongEndSelector').toString();
      map.exportError.jqueryNotAvailable = i18n.t('components.flexberry-export.jqueryNotAvailable').toString();
      map.exportError.popupWindowBlocked = i18n.t('components.flexberry-export.popupWindowBlocked').toString();
      this._mimeTypes = map.supportedCanvasMimeTypes();
      this._availableImageTypes = [];
      for (let type in this._mimeTypes) {
        this._availableImageTypes.push(type);
      }
      this.set('_toolname', toolname);
      this.set('_loading', '');
      this.set('_header', toolname === 'downloadtool' ? this._downloadCaption : this._printCaption);
      this.set('_showDownloadOptions', toolname === 'downloadtool' ? true : false);
      this.set('_showExportDialog', true);
    },

    onApprove(attr) {
      attr.closeDialog = false;
      this._dialog = attr.dialog;
      this.set('_loading', 'loading');
      let map = this.get('map');
      let exportOptions = { caption: {}, exclude:[]};
      if (this._options.caption.trim().length > 0) {
        exportOptions.caption = {
          text: this._options.caption,
          font: this._options.font,
          fillStyle: this._options.fillStyle,
          position: [ this._options.x,  this._options.y ]
        };
      }
      if (this._options.zoomChecked) {
        exportOptions.exclude.push('.leaflet-control-zoom');
      }
      if (this._options.attributionChecked) {
        exportOptions.exclude.push('.leaflet-control-attribution');
      }
      let _this = this;
      let closeDialogFunction = function(result){
        _this.set('_showExportDialog',false);
        _this._dialog.modal('hide');  //_showExportDialog does.nt work in promise thread, use direct function to hide
        return result;
      };
      exportOptions.afterExport = closeDialogFunction;

      if (this._toolname === 'downloadtool') {
        exportOptions.fileName = this._options.fileName;
        exportOptions.format = this._mimeTypes[this._options.type];
        let dataPromise = map.downloadExport(exportOptions);
        dataPromise.then(
          data => {_this.set('_showExportDialog',false);}
        );
      } else {
        let dataPromise = map.printExport(exportOptions);
        dataPromise.then(
          data => {_this.set('_showExportDialog',false);}
        );
      }
      return false;
    },

    captionFocusOut() {
      if (this._options.caption.trim().length > 0) {
        Ember.$('#flexberry-toolbar-exportmenu-caption').nextAll('.field').removeClass('disabled');
      } else {
        Ember.$('#flexberry-toolbar-exportmenu-caption').nextAll('.field').addClass('disabled');
      }

    }

  }
});
