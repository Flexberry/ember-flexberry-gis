import Ember from 'ember';
import layout from '../templates/components/image-loader';

export default Ember.Component.extend({
  layout,

  imageUrl: null,

  token: null,

  previewBase64: null,

  init() {
    this._super(...arguments);
    this.loadImage();
  },

  loadImage() {
    let token = this.get('token');
    let imageUrl = this.get('imageUrl');
    let _this = this;
    $.ajax({
      url: imageUrl,
      method: 'GET',
      headers: {
        'Authorization': token,
      },
      success: (data, textStatus, jqXHR) => {
        _this.set('previewBase64', data);
      },
      error: (jqXHR, textStatus, errorThrown) => {
        console.error('Ошибка при загрузке фото:', errorThrown);
      }
    });
  }
});
