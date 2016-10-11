import NewPlatformFlexberryGISLayerLinkModel from './models/new-platform-flexberry-g-i-s-layer-link';
import NewPlatformFlexberryGISLayerMetadataModel from './models/new-platform-flexberry-g-i-s-layer-metadata';
import NewPlatformFlexberryGISLinkParameterModel from './models/new-platform-flexberry-g-i-s-link-parameter';
import NewPlatformFlexberryGISMapModel from './models/new-platform-flexberry-g-i-s-map';
import NewPlatformFlexberryGISMapLayerModel from './models/new-platform-flexberry-g-i-s-map-layer';
import NewPlatformFlexberryGISMapObjectSettingModel from './models/new-platform-flexberry-g-i-s-map-object-setting';

export default {
  'models': {
    'new-platform-flexberry-g-i-s-layer-link': NewPlatformFlexberryGISLayerLinkModel,
    'new-platform-flexberry-g-i-s-layer-metadata': NewPlatformFlexberryGISLayerMetadataModel,
    'new-platform-flexberry-g-i-s-link-parameter': NewPlatformFlexberryGISLinkParameterModel,
    'new-platform-flexberry-g-i-s-map': NewPlatformFlexberryGISMapModel,
    'new-platform-flexberry-g-i-s-map-layer': NewPlatformFlexberryGISMapLayerModel,
    'new-platform-flexberry-g-i-s-map-object-setting': NewPlatformFlexberryGISMapObjectSettingModel
  },

  'forms': {
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
        'crs': {
          'caption': 'Layer coordinate reference system (CRS)',
          'code-textbox': {
            'caption': 'Code'
          },
          'definition-textare': {
            'caption': 'Definition'
          }
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
          'info-format-dropdown': {
            'caption': 'GetFeatureInfo-responses format'
          },
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
        },

        'wfs': {
          'format-dropdown': {
            'caption': 'Format'
          },
          'url-textbox': {
            'caption': 'Url'
          },
          'version-textbox': {
            'caption': 'WFS version'
          },
          'namespace-uri-textbox': {
            'caption': 'Namespace URI'
          },
          'type-ns-name-textbox': {
            'caption': 'Type namespace name'
          },
          'type-ns-textbox': {
            'caption': 'Type namespace'
          },
          'type-name-textbox': {
            'caption': 'Type name'
          },
          'geometry-field-textbox': {
            'caption': 'Geometry field'
          },
          'max-features-textbox': {
            'caption': 'Max features'
          },
          'show-existing-checkbox': {
            'caption': 'Show existing'
          },
          'style': {
            'caption': 'Style',
            'color-textbox': {
              'caption': 'Color'
            },
            'weight-textbox': {
              'caption': 'Weight'
            }
          }
        }
      }
    },

    'map-commands-dialogs': {
      'export': {
        'caption': 'Export map',
        'print-caption': 'Print map',
        'error-message-caption': 'Export map error',
        'approve-button': {
          'caption': 'Ok'
        },
        'deny-button': {
          'caption': 'Cancel'
        },
        'caption-segment': {
          'caption': 'Map caption settings',
          'caption-textbox': {
            'caption': 'Map Caption'
          },
          'font-name-textbox': {
            'caption': 'Font name'
          },
          'font-size-textbox': {
            'caption': 'Font size (in pixels)'
          },
          'font-color-textbox': {
            'caption': 'Font color'
          },
          'x-coordinate-textbox': {
            'caption': 'X-Coordinate (from map\'s top left corner)'
          },
          'y-coordinate-textbox': {
            'caption': 'Y-Coordinate (from map\'s top left corner)'
          }
        },
        'exclude-segment': {
          'caption': 'Exclude from exported map',
          'exclude-zoom-checkbox': {
            'caption': 'Zoom-control'
          },
          'exclude-contributing-checkbox': {
            'caption': 'Copyright'
          }
        },
        'download-segment': {
          'caption': 'Download file settings',
          'file-name-textbox': {
            'caption': 'File name'
          },
          'file-type-dropdown': {
            'caption': 'File type'
          }
        }
      },

      'go-to': {
        'caption': 'Go to specified point',
        'error-message': {
          'caption': 'Go to error',
          'content': 'Specified coordinates are wrong & can\'t be successfully converted into numbers'
        },
        'approve-button': {
          'caption': 'Ok'
        },
        'deny-button': {
          'caption': 'Cancel'
        },
        'lat-textbox': {
          'caption': 'Latitude'
        },
        'lng-textbox': {
          'caption': 'Longitude'
        },
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
    },

    'map-tools': {
      'drag': {
        'caption': ''
      },
      'zoom-in': {
        'caption': ''
      },
      'zoom-out': {
        'caption': ''
      },
      'identify': {
        'caption': 'Identify',
        'identify-all': {
          'caption': 'All layers'
        },
        'identify-all-visible': {
          'caption': 'All visible layers'
        },
        'identify-top-visible': {
          'caption': 'Top visible layer'
        }
      },
      'measure': {
        'caption': 'Measure',
        'measure-coordinates': {
          'caption': 'Coordinates'
        },
        'measure-radius': {
          'caption': 'Radius'
        },
        'measure-distance': {
          'caption': 'Distance'
        },
        'measure-area': {
          'caption': 'Area'
        },
        'measure-clear': {
          'caption': 'Clear'
        }
      },
      'draw': {
        'caption': 'Draw',
        'draw-marker': {
          'caption': 'Marker'
        },
        'draw-polyline': {
          'caption': 'Polyline'
        },
        'draw-circle': {
          'caption': 'Circle'
        },
        'draw-rectangle': {
          'caption': 'Rectangle'
        },
        'draw-polygon': {
          'caption': 'Polygon'
        },
        'draw-clear': {
          'caption': 'Clear'
        }
      }
    },

    'map-commands': {
      'full-extent': {
        'caption': ''
      },
      'export': {
        'caption': 'Export',
        'export-download': {
          'caption': 'Into image'
        },
        'export-print': {
          'caption': 'Print'
        }
      },
      'go-to': {
        'caption': ''
      }
    }
  },

  'map-tools': {
    'identify': {
      'caption': 'Identify',
      'modes': {
        'all': {
          'caption': 'All layers'
        },
        'all-visible': {
          'caption': 'All visible layers'
        },
        'top-visible': {
          'caption': 'Top visible layer'
        }
      },
      'error-message': 'Identification by \'{{layerName}}\' layer finished with error',
      'identify-popup': {
        'properties-table': {
          'property-name-column': {
            'caption': 'Property name'
          },
          'property-value-column': {
            'caption': 'Value'
          },
          'layer-name-property': {
            'caption': 'Layer name'
          },
          'layers-count-property': {
            'caption': 'Layers count'
          },
          'features-count-property': {
            'caption': 'Features count'
          },
          'error-property': {
            'caption': 'Error'
          }
        }
      }
    },

    'measure': {
      'measure-coordinates': {
        'move': 'Click on the map to fix coordinates',
        'drag': 'Release the mouse to fix coordinates',
        'labelPrefix': '<b>',
        'labelPostfix': '</b>',
        'northLatitude': 'N&nbsp;',
        'southLatitude': 'S&nbsp;',
        'eastLongitude': 'E',
        'westLongitude': 'W'
      },
      'measure-radius': {
        'move': 'Press and hold the mouse button, drag the cursor to draw a circle',
        'drag': 'Release the mouse button to fix the circle.',
        'labelPrefix': '<b>Radius:&nbsp;',
        'labelPostfix': '</b>',
      },
      'measure-area': {
        'move': 'Click on the map to add the initial vertex.',
        'add': 'Click on the map to add a new vertex.',
        'commit': 'Click on the current vertex to fix area',
        'drag': 'Release the mouse to fix the area',
        'labelPrefix': '<b> Area:&nbsp;',
        'labelPostfix': '</ b>',
      },
      'measure-distance': {
        'move': 'Click on the map to add the initial vertex.',
        'add': 'Click on the map to add a new vertex.',
        'commit': 'Click on the current vertex to fix distance',
        'drag': 'Release the mouse to fix the distance',
        'distanceLabelPrefix': '<b>L',
        'distanceLabelPostfix': '</b>',
        'incLabelPrefix': '<br/><i>Δ',
        'incLabelPostfix': '</i>'
      },
      'measure-units': {
        'meter': '&nbsp;m',
        'kilometer': '&nbsp;km'
      }
    }
  },

  'map-commands': {
    'go-to': {
      'lat-caption': 'Latitude',
      'lng-caption': 'Longitude'
    }
  }
};
