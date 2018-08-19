var Map = require("Map")
cc.Class({
    extends: Map,

    properties: {
        
    },

    onLoad () {
        this.node.active = cc.gameConfig.isEditorMode;
        if(!this.node.active){
            return;
        }

        var Pool = require("Pool");
        this.gridPool = new Pool();
        this.gridPool.setBuildFunc(function(){
            var gridNode = new cc.Node();
            var sp = gridNode.addComponent(cc.Sprite);
            sp.spriteFrame = this.atlas.getSpriteFrame("ui-frame-bg");
            gridNode.parent = this.node;

            var labelNode = new cc.Node();
            labelNode.color = cc.color(0,255,0);
            var label = labelNode.addComponent(cc.Label);
            label.string = "";
            label.fontSize = 20;
            labelNode.name = "LabelNode";
            labelNode.parent = gridNode;
            return gridNode;
        }.bind(this));
        this.gridPool.setResetFunc(function(gridNode){
            gridNode.x = -100000;
            gridNode.y = -100000;
        }.bind(this));

        this.atlas = cc.resMgr.getRes(cc.resName.commonui);

        this.curPassData = cc.passData.getCurPassData();
        this.commonConfig = cc.passData.getCommonConfig();
        this.searchDataArr = [];
        this.roadIdx = 0;
        this.initMap();
    },

    start(){

    },

    onDestroy(){
        cc.globalEvent.off("CurData:UpdateRoadPos",this.updateRoadPos,this);
        cc.globalEvent.off("CurData:UpdateMap",this.updateMapData,this);
    },

    updateRoadPos(event){
        var info = event.detail;
        this.updateMapPos(info.x,info.y);
    },

    // update (dt) {},

    onEnable () {
        cc.globalEvent.on("CurData:UpdateRoadPos",this.updateRoadPos,this);
        cc.globalEvent.on("CurData:UpdateMap",this.updateMap,this);
        cc.globalEvent.on("CurData:InitGameData",this.initMap,this);
        this.updateMap();
    },

    onDisable(){
        cc.globalEvent.off("CurData:UpdateRoadPos",this.updateRoadPos,this);
        cc.globalEvent.off("CurData:UpdateMap",this.updateMap,this);
        cc.globalEvent.off("CurData:InitGameData",this.initMap,this);
    },

    nextRoad(){
        this.roadIdx++;
        if(this.roadIdx>=this.searchDataArr.length){
            this.roadIdx = 0;
        }
        this.updateMap();
    },

    initMap(){
        this.gridPool.reset();

        var mapSize = this.curPassData.mapSize;
        this.node.setContentSize(mapSize.w,mapSize.h); 

        var mapInfo = this.curPassData.configData.mapInfo;
        this.node.scale = mapInfo.scale;
        this.updateMapPos(mapInfo.posx,mapInfo.posy);

        this.updateMapData();
    },

    updateMapData(){
        var oldLen = this.searchDataArr.length;
        this.searchDataArr = [];
        for(var key in this.curPassData.searchMapData){
            var searchData = this.curPassData.searchMapData[key];
            if(searchData){
                var hasData = false;
                var minTree = searchData.tree;
                for(var row in minTree){
                    var rowData = minTree[row];
                    if(!rowData)continue;
                    for(var col in rowData){
                        var colData = rowData[col];
                        if(!colData)continue;
                        hasData = true;
                    }
                }
                if(hasData){
                    this.searchDataArr.push(searchData);
                }
            }
        }
        var newLen = this.searchDataArr.length;
        if(newLen!=oldLen){
            this.roadIdx = 0;
        }
        this.updateMap();
    },

    updateMap(){
        if(!this.node.active)return;
        this.gridPool.reset();

        var searchData = this.searchDataArr[this.roadIdx];
        if(!searchData)return;
        var minTree = searchData.tree;

        for(var row in minTree){
            var rowData = minTree[row];
            if(!rowData)continue;

            for(var col in rowData){
                var colData = rowData[col];
                if(!colData)continue;

                var gridNode = this.gridPool.get();
                var pos = this.curPassData.getGridPosByRowCol(row,col);
                gridNode.x = pos.x;
                gridNode.y = pos.y;
                var sp = gridNode.getComponent(cc.Sprite);
                var dir = this.curPassData.getDir(row,col,colData.fromRow,colData.fromCol);
                if(dir){
                    if(dir=="-1"){
                        sp.spriteFrame = this.atlas.getSpriteFrame("testui-self");
                    }else if(dir=="-2"){
                        sp.spriteFrame = this.atlas.getSpriteFrame("testui-jump");
                    }else{
                        sp.spriteFrame = this.atlas.getSpriteFrame("testui-dir"+dir);
                    }
                }else{
                    sp.spriteFrame = this.atlas.getSpriteFrame("ui-frame-bg");
                }
                var label = gridNode.getChildByName("LabelNode").getComponent(cc.Label);
                label.string = row+":"+col+"\n";
            }
        }
    },

    
});
