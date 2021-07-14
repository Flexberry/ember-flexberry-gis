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
      let $commandControlInner = $commandControl.children();
      for (var command of $commandControlInner) {
        if (Ember.$(command).hasClass('hidden')) {
          Ember.$(command).removeClass('hidden');
        }
      }
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

    if (mapCommandName.includes('history-')) {
      funcClass($leafletContainer.find(`.leaflet-control-container .history-control .${mapCommandName}-button`));
      return true;
    } else if (mapCommandName.includes('zoom-') && !isTool) {
      funcClass($leafletContainer.find(`.leaflet-control-container .leaflet-control-zoom .leaflet-control-${mapCommandName}`));
      return true;
    } else if (mapCommandName.includes('scale-')) {
      funcClass($leafletContainer.find(`.leaflet-control-container .leaflet-control-scale .leaflet-control-${mapCommandName}`));
      return true;
    } else if (mapCommandName.includes('treeview')) {
      funcClass(Ember.$('*[class$="isogd-' + mapCommandName + '-tab"]'));
      return true;
    } else if (mapCommandName.includes('search')) {
      funcClass(Ember.$('*[class$="isogd-' + mapCommandName + '-tab"]'));
      return true;
    } else if (mapCommandName.includes('identify')) {
      funcClass(Ember.$('*[class$="isogd-' + mapCommandName + '-tab"]'));
      return true;
    } else if (mapCommandName.includes('bookmarks')) {
      funcClass(Ember.$('*[class$="isogd-' + mapCommandName + '-tab"]'));
      return true;
    } else if (mapCommandName.includes('analytics')) {
      funcClass(Ember.$('*[class$="' + mapCommandName + "]"));
      return true;
    } else if (mapCommandName.includes('toggle')) {
      funcClass(Ember.$(`.${mapCommandName}-button`));
      return true;
    } else if (mapCommandName.includes('outer-search')) {
      funcClass(Ember.$(`.${mapCommandName}`));
      return true;
    } else if (mapCommandName.includes('more')) {
      funcClass(Ember.$('*[class$="' + mapCommandName + '-map-command"], *[class*="' + mapCommandName + '-map-command "]'));
      return true;
    } else if (mapCommandName.includes('background-layers')) {
      funcClass(Ember.$(`.${mapCommandName}`));
      return true;
    }

    return false;
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
