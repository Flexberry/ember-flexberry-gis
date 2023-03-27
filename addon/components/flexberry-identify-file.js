import Ember from 'ember';
import $ from 'jquery';
import layout from '../templates/components/flexberry-identify-file';
import CheckFileMixin from '../mixins/flexberry-check-file';
import { availableCoordinateReferenceSystemsCodesWithCaptions } from '../utils/available-coordinate-reference-systems-for-dropdown';

export default Ember.Component.extend(CheckFileMixin, {
  layout,
  mapApi: Ember.inject.service(),
  
  filePreview: false,
  systemCoordinates: null,

  /**
   * We need to differentiate events from different instances, because we don't turn off event subscriptions
   * 
  */
  suffix: Ember.computed('geomOnly', function () {
    let geomOnly = this.get('geomOnly');
    return geomOnly ? '-geom' : '';
  }),

  didInsertElement() {
    this._super(...arguments);
    
    this.set('systemCoordinates', this.get('systemCoordinates') || availableCoordinateReferenceSystemsCodesWithCaptions(this));
    this.set('coordinate', 'auto');

    this.send('clearFile');
  },

  willDestroyElement() {
    this._super(...arguments);
    this.clearAjax();
  },

  sendFileToCache() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.$('input[type="file"]');
      let file = this.$('input[type="file"]')[0].files[0];
      let config = Ember.getOwner(this).resolveRegistration('config:environment');
      let url = config.APP.fileCacheUrl;
      let data = new FormData();
      data.append(file.name, file);

      Ember.$.ajax({
        url: url,
        type: 'POST',
        data: data,
        cache: false,
        contentType: false,
        processData: false
      }).done((response) => {
        resolve(response);
      }).fail((e) => {
        let errorMessage = e.responseText || this.get('importErrorMessage');
        reject({
          message: errorMessage
        });
      });
    });
  },

  actions: {
    onCoordinateChange() {
      this.set('_showError', false);
      this.clearAjax();
    },

    clearFile() {
      this.set('file', null);
      this.set('coordinate', 'auto');
      this.set('_showError', false);

      this.clearAjax();
      if (this.get('filePreview')) {
        this.get('mapApi').getFromApi('leafletMap').fire(`flexberry-map-loadfile${this.get('suffix')}:clear`);
        this.set('filePreview', false);
      }

      $('#fileinput').val('');
      this.$('.ui.button.upload').removeClass('hidden');
      this.$('.ui.button.remove').addClass('hidden');
    },

    clickFile(e) {
      let file = e.target.files[0];
      this.set('file', file);
      this.clearAjax();
      this.$('.ui.button.upload').addClass('hidden');
      this.$('.ui.button.remove').removeClass('hidden');
    },

    showFileLayer() {
      if (this.get('filePreview')) {
        this.get('mapApi').getFromApi('leafletMap').fire(`flexberry-map-loadfile${this.get('suffix')}:clear`);
        this.set('filePreview', !this.get('filePreview'));
      } else {
        this.validateFileAndGetFeatures().then((response) => {
          if (response) {
            let layer = this.createLayer(response);
            if (layer) {
              this.get('mapApi').getFromApi('leafletMap').fire(`flexberry-map-loadfile${this.get('suffix')}:render`, { layer });
              this.set('filePreview', !this.get('filePreview'));
            }
          }
        }, (error) => this.showError(error));
      }
    },

    identificationFile() {
      this.validateFileAndGetFeatures().then((response) => {
        if (response) {
          let layer = this.createLayer(response);
          if (layer) {
            this.get('mapApi').getFromApi('leafletMap').fire(`flexberry-map-loadfile${this.get('suffix')}:identification`, { layer, geometryType: this.get('geometryType') });
          }
        }
      }, (error) => this.showError(error));
    },

    createLayerByFile() {
      let config = Ember.getOwner(this).resolveRegistration('config:environment');
      this.validateFileAndGetFeatures().then(() => {
        this.sendFileToCache().then((response) => {
          let url = `${config.APP.createLayerFormUrl}?cacheFileId=${response.id}&crs=${this.get('coordinate')}&geometryType=${this.get('geometryType')}`;
          window.open(url, '_blank').focus();
        }, (error) => this.showError(error));
      }, (error) => this.showError(error));
    }
  }
});
