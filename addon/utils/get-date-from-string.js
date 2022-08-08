const dateFormats = ['DD.MM.YYYY', 'DD-MM-YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD', 'YYYY.MM.DD', 'YYYY-MM-DD'];
const timeFormats = [' HH:mm', ' HH:mm:ss', 'THH:mm:ss.SSSSZ', ''];

let getDateFormatFromString = (str) => {

  let dateFormat = dateFormats.find(dateFormat => moment(str.split(/[\sT]+/)[0], dateFormat, true).isValid());

  let timeFormat = timeFormats.find(timeFormat=> moment(str, dateFormat + timeFormat, true).isValid());

  return { dateFormat, timeFormat };
};

let createTimeInterval = (date, dateFormat) => {
  if (!date || !dateFormat) {
    return [];
  }

  let startInterval = date.toISOString();
  let endInterval = null;
  switch (date.creationData().format) {
    case dateFormat:

      // Search the entire day
      endInterval =  date.add(1, 'days').toISOString();
      break;

    case dateFormat + ' HH:mm':

      // Search by the exact time in the interval of one minute
      endInterval = date.add(60 - date.seconds(), 'seconds').toISOString();
      break;
    case dateFormat + ' HH:mm:ss':

      // Search by the exact time in the interval of one second
      endInterval =  date.add(1, 'seconds').toISOString();
      break;
    default:
      return [startInterval];
  }

  return [startInterval, endInterval];
};

export {
  getDateFormatFromString, createTimeInterval
};
