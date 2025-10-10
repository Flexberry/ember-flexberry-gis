import Ember from 'ember';

export default Ember.Helper.extend({
  compute(args) {
    let value = args.length >= 1 ? args[0] : undefined;
    let searchValue = args.length >= 2 ? args[1] : undefined;

    if (value && searchValue && value.toLowerCase().indexOf(searchValue.toLowerCase()) > -1) {
      let index = value.toLowerCase().indexOf(searchValue.toLowerCase());
      return value.substring(0, index) + '<b><span>' + searchValue + '</span></b>'
        + value.substring(index + searchValue.length);
    } else {
      return value;
    }
  }
});
