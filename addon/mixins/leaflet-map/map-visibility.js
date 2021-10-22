/**
  @module ember-flexberry-gis
*/

import { isNone } from '@ember/utils';

import $ from 'jquery';
import Mixin from '@ember/object/mixin';

/**
  Mixin which injects visibility methods into map-tools and map-commands.

  @class LeafletMapVisibilityMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Mixin.create({
  // Add class hidden
  addClassHidden($commandControl) {
    if ($commandControl.length === 1 && !$commandControl.hasClass('hidden')) {
      $commandControl.addClass('hidden');
    } else {
      const $commandControlInner = $commandControl.children();
      for (const command of $commandControlInner) {
        if (!$(command).hasClass('hidden')) {
          $(command).addClass('hidden');
        }
      }
    }
  },

  // Remove class hidden
  removeClassHidden($commandControl) {
    if ($commandControl.length === 1 && $commandControl.hasClass('hidden')) {
      $commandControl.removeClass('hidden');
    } else {
      const $commandControlInner = $commandControl.children();
      for (const command of $commandControlInner) {
        if ($(command).hasClass('hidden')) {
          $(command).removeClass('hidden');
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
    const $leafletContainer = $(leafletMap._container);

    if (isNone(mapCommandName)) {
      funcClass($('.flexberry-maptoolbar'));
      funcClass($leafletContainer.find('.leaflet-control-container .leaflet-control-zoom'));
      funcClass($leafletContainer.find('.leaflet-control-container .history-control'));
      return true;
    }

    if (mapCommandName.includes('history-')) {
      funcClass($leafletContainer.find(`.leaflet-control-container .history-control .${mapCommandName}-button`));
      return true;
    }

    if (mapCommandName.includes('zoom-') && !isTool) {
      funcClass($leafletContainer.find(`.leaflet-control-container .leaflet-control-zoom .leaflet-control-${mapCommandName}`));
      return true;
    }

    return false;
  },

  showHideTool(mapToolName, isTool, funcClass) {
    let endClass = '-map-tool';
    if (!isTool) {
      endClass = '-map-command';
    }

    const mapToolClass = `.flexberry-${mapToolName}${endClass}.flexberry-map-tool`;
    const $toolControl = $(`.flexberry-maptoolbar ${mapToolClass}`);
    funcClass($toolControl);
  },
});
