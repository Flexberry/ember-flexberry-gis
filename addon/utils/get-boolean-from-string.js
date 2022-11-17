
export default function getBooleanFromString(str = '') {
  let result = null;
  switch (str.toLowerCase()) {
    case '1' : case 'да': case 'true': case 'yes':
      result = true;
      break;
    case '0' : case 'нет': case 'false': case 'no':
      result = false;
      break;

  }
  return result;
}
