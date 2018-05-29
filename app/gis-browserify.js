// Requirement of ember-browserify.
// In order to use NPM pacakges inside the addon, we have to import
// them from somewhere in /app directory.
// See: https://github.com/ef4/ember-browserify#using-ember-browserify-in-addons
import * as difference from 'npm:@turf/difference';
import * as lineIntersect from 'npm:@turf/line-intersect';
import * as invariant from 'npm:@turf/invariant';
import * as helper from 'npm:@turf/helpers';
import * as booleanEqual from 'npm:@turf/boolean-equal';
