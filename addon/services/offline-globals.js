import OfflineGlobals from 'ember-flexberry/services/offline-globals';
import Ember from 'ember';

export default OfflineGlobals.extend({
  init() {
    this._super(...arguments);
    this.setOnlineAvailable(false);
  },
  getOfflineSchema() {
    let parentSchema = this._super(...arguments);
    let returnedSchema = Ember.merge(parentSchema, {
      'new-platform-flexberry-g-i-s-background-layer': 'id,anyText,boundingBox,coordinateReferenceSystem,createTime,creator,description,editor,editTime,index,keyWords,name,owner,public,scale,settings,type,visibility',
			'new-platform-flexberry-g-i-s-csw-connection': 'id,createTime,creator,editor,editTime,name,url',
			'new-platform-flexberry-g-i-s-data-link-parameter': 'id,expression,layerField,linkField,objectField,link',
			'new-platform-flexberry-g-i-s-data-link': 'id,clearWithoutLink,createObject,layerTable,mapObjectSetting,*dataLinkParameter',
			'new-platform-flexberry-g-i-s-favorite-feature': 'id,createTime,creator,editor,editTime,objectKey,objectLayerKey,userKey',
			'new-platform-flexberry-g-i-s-layer-link': 'id,allowShow,mapObjectSetting,layer,*parameters',
			'new-platform-flexberry-g-i-s-layer-metadata': 'id,additionalData,anyText,boundingBox,coordinateReferenceSystem,createTime,creator,description,editor,editTime,keyWords,name,scale,settings,type,*linkMetadata',
			'new-platform-flexberry-g-i-s-link-metadata': 'id,allowShow,createTime,creator,editor,editTime,mapObjectSetting,layer,*parameters',
			'new-platform-flexberry-g-i-s-link-parameter': 'id,expression,layerField,linkField,objectField,queryKey,layerLink',
			'new-platform-flexberry-g-i-s-map-layer': 'id,anyText,boundingBox,coordinateReferenceSystem,createTime,creator,description,editor,editTime,index,keyWords,name,owner,public,scale,securityKey,settings,type,visibility,parent,map,*layerLink',
			'new-platform-flexberry-g-i-s-map-object-setting': 'id,editForm,listForm,multEditForm,title,typeName,defaultMap',
			'new-platform-flexberry-g-i-s-map': 'id,anyText,boundingBox,coordinateReferenceSystem,createTime,creator,description,editor,editTime,editTimeMapLayers,keyWords,lat,lng,name,owner,picture,public,scale,settings,zoom,*mapLayer',
			'new-platform-flexberry-g-i-s-parameter-metadata': 'id,createTime,creator,editor,editTime,expression,layerField,linkField,objectField,queryKey,layerLink'
    });

    return returnedSchema;
  }
});
