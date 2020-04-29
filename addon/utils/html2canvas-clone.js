import Ember from 'ember';

/**
  Callback function which is called when the Document has been cloned for rendering, can be used to modify
  the contents that will be rendered without affecting the original source document.
  @param {html} clonedDoc
*/
export default function html2canvasClone(clonedDoc) {
  let elem = Ember.$(clonedDoc).find('[style*="transform: translate"]');
  elem.each((ind) => {
    let $item = Ember.$(elem[ind]);
    let matrix = $item.css('transform');
    if (matrix !== 'none') {
      let tr = matrix.split(', ');
      $item.css('transform', '');
      $item.css('top', tr[5].replace(')', '') + 'px');
      $item.css('left', tr[4] + 'px');
    }
  });
}
