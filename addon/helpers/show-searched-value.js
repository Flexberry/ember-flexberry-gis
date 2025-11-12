import Ember from 'ember';

export default Ember.Helper.extend({
  compute(args) {
    let value = args.length >= 1 ? args[0] : undefined;
    let searchValue = args.length >= 2 ? args[1] : undefined;

    let search = function (value, searchValue) {
      if (!searchValue) return value;

      const searches = searchValue.toLowerCase().split(' ');

      let startIndex = 0;
      let finded = true;
      let text = '';

      searches.forEach((s) => {
        if (!s) return;

        let index = value.toLowerCase().indexOf(s, startIndex);
        if (index > -1) {
          text = text + value.substring(startIndex, index) + '<b><span>' + value.substring(index, index + s.length) + '</span></b>';
          startIndex = index + s.length;
        } else {
          finded = false;
        }
      });

      if (finded) {
        text = text + value.substring(startIndex);
        return text;
      }

      return value;
    }

    return search(value, searchValue);
  }
});
