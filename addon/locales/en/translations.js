export default {
  'forms': {
    'new-platform-flexberry-g-i-s-map-layer-tile': {
      'url': 'Url',
      'minZoom': 'Min zoom',
      'maxZoom': 'Max zoom',
      'maxNativeZoom': 'Max native zoom',
      'tileSize': 'Tile size',
      'subdomains': 'Subdomains',
      'errorTileUrl': 'Error tile url',
      'attribution': 'Attribution',
      'tms': 'Tms',
      'continuousWorld': 'Continuous world',
      'noWrap': 'No wrap',
      'zoomOffset': 'Zoom offset',
      'zoomReverse': 'Zoom reverse',
      'opacity': 'Opacity',
      'zIndex': 'ZIndex',
      'unloadInvisibleTiles': 'Unload invisible tiles',
      'updateWhenIdle': 'Update when idle',
      'detectRetina': 'Detect retina',
      'reuseTiles': 'Reuse tiles',
      'bounds': 'Bounds'
    },

    'new-platform-flexberry-g-i-s-map-layer-wms': {
      'url': 'Url',
      'layers': 'Layers',
      'styles': 'Styles',
      'format': 'Format',
      'transparent': 'Transparent',
      'version': 'Version',
      'crs': 'Crs'
    },

    'new-platform-flexberry-g-i-s-map-layer-unknown': {
      'unknown-layer': 'Unknown layer type'
    }
  },

  'components': {
    'flexberry-dialog': {
      'approve-button': {
        'caption': 'Ok'
      },
      'deny-button': {
        'caption': 'Cancel'
      }
    },

    'layers-dialogs': {
      'remove': {
        'caption': 'Remove layer',
        'content': 'Do you really want to remove \'{{layerName}}\' layer?',
        'approve-button': {
          'caption': 'Yes'
        },
        'deny-button': {
          'caption': 'No'
        }
      },

      'edit': {
        'caption': 'Edit layer',
        'approve-button': {
          'caption': 'Ok'
        },
        'deny-button': {
          'caption': 'Cancel'
        },
        'type-dropdown': {
          'caption': 'Layer type'
        },
        'name-textbox': {
          'caption': 'Layer name'
        },
        'crs-textarea': {
          'caption': 'Layer coordinate reference system (CRS)'
        }
      },

      'add': {
        'caption': 'Add new layer',
        'approve-button': {
          'caption': 'Ok'
        },
        'deny-button': {
          'caption': 'Cancel'
        },
        'type-dropdown': {
          'caption': 'Layer type'
        },
        'name-textbox': {
          'caption': 'Layer name'
        },
        'crs-textarea': {
          'caption': 'Layer coordinate reference system (CRS)'
        }
      },

      'settings': {
        'group': {
        },

        'tile': {
          'url-textbox': {
            'caption': 'Url'
          }
        },

        'wms': {
          'url-textbox': {
            'caption': 'Url'
          },
          'version-textbox': {
            'caption': 'WMS version'
          },
          'layers-textbox': {
            'caption': 'Layers'
          },
          'format-textbox': {
            'caption': 'Image format'
          },
          'transparent-checkbox': {
            'caption': 'Allow images transparency'
          }
        }
      }
    },

    'flexberry-tree': {
      'placeholder': 'Tree nodes are not defined'
    },

    'flexberry-maplayers': {
      'placeholder': 'Layers are not defined'
    },

    'flexberry-maplayer': {
    },
    'flexberry-export': {
      'export': 'Export',
      'download': 'Export to image',
      'print': 'Print',
      'wrongBeginSelector': 'JQuery selector does not begin with an initial parenthesis (',
      'wrongEndSelector': 'JQuery selector does not end parenthesis )',
      'jqueryNotAvailable': 'In the options used JQuery selector, but JQuery is not included. Include JQuery or use  DOM-selectors: .class, #id or DOM-elements',
      'popupWindowBlocked': 'Print window has been blocked by your browser. Please enable pop-up windows on this page',
      'emptyFilename': 'No file name specified for downloading',
      'downloadCaption': 'Set the export options in the image',
      'printCaption': 'Set the options for printing',
      'caption': 'Map title',
      'nocaption': 'No title',
      'font': 'Font',
      'fillStyle': 'Color',
      'except': 'Exclude',
      'zoom': 'Zoom',
      'attributes': 'Copyright',
      'type': 'Type',
      'fileName': 'File name'
    }
  }
};
