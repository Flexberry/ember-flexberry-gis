/**
  @module ember-flexberry-gis-dummy
*/

import ListMapRoute from 'ember-flexberry-gis/routes/list-map';

/**
  Maps list route.

  @class MapsRoute
  @extends ListMapRoute
*/
export default ListMapRoute.extend({
  /**
    Defined developer user settings.
    For default userSetting use empty name ('').
    Property `<componentName>` may contain any of properties: `colsOrder`, `sorting`, `colsWidth` or being empty.

    ```javascript
    {
      <componentName>: {
        <settingName>: {
          colsOrder: [ { propName :<colName>, hide: true|false }, ... ],
          sorting: [{ propName: <colName>, direction: "asc"|"desc" }, ... ],
          colsWidths: [ <colName>:<colWidth>, ... ],
        },
        ...
      },
      ...
    }
    ```

    @property developerUserSettings
    @type Object
    @default { NewPlatformFlexberryGISMapL: {} }
  */
  developerUserSettings: { NewPlatformFlexberryGISMapL: {} }
});
