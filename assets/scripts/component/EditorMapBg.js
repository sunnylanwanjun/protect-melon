cc.Class({
    extends:cc.Component,
    properties:{
        rowCol:{
            default:undefined,
            type:cc.Label,
        }
    },
    onLoad(){
        var Pool = require("Pool");
        this.gridPool = new Pool();
        this.gridPool.setBuildFunc(function(){
            var gridNode = new cc.Node();
            var sp = gridNode.addComponent(cc.Sprite);
            sp.spriteFrame = this.atlas.getSpriteFrame("ui-frame-bg");
            gridNode.parent = this.node;

            return gridNode;
        }.bind(this));
        this.gridPool.setResetFunc(function(gridNode){
            gridNode.x = -100000;
            gridNode.y = -100000;
        }.bind(this));

        this.gridHelp = new cc.Node();
        this.atlas = cc.resMgr.getRes(cc.resName.commonui);
        var sp = this.gridHelp.addComponent(cc.Sprite);
        sp.spriteFrame = this.atlas.getSpriteFrame("ui-select-frame");
        this.gridHelp.parent = this.node;
        this.gridHelp.active = false;

        this.curPassData = cc.passData.getCurPassData();

        cc.globalEvent.on("Editor:UpdateGridHelp",this.updateGridHelp,this);
        cc.globalEvent.on("Editor:UpdateMapBgSize",this.updateMapBgSize,this);
        cc.globalEvent.on("Editor:UpdateMapBgPos",this.updateMapBgPos,this);

        this.updateMapBgSize();
    },
    onDestroy(){
        cc.globalEvent.off("Editor:UpdateGridHelp",this.updateGridHelp,this);
        cc.globalEvent.off("Editor:UpdateMapBgSize",this.updateMapBgSize,this);
        cc.globalEvent.off("Editor:UpdateMapBgPos",this.updateMapBgPos,this);
    },
    updateGridHelp(event){
        var gridInfo = event.detail.gridInfo;
        var isMouseDown = event.detail.isMouseDown;
        if(!gridInfo||isMouseDown){
            this.rowCol.string = "";
            this.gridHelp.active = false;
            return;
        }

        this.gridHelp.x = gridInfo.x;
        this.gridHelp.y = gridInfo.y;
        this.gridHelp.active = true;
        this.gridHelp.zIndex = 10000;
        this.rowCol.string = "r:"+gridInfo.row+" c:"+gridInfo.col;
    },
    updateMapBgSize(){
        var mapSize = this.curPassData.mapSize;
        this.node.setContentSize(mapSize.w,mapSize.h); 
    },
    updateMapBgPos(event){
        var x = event.detail.x;
        var y = event.detail.y;
        var scale = event.detail.scale;
        this.node.x = x;
        this.node.y = y;
        this.node.scale = scale;

        var begPos = this.node.convertToNodeSpace(cc.v2(0, 0));
        var endPos = this.node.convertToNodeSpace(cc.v2(cc.winSize.width, cc.winSize.height));

        this.gridPool.reset();
        var maxInfo = this.curPassData.configData.mapInfo;
        var begInfo = this.curPassData.getGridInfoByMousePos(begPos.x,begPos.y);
        if(!begInfo){
            begInfo = {row:0,col:0};
        }
        var endInfo = this.curPassData.getGridInfoByMousePos(endPos.x,endPos.y);
        if(!endInfo){
            endInfo = {row:0,col:0};
        }

        if(begInfo.row>maxInfo.row)begInfo.row=maxInfo.row;
        if(begInfo.col>maxInfo.col)begInfo.col=maxInfo.col;
        if(endInfo.row>maxInfo.row)endInfo.row=maxInfo.row;
        if(endInfo.col>maxInfo.col)endInfo.col=maxInfo.col;
        
        for(var row=begInfo.row;row<=endInfo.row;row++){
            for(var col=begInfo.col;col<=endInfo.col;col++){
                var gridNode = this.gridPool.get();
                var pos = this.curPassData.getGridPosByRowCol(row,col);
                gridNode.x = pos.x;
                gridNode.y = pos.y;
            }
        }
    }
});