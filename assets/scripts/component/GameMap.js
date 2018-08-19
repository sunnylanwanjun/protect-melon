var Map = require("Map")
cc.Class({
    extends: Map,

    properties: {

    },

    // onLoad () {},

    start(){

        var Pool = require("Pool");
        this.gridPool = new Pool();
        this.gridPool.setBuildFunc(function(parent){
            var gridNode = new cc.Node();
            gridNode.addComponent(cc.Sprite);
            return gridNode;
        }.bind(this));
        this.gridPool.setResetFunc(function(gridNode){
            gridNode.color = cc.color(255,255,255);
            gridNode.removeFromParent();
        }.bind(this));

        this.atlas = cc.resMgr.getRes(cc.resName.commonui);
        this.node.on('mousedown',this.mouseDownHandle,this);
        this.node.on('mousemove',this.mouseMoveHandle,this);
        this.node.on('mouseup',this.mouseUpHandle,this);
        this.node.on('mouseleave',this.mouseLeaveHandle,this);
        this.node.on('mouseenter',this.mouseEnterHandle,this);

        this.node.on('touchstart',this.mouseDownHandle,this);
        this.node.on('touchmove',this.mouseMoveHandle,this);
        this.node.on('touchend',this.mouseUpHandle,this);
        this.node.on('touchcancel',this.mouseLeaveHandle,this);

        cc.globalEvent.on("CurData:UpdateMap",this.updateMap,this);
        cc.globalEvent.on("CurData:InitGameData",this.initMap,this);

        this.curPassData = cc.passData.getCurPassData();
        this.commonConfig = cc.passData.getCommonConfig();
        this.permitNextTurn = true;
        this.initMap();
    },

    onDestroy(){
        this.node.off('mousedown',this.mouseDownHandle,this);
        this.node.off('mousemove',this.mouseMoveHandle,this);
        this.node.off('mouseup',this.mouseUpHandle,this);
        this.node.off('mouseleave',this.mouseLeaveHandle,this);
        this.node.off('mouseenter',this.mouseEnterHandle,this);

        this.node.off('touchstart',this.mouseDownHandle,this);
        this.node.off('touchmove',this.mouseMoveHandle,this);
        this.node.off('touchend',this.mouseUpHandle,this);
        this.node.off('touchcancel',this.mouseLeaveHandle,this);

        cc.globalEvent.off("CurData:UpdateMap",this.updateMap,this);
        cc.globalEvent.off("CurData:InitGameData",this.initMap,this);
        cc.timer.removeByType("GameMap");
    },
    // update (dt) {},

    initMap(){
        this.gridPool.reset();

        var mapSize = this.curPassData.mapSize;
        this.node.removeAllChildren();
        this.node.setContentSize(mapSize.w,mapSize.h); 

        var mapInfo = this.curPassData.configData.mapInfo;
        this.node.scale = mapInfo.scale;
        this.updateMapPos(mapInfo.posx,mapInfo.posy);

        this.updateMap();
    },

    reset(){
        cc.utils.alert("Reset Pass?",function(){
            this.curPassData.initGameData();
        }.bind(this));
    },

    preStep(){
        if(this.permitNextTurn){
            this.curPassData.backTurn();
        }else{
            cc.log("GameMap:mouseUpHandle permitNextTurn",this.permitNextTurn);
        }
    },

    updateMap(){
        var preTurnData = this.curPassData.getPreTurn();
        var mapData = preTurnData.mapData;
        for(var rowKey in mapData){
            var rowData = mapData[rowKey];
            if(!rowData)continue;
            for(var colKey in rowData){
                var colData = rowData[colKey];
                if(!colData)continue;
                this.updateGrid(rowKey,colKey,colData.material);
            }
        }

        var roleData = preTurnData.roleData;
        var roleReachNum = 0;
        var roleReachNeedNum = roleData.length;
        this.permitNextTurn = false;

        var checkPermitNextTurn = function(){
            if(roleReachNeedNum==roleReachNum){
                this.permitNextTurn = true;
            }
        }.bind(this);

        var reachCallback = function(eachRoleData){
            var path = eachRoleData.path;
            var pathIdx = eachRoleData.pathIdx;
            this.removeFromGrid(path[pathIdx].row,path[pathIdx].col,eachRoleData.matType);
            pathIdx++;
            eachRoleData.pathIdx = pathIdx;
            this.addToGrid(path[pathIdx].row,path[pathIdx].col,eachRoleData.matType);
            if(pathIdx>=path.length-1){
                eachRoleData.pathIdx = 0;
                roleReachNum++;
                checkPermitNextTurn();
            }
        }.bind(this);

        for(var roleDataKey in roleData){
            var eachRoleData = roleData[roleDataKey];
            eachRoleData.pathIdx = 0;

            var path = eachRoleData.path;
            var pathIdx = eachRoleData.pathIdx; 
            if(!path){
                cc.error("path is null");
            }
            if(path.length==0){
                var role = this.addToGrid(eachRoleData.row,eachRoleData.col,eachRoleData.matType);
                if(eachRoleData.hasOwnProperty("freezeBout")){
                    role.color = cc.color(100,100,100);
                }else{
                    role.color = cc.color(255,255,255);
                }
                roleReachNum++;
                checkPermitNextTurn();
            }else{
                this.addToGrid(path[pathIdx].row,path[pathIdx].col,eachRoleData.matType);
                cc.timer.loop(reachCallback,0.3,path.length-1,"GameMap",eachRoleData);
            }
        }
    },

    createGrid(rowKey,colKey){
        var grid = new cc.Node();
        grid.name = rowKey + "_" + colKey;
        grid.parent = this.node;
        var pos = this.curPassData.getGridPosByRowCol(rowKey,colKey);
        grid.x = pos.x;
        grid.y = pos.y;
        return grid;
    },

    addToGrid(rowKey,colKey,matType){
        var grid = this.node.getChildByName(rowKey+"_"+colKey);
        if(!grid){
            grid = this.createGrid(rowKey,colKey);
        }
        var matTypeToName = this.commonConfig.matTypeToName;
        var matShowOrderMap = this.commonConfig.matShowOrderMap;
        var matIcon = this.commonConfig.matIcon

        var spNode = this.gridPool.get();
        var sp = spNode.getComponent(cc.Sprite);
        sp.spriteFrame = this.atlas.getSpriteFrame(matIcon[matType]);
        spNode.parent = grid;

        var matName = matTypeToName[matType].matName;
        spNode.zIndex = matShowOrderMap[matName];
        spNode.matType = matType;
        return spNode;
    },

    removeFromGrid(rowKey,colKey,matType){
        var grid = this.node.getChildByName(rowKey+"_"+colKey);
        if(grid){
            var children = grid.children;
            for (var i = 0; i < children.length; ++i) {
                if(children[i]&&children[i].matType == matType){
                    this.gridPool.push(children[i]);
                    break;
                }
            }
        }
    },

    removeAllFromGrid(rowKey,colKey,matType){
        var grid = this.node.getChildByName(rowKey+"_"+colKey);
        if(grid){
            var children = grid.children;
            for (var i = children.length-1; i >=0 ; --i) {
                if(children[i]&&children[i].matType == matType){
                    this.gridPool.push(children[i]);
                }
            }
        }
    },

    mouseLeaveHandle(event){
        this.isMouseDown = false;
    },
    mouseEnterHandle(event){
        
    },
    mouseDownHandle(event){
        this.mousePos = event.getLocation();
        this.isMouseDown = true;
    },
    mouseMoveHandle(event){
        if(!this.curPassData.configData.mapInfo.isDrag)
            return;

        if(!this.isMouseDown){
            return;
        }

        var curMousePos = event.getLocation();
        if(Math.abs(this.mousePos.x - curMousePos.x)<2&&
           Math.abs(this.mousePos.y - curMousePos.y)<2){
            return;
        }

        var pos = event.getDelta();
        this.isMouseMove = true;
        var newX = this.node.x+pos.x;
        var newY = this.node.y+pos.y;
        this.updateMapPos(newX,newY);
        cc.globalEvent.emit("CurData:UpdateRoadPos",{x:newX,y:newY});
    },
    mouseUpHandle(event){
        if(!this.isMouseDown){
            return;
        }
        this.isMouseDown = false;
        if(this.isMouseMove){
            this.isMouseMove = false;
            return;
        }
        this.isMouseMove = false;

        var oldPos = event.getLocation();
        var newPos = this.node.convertToNodeSpace(cc.v2(oldPos.x, oldPos.y));
        var gridInfo = this.curPassData.getGridInfoByMousePos(newPos.x,newPos.y);
        if(!gridInfo){
            return;
        }

        var rowKey = gridInfo.row;
        var colKey = gridInfo.col;

        //cc.log("click",rowKey,colKey);
        if(this.permitNextTurn){
            this.curPassData.playerToHandle(rowKey,colKey);
        }else{
            cc.log("GameMap:mouseUpHandle permitNextTurn",this.permitNextTurn);
        }
    },

    updateGrid(rowKey,colKey,material){
        var grid = this.node.getChildByName(rowKey+"_"+colKey);
        if(grid){
            var children = grid.children;
            for (var i = children.length-1; i >=0 ; --i) {
                this.gridPool.push(children[i]);
            }
        }

        if(!material){
            return;
        }

        for(var matType in material){
            var alias = this.commonConfig.matTypeToName[matType].matAlias;
            if(alias=="role")continue;
            if(!material[matType]){
                continue;
            }
            var sameMatSize = material[matType];
            if(sameMatSize<=0)continue;
            for(var j=0;j<sameMatSize;j++){
                this.addToGrid(rowKey,colKey,matType);
            }
        }
    },
});
