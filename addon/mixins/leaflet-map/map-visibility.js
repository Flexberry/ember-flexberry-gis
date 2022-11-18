/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin which injects visibility methods into map-tools and map-commands.

  @class LeafletMapVisibilityMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  // Add class hidden
  addClassHidden($commandControl) {
    if ($commandControl.length === 1 && !$commandControl.hasClass('hidden')) {
      $commandControl.addClass('hidden');
    } else {
      let $commandControlInner = $commandControl.children();
      for (var command of $commandControlInner) {
        if (!Ember.$(command).hasClass('hidden')) {
          Ember.$(command).addClass('hidden');
        }
      }
    }
  },

  // Remove class hidden
  removeClassHidden($commandControl) {
    if ($commandControl.length === 1 && $commandControl.hasClass('hidden')) {
      $commandControl.removeClass('hidden');
    } else {
      let removeHidden = function(children) {
        for (var command of children) {
          if (Ember.$(command).hasClass('hidden')) {
            Ember.$(command).removeClass('hidden');
          }
        }

        if (children.childNodes) {
          removeHidden(children.children());
        }
      };

      removeHidden($commandControl.children());

    }
  },

  /**
    Show or hide tools/commands

    @param {String} mapCommandName map-command/map-tool name.
    @param {function} funcClass addClassHidden or removeClassHidden.
    @param {Object} leafletMap Leaflet map.
    @param {boolean} isTool flag, which indicate that is tool, that hide/show tools zoom.
  */
  showHide(mapCommandName, funcClass, leafletMap, isTool) {
    let $leafletContainer = Ember.$(leafletMap._container);

    if (Ember.isNone(mapCommandName)) {
      funcClass(Ember.$('.flexberry-maptoolbar'));
      funcClass(Ember.$('.toggle-button'));
      funcClass(Ember.$('.outer-search'));
      funcClass(Ember.$('.main-map-tab-bar'));
      funcClass($leafletContainer.find('.leaflet-control-container .leaflet-control-zoom'));
      funcClass($leafletContainer.find('.leaflet-control-container .leaflet-control-scale'));
      funcClass($leafletContainer.find('.leaflet-control-container .history-control'));
      return true;
    }

    switch (mapCommandName) {
      case 'treeview':
      case 'search':
      case 'identify':
      case 'bookmarks':
        funcClass(Ember.$(`.${mapCommandName}-tab`));
        return true;
      case 'toggle-button':
      case 'outer-search':
        funcClass(Ember.$(`.${mapCommandName}`));
        return true;
      case 'analytics':
        funcClass(Ember.$(`.item.${mapCommandName}`));
        return true;
      case 'zoom':
      case 'scale':
        funcClass($leafletContainer.find(`.leaflet-control-${mapCommandName}`));
        return true;
      case 'history':
        funcClass($leafletContainer.find(`.${mapCommandName}-control`));
        return true;
      case 'more':
      case 'full-extent':
        funcClass(Ember.$(`.flexberry-${mapCommandName}-map-command`));
        return true;
      default:
        return false;
    }
  },

  showHideTool(mapToolName, isTool, funcClass) {
    let endClass = '-map-tool';
    if (!isTool) {
      endClass = '-map-command';
    }

    let mapToolClass = `.flexberry-${mapToolName}${endClass}.flexberry-map-tool`;
    let $toolControl = Ember.$(`.flexberry-maptoolbar ${mapToolClass}`);
    funcClass($toolControl);
  }
});
