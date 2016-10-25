// Fixes definition of jsonix library.
// It is dependency of ows.js which is needed to work with CSW-services.
;(function(globalContext) {
  globalContext.Jsonix = _jsonix_factory().Jsonix;
})(this);