import Ember from 'ember';

export function availableCoordinateReferenceSystemsCodesWithCaptions(that) {
  let owner = Ember.getOwner(that);
  let i18n = owner.lookup('service:i18n');
  let crsFactories = owner.knownForType('coordinate-reference-system');
  let crsFactoriesNames = owner.knownNamesForType('coordinate-reference-system');
  return crsFactoriesNames.reduce((obj, crs) => {
    let crsFactory = Ember.get(crsFactories, crs);
    let localeCaption = Ember.get(crsFactory, 'localeCaption');
    if (Ember.get(crsFactory, 'localeCaption')) {
      let code = Ember.get(crsFactory, 'code');
      obj[code] = i18n.t(localeCaption).string;
    }

    return obj;
  }, {
    'auto': i18n.t('components.geometry-add-modes.import.coordinates-auto').string
  });
}
