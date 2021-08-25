/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import FlexberryEditLayerDialogComponent from './edit';
import layout from '../../templates/components/layers-dialogs/edit';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-add-layer-dialog').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null, because component is tagless).
  @readonly
  @static

  @for FlexberryAddLayerDialogComponent
*/
const flexberryClassNamesPrefix = 'flexberry-add-layer-dialog';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null
};

/**
  Flexberry add layer modal dialog with [Semantic UI modal](http://semantic-ui.com/modules/modal.html) style.

  @class FlexberryAddLayerDialogComponent
  @extends FlexberryEditLayerDialogComponent
*/
let FlexberryAddLayerDialogComponent = FlexberryEditLayerDialogComponent.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Reference to component's CSS-classes names.
    Must be also a component's instance property to be available from component's .hbs template.
  */
  flexberryClassNames,

  /**
    Component's caption.

    @property class
    @type String
    @default t('components.layers-dialogs.add.caption')
  */
  caption: t('components.layers-dialogs.add.caption'),

  /**
    Dialog's 'approve' button caption.

    @property approveButtonCaption
    @type String
    @default t('components.layers-dialogs.add.approve-button.caption')
  */
  approveButtonCaption: t('components.layers-dialogs.add.approve-button.caption'),

  /**
    Dialog's 'deny' button caption.

    @property denyButtonCaption
    @type String
    @default t('components.layers-dialogs.add.deny-button.caption')
  */
  denyButtonCaption: t('components.layers-dialogs.add.deny-button.caption'),

  /**
    Message error: datastore exist.

    @property storeExistErrorMessage
    @type String
    @default t('components.layers-dialogs.add.storeExist-error.message')
  */
  storeExistErrorMessage: t('components.layers-dialogs.add.storeExist-error.message'),

  /**
    Message error: can not create layer.

    @property createLayerErrorMessage
    @type String
    @default t('components.layers-dialogs.add.storeExist-error.message')
  */
  createLayerErrorMessage: t('components.layers-dialogs.add.createLayer-error.message'),

  /**
    Message error: can not create workspace.

    @property existWorkspaceErrorMessage
    @type String
    @default t('components.layers-dialogs.add.createWorkspace-error.message')
  */
  existWorkspaceErrorMessage: t('components.layers-dialogs.add.existWorkspace-error.message'),

  /**
    Message success: create layer.

    @property createLayerMessage
    @type String
    @default t('components.layers-dialogs.add.createLayer.message')
  */
  createLayerMessage: t('components.layers-dialogs.add.createLayer.message'),

  /**
    Flag: indicates whether add dialog is visible or not.

    @property rastrMessageVisible
    @type boolean
    @private
  */
  rastrMessageVisible: false,

  /**
    Message.

    @property message
    @type String
    @default ''
  */
  message: '',

  /**
    Caption for rastr dialog.

    @property captionRastr
    @type String
    @default t('components.layers-dialogs.add.captionRastr'),
  */
  captionRastr: t('components.layers-dialogs.add.captionRastr'),

  /**
    Type message.

    @property typeMessage
    @type String
    @default error,
  */
  typeMessage: 'error',

  /**
    File control.

    @property _fileControl
    @type Object
    @default undefined
  */
  _fileControl: undefined,

  /**
    Data request.
    @param {string} url Request url.
    @param {string} type Request type.
    @param {string} contentType Request contentType.
    @param {Blob} data Request data.
    @param {string} successF Succes function.
    @param {string} errorF Error function.
  */
  request(url, type, contentType, data, successF, errorF) {
    Ember.$.ajax({
      url: url,
      type: type,
      data: data,
      processData: false,
      contentType: contentType,
      async: false,
      success: function(data) {
        successF(data);
      },
      error: function(data) {
        errorF(data);
      }
    });
  },

  actions: {
    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.approve:method"}}'approve' action{{/crossLink}}.

      @method actions.onApproveError
    */
    onApproveError() {
      this.set('rastrMessageVisible', false);
      this.set('message', '');
      this.set('typeMessage', 'error');
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.approve:method"}}'approve' action{{/crossLink}}.

      @method actions.onApprove
    */
    onApprove() {
      let file = this.get('_fileControl');
      if (!Ember.isNone(file)) {
        let layerProperties = this.get('getLayerProperties')();
        let layerName = JSON.parse(layerProperties.settings).layers.split(':');
        let url = JSON.parse(layerProperties.settings).url.split('/geoserver');
        if (!Ember.isNone(layerName)) {
          let _this = this;
          let config = Ember.getOwner(this).resolveRegistration('config:environment');

          this.request(`${url[0]}/geoserver/rest/workspaces/${layerName[0]}`, 'GET', 'application/json', '',
            (data) => {
              this.request(`${url[0]}/geoserver/rest/workspaces/${layerName[0]}/coveragestores/${layerName[1]}`, 'GET', 'application/json', '',
                (data) => {
                  this.set('rastrMessageVisible', true);
                  this.set('message', this.get('storeExistErrorMessage'));
                  this.set('typeMessage', 'error');
                },
                (data) => {
                  _this.request(`${url[0]}/geoserver/rest/workspaces/${layerName[0]}/coveragestores/${layerName[1]}/file.geotiff?coverageName=${layerName[1]}`,
                    'PUT', 'image/tiff', file,
                    (data) => {
                      this.sendAction('approve', {
                        layerProperties: layerProperties,
                        layer: this.get('layer')
                      });
                      this.set('rastrMessageVisible', true);
                      this.set('message', this.get('createLayerMessage'));
                      this.set('typeMessage', 'success');
                    },
                    (data) => {
                      this.set('rastrMessageVisible', true);
                      this.set('message', this.get('createLayerErrorMessage'));
                      this.set('typeMessage', 'error');
                    }
                  );
                }
              );
            },
            (data) => {
              this.set('rastrMessageVisible', true);
              this.set('message', this.get('existWorkspaceErrorMessage') + ' ' + config.APP.geoserver.workspaceRastr);
              this.set('typeMessage', 'error');
            });
        }
      } else {
        this._super(...arguments);
      }
    },

    /**
      Handles onUploadFile.

      @method actions.onUploadFile
    */
    onUploadFile(file) {
      if (!Ember.isNone(file)) {
        this.set('_fileControl', file);
      }
    }
  }
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryAddLayerDialogComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryAddLayerDialogComponent;
