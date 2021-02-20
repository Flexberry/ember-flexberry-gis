// Requirement of ember-browserify.
// In order to use NPM pacakges inside the addon, we have to import
// them from somewhere in /app directory.
// See: https://github.com/ef4/ember-browserify#using-ember-browserify-in-addons
import * as buffer from 'npm:@turf/buffer';
import * as helpers from 'npm:@turf/helpers';
import * as difference from 'npm:@turf/difference';
import * as booleanEqual from 'npm:@turf/boolean-equal';
import * as lineSplit from 'npm:@turf/line-split';
import * as polygonToLine from 'npm:@turf/polygon-to-line';
import * as lineToPolygon from 'npm:@turf/line-to-polygon';
import * as booleanWithin from 'npm:@turf/boolean-within';
import * as kinks from 'npm:@turf/kinks';
import * as helper from 'npm:@turf/helpers';
import * as lineIntersect from 'npm:@turf/line-intersect';
import * as intersect from 'npm:@turf/intersect';
import * as lineSlice from 'npm:@turf/line-slice';
import * as invariant from 'npm:@turf/invariant';
import * as distance from 'npm:@turf/distance';
import * as midpoint from 'npm:@turf/midpoint';
import * as union from 'npm:@turf/union';
import * as turf from 'npm:@turf/combine';
import * as area from 'npm:@turf/area';
import * as booleanPointInPolygon from 'npm:@turf/boolean-point-in-polygon';
import * as booleanContains from 'npm:@turf/boolean-contains';
import * as projection from 'npm:@turf/projection';
import * as sideBySide from 'npm:leaflet-side-by-side';
import * as jsts from 'npm:jsts';
import * as clipper from 'npm:clipper-lib';
