import NewPlatformFlexberryGISMapModel from './models/new-platform-flexberry-g-i-s-map';
import NewPlatformFlexberryGISMapLayerModel from './models/new-platform-flexberry-g-i-s-map-layer';
import NewPlatformFlexberryGISLayerMetadataModel from './models/new-platform-flexberry-g-i-s-layer-metadata';

export default {
  'models': {
    'new-platform-flexberry-g-i-s-map': NewPlatformFlexberryGISMapModel,
    'new-platform-flexberry-g-i-s-map-layer': NewPlatformFlexberryGISMapLayerModel,
    'new-platform-flexberry-g-i-s-layer-metadata': NewPlatformFlexberryGISLayerMetadataModel
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
        'meter': '&nbsp;m',
        'kilometer': '&nbsp;km',
      }
    },
    'flexberry-export': {
      'export': 'Export',
      'download': 'Export to image',
      'print': 'Print',
      'wrongBeginSelector': 'JQuery selector does not begin with an initial parenthesis (',
      'wrongEndSelector': 'JQuery selector does not end parenthesis )',
      'jqueryNotAvailable': 'In the options used JQuery selector, but JQuery is not included.' +
        'Include JQuery or use  DOM-selectors: .class, #id or DOM-elements',
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
  },

  'maptools': {
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
    }
  }
};
