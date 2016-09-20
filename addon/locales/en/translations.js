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
    'flexberry-maptoolbar': {
      'measureCaption': 'Measure',
      'mearkerMeasure': 'Coordinates',
      'circleMeasure': 'Radius',
      'polylineMeasure': 'Distance',
      'polygonMeasure': 'Area'
    },
    'flexberry-measuretool': {
      'marker': {
        'move': 'Click on the map to fix coordinates',
        'drag': 'Release the mouse to fix coordinates',
        'labelPrefix': '<b>',
        'labelPostfix': '</b>',
        'northLatitude': 'N&nbsp;',
        'southLatitude': 'S&nbsp;',
        'eastLongitude': 'E',
        'westLongitude': 'W'
      },
      'circle': {
        'move': 'Press and hold the mouse button, drag the cursor to draw a circle',
        'drag': 'Release the mouse button to fix the circle.',
        'labelPrefix': '<b>Radius:&nbsp;',
        'labelPostfix': '</b>',
      },
      'polygon': {
        'move': 'Click on the map to add the initial vertex.',
        'add': 'Click on the map to add a new vertex.',
        'commit': 'Click on the current vertex to fix area',
        'drag': 'Release the mouse to fix the area',
        'labelPrefix': '<b> Area:&nbsp;',
        'labelPostfix': '</ b>',
      },
      'polyline': {
        'move': 'Click on the map to add the initial vertex.',
        'add': 'Click on the map to add a new vertex.',
        'commit': 'Click on the current vertex to fix distance',
        'drag': 'Release the mouse to fix the distance',
        'distanceLabelPrefix': '<b>L',
        'distanceLabelPostfix': '</b>',
        'incLabelPrefix': '<br/><i>Δ',
        'incLabelPostfix': '</i>'
      },
      'distanceMeasureUnit': {
        'meter':'&nbsp;m',
        'kilometer':'&nbsp;km',
      }
    }
  }
};
