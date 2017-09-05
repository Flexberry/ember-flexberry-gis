import Ember from 'ember';
import layout from '../templates/components/flexberry-table';

export default Ember.Component.extend({
  layout,
  perPageValues: [5, 10, 20, 50],
  perPageValue: 5,
  selectedPageNum: 1,
  rows: [],
  totalRowsCount: 0,

  totalPageCount: Ember.computed('totalRowsCount', 'perPageValue', {
    get() {
      let f = Math.floor(this.get('totalRowsCount') / this.get('perPageValue'));
      let p = this.get('totalRowsCount') % this.get('perPageValue');
      return f + (p !== 0 ? 1 : 0);
    }
  }),

  pages: Ember.computed('totalPageCount', 'selectedPageNum', {
    get() {
      let a = [...Array(this.get('totalPageCount')).keys()];
      let pages = a.map((item) => {
        return {
          number: item + 1,
          isCurrent: (item + 1) === this.get('selectedPageNum'),
          isEllipis: false
        };
      });
      return pages;
    }
  }),

  hasPreviousPage: Ember.computed('selectedPageNum', {
    get() {
      return this.get('selectedPageNum') > 1;
    }
  }),

  hasNextPage: Ember.computed('totalPageCount', 'selectedPageNum', {
    get() {
      return this.get('selectedPageNum') < this.get('totalPageCount');
    }
  }),

  columnCount: Ember.computed('header', {
    get() {
      return Object.keys(this.get('header')).length;
    }
  }),

  _reload() {
    let l = this.get('perPageValue');
    let p = this.get('selectedPageNum');
    this.sendAction('getData', {
      modelName: this.attrs.modelName,
      projectionName: this.attrs.projectionName,
      top: l,
      skip: (p - 1) * l
    });
  },

  actions: {
    perPageClick() {
      this._reload();
    },
    previousPage() {
      let p = this.get('selectedPageNum');
      if (p > 1) {
        this.set('selectedPageNum', p--);
        this._reload();
      }
    },
    nextPage() {
      let p = this.get('selectedPageNum');
      let l = this.get('totalPageCount');
      if (p < l) {
        this.set('selectedPageNum', p++);
        this._reload();
      }
    },
    gotoPage(_, p) {
      this.set('selectedPageNum', p);
      this._reload();
    }
  },
});
