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
    }
  },

  'maptools': {
    'identify': {
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
