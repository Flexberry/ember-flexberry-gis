import { getDateFormatFromString, createTimeInterval } from 'ember-flexberry-gis/utils/get-date-from-string';
import moment from 'moment';
import { module, test } from 'qunit';

module('Unit | Utility | get date from string');

test('getDateFormatFromString() test', function(assert) {

  assert.deepEqual({ dateFormat: 'DD.MM.YYYY', timeFormat: '' }, getDateFormatFromString('21.01.2002'));
  assert.deepEqual({ dateFormat: 'DD.MM.YYYY', timeFormat: ' HH:mm' }, getDateFormatFromString('21.01.2002 10:30'));
  assert.deepEqual({ dateFormat: 'DD.MM.YYYY', timeFormat: ' HH:mm:ss' }, getDateFormatFromString('21.01.2002 10:30:22'));
  assert.deepEqual({ dateFormat: 'YYYY-MM-DD', timeFormat: 'THH:mm:ss.SSSSZ' }, getDateFormatFromString('2021-12-28T12:07:37.174Z'));
  assert.deepEqual({ dateFormat: undefined, timeFormat: undefined }, getDateFormatFromString('2021-13-12 12:07:37'));

});

test('createTimeInterval() test', function(assert) {
  let input = '12.01.2021 10:30:22';
  let timeInfo = getDateFormatFromString(input);
  let date = moment.utc(input, timeInfo.dateFormat + timeInfo.timeFormat);
  let [startInterval, endInterval] = createTimeInterval(date, timeInfo.dateFormat);

  assert.equal('2021-01-12T10:30:22.000Z', startInterval);
  assert.equal('2021-01-12T10:30:23.000Z', endInterval);

  let input2 = '2021-01-12T12:20:30.000Z';
  let timeInfo2 = getDateFormatFromString(input2);
  let date2 = moment.utc(input2, timeInfo2.dateFormat + timeInfo2.timeFormat);
  let [startInterval2, endInterval2] = createTimeInterval(date2, timeInfo2.dateFormat);
  assert.equal('2021-01-12T12:20:30.000Z', startInterval2);
  assert.equal(undefined, endInterval2);
});
