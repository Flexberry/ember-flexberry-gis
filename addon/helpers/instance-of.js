import { helper as buildHelper } from '@ember/component/helper';

export function instanceOf([a, b]/*, hash*/) {
  return (a instanceof b);
}

export default buildHelper(instanceOf);
