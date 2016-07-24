import EditFormController from 'ember-flexberry/controllers/edit-form';

export default EditFormController.extend({
 actions: {
    updateCenter(e) {
      let center = e.target.getCenter();
      this.set('model.lat', center.lat);
      this.set('model.lng', center.lng);
    }
  }
});
