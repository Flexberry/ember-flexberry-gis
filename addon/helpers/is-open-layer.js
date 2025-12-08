import Ember from 'ember';

export function isOpenLayer([layer] /*, hash*/) {
  if (!layer) {
    return false;
  }

  let url = Ember.get(layer, 'settingsAsObject.url');
  let urlAsObj = null;
  const withoutDomainRegex = /^\/geoserver\/[^\/]+\/ows$/;

  if (!url) return false;

  if (withoutDomainRegex.test(url)) {
    return false;
  }

  try {
    urlAsObj = new URL(url);
  } catch (error) {
    console.error({ url: url, message: 'Cannot parse layer.settingsAsObject.url', error: error });
  }

  return urlAsObj && urlAsObj.hostname !== window.location.hostname;
}

export default Ember.Helper.helper(isOpenLayer);
