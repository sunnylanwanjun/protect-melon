"use strict";
cc._RF.push(module, 'b7eb2h3RnNCE7Wj6WmJEgHV', 'EditorMap');
// scripts/component/EditorMap.js

"use strict";

var Map = require("Map");
cc.Class({
    extends: Map,
    properties: {
        refLine: {
            default: undefined,
            type: cc.Node
        },
        mapPosLabel: {
            default: undefined,
            type: cc.Label
        }
    },
    onLoad: function onLoad() {},
    onDestroy: function onDestroy() {
        cc.globalEvent.off("Editor:UpdateMap", this.updateMap, this);
        cc.globalEvent.off("Editor:UpdateMapPos", this.updateMap, this);
        this.node.off('mousedown', this.mouseDownHandle, this);
        this.node.off('mousemove', this.mouseMoveHandle, this);
        this.node.off('mouseup', this.mouseUpHandle, this);
        this.node.off('mouseleave', this.mouseLeaveHandle, this);
        this.node.off('mouseenter', this.mouseEnterHandle, this);

        this.node.off('touchstart', this.mouseDownHandle, this);
        this.node.off('touchmove', this.mouseMoveHandle, this);
        this.node.off('touchend', this.mouseUpHandle, this);
        this.node.off('touchcancel', this.mouseLeaveHandle, this);
    },
    start: function start() {
        this.atlas = cc.resMgr.getRes(cc.resName.commonui);

        cc.globalEvent.on("Editor:UpdateMap", this.updateMap, this);
        cc.globalEvent.on("Editor:UpdateMapPos", this.goBackMapPos, this);
        this.node.on('mousedown', this.mouseDownHandle, this);
        this.node.on('mousemove', this.mouseMoveHandle, this);
        this.node.on('mouseup', this.mouseUpHandle, this);
        this.node.on('mouseleave', this.mouseLeaveHandle, this);
        this.node.on('mouseenter', this.mouseEnterHandle, this);

        this.node.on('touchstart', this.mouseDownHandle, this);
        this.node.on('touchmove', this.mouseMoveHandle, this);
        this.node.on('touchend', this.mouseUpHandle, this);
        this.node.on('touchcancel', this.mouseLeaveHandle, this);

        this.curPassData = cc.passData.getCurPassData();
        this.commonConfig = cc.passData.getCommonConfig();

        this.updateMap();
    },
    goBackMapPos: function goBackMapPos() {
        var mapInfo = this.curPassData.configData.mapInfo;
        this.node.scale = mapInfo.scale;
        this.updateMapPos(mapInfo.posx, mapInfo.posy);
    },
    updateMap: function updateMap() {
        cc.globalEvent.emit("Editor:UpdateMapBgSize");
        var mapSize = this.curPassData.mapSize;
        this.node.removeAllChildren();
        this.node.setContentSize(mapSize.w, mapSize.h);

        var mapData = this.curPassData.configData.mapData;
        for (var rowKey in mapData) {
            var rowData = mapData[rowKey];

            for (var colKey in rowData) {
                var colData = rowData[colKey];
                this.updateGrid(rowKey, colKey, colData.material);
            }
        }
        this.goBackMapPos();
    },
    updateMapPos: function updateMapPos(x, y) {
        this.node.setPosition(x, y);
        this.refLine.setPosition(x, y);
        this.mapPosLabel.string = "x:" + parseInt(this.node.x) + " y:" + parseInt(this.node.y);
        cc.globalEvent.emit("Editor:UpdateMapBgPos", { x: this.node.x, y: this.node.y, scale: this.node.scale });
    },
    mouseLeaveHandle: function mouseLeaveHandle(event) {
        this.isMouseDown = false;
        cc.globalEvent.emit("Editor:UpdateGridHelp", { gridInfo: undefined, isMouseDown: false });
    },
    mouseEnterHandle: function mouseEnterHandle(event) {},
    mouseDownHandle: function mouseDownHandle(event) {
        this.mousePos = event.getLocation();
        this.isMouseDown = true;
    },
    mouseMoveHandle: function mouseMoveHandle(event) {
        var oldPos = event.getLocation();
        var newPos = this.node.convertToNodeSpace(cc.v2(oldPos.x, oldPos.y));
        var gridInfo = this.curPassData.getGridInfoByMousePos(newPos.x, newPos.y);

        //console.log(oldPos.x,oldPos.y,newPos.x,newPos.y,gridInfo);

        cc.globalEvent.emit("Editor:UpdateGridHelp", { gridInfo: gridInfo, isMouseDown: this.isMouseDown });

        if (!this.isMouseDown) {
            return;
        }

        var curMousePos = event.getLocation();
        if (Math.abs(this.mousePos.x - curMousePos.x) < 2 && Math.abs(this.mousePos.y - curMousePos.y) < 2) {
            return;
        }

        var pos = event.getDelta();
        this.isMouseMove = true;
        var newX = this.node.x + pos.x;
        var newY = this.node.y + pos.y;
        this.updateMapPos(newX, newY);
    },
    mouseUpHandle: function mouseUpHandle(event) {
        if (!this.isMouseDown) {
            return;
        }
        this.isMouseDown = false;
        if (this.isMouseMove) {
            this.isMouseMove = false;
            return;
        }
        this.isMouseMove = false;

        var oldPos = event.getLocation();
        var newPos = this.node.convertToNodeSpace(cc.v2(oldPos.x, oldPos.y));
        var gridInfo = this.curPassData.getGridInfoByMousePos(newPos.x, newPos.y);
        if (!gridInfo) {
            return;
        }

        var editorData = cc.passData.getCurEditorData();
        cc.log("use material:", editorData.curMatieral);

        var rowKey = gridInfo.row;
        var colKey = gridInfo.col;
        var mapData = this.curPassData.configData.mapData;
        var material = undefined;

        if (editorData.curMatieral == this.commonConfig.matNameToType.empty) {
            if (mapData[rowKey] && mapData[rowKey][colKey]) delete mapData[rowKey][colKey].material;
        } else {
            material = cc.utils.getPropertyOrInit(mapData, rowKey, colKey, "material");
            cc.utils.setIfUndef(material, editorData.curMatieral, 0);
            material[editorData.curMatieral]++;
        }
        cc.passData.savePass(cc.passData.getCurPassIdx());
        this.updateGrid(rowKey, colKey, material);
    }
});

cc._RF.pop();