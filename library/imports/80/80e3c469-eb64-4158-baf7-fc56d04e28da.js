"use strict";
cc._RF.push(module, '80e3cRp62RBWLr3/FbQTija', 'Map');
// scripts/component/Map.js

"use strict";

cc.Class({
    extends: cc.Component,

    onLoad: function onLoad() {},
    onDestroy: function onDestroy() {},
    start: function start() {
        this.atlas = undefined;
        this.curPassData = cc.passData.getCurPassData();
        this.commonConfig = cc.passData.getCommonConfig();
    },
    goBackMapPos: function goBackMapPos() {
        var mapInfo = this.curPassData.configData.mapInfo;
        this.updateMapPos(mapInfo.posx, mapInfo.posy);
    },
    updateMapPos: function updateMapPos(x, y) {
        this.node.setPosition(x, y);
    },
    updateMap: function updateMap() {
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
    updateGrid: function updateGrid(rowKey, colKey, material) {

        var grid = this.node.getChildByName(rowKey + "_" + colKey);
        if (grid) {
            this.node.removeChild(grid);
            grid = undefined;
        }

        if (!material) {
            return;
        }
        var matTypeToName = this.commonConfig.matTypeToName;
        var matShowOrderMap = this.commonConfig.matShowOrderMap;

        for (var matType in material) {
            if (!material[matType]) {
                continue;
            }
            var sameMatSize = material[matType];
            if (sameMatSize <= 0) continue;
            if (!grid) {
                grid = new cc.Node();
                grid.name = rowKey + "_" + colKey;
                grid.parent = this.node;
                var pos = this.curPassData.getGridPosByRowCol(rowKey, colKey);
                grid.x = pos.x;
                grid.y = pos.y;

                var labelNode = new cc.Node();
                labelNode.zIndex = 100;
                labelNode.color = cc.color(0, 255, 0);
                var label = labelNode.addComponent(cc.Label);
                label.string = rowKey + ":" + colKey + "\n";
                label.fontSize = 20;
                labelNode.name = "LabelNode";
                labelNode.parent = grid;
            }
            for (var j = 0; j < sameMatSize; j++) {
                var spNode = new cc.Node();
                var sp = spNode.addComponent(cc.Sprite);
                sp.spriteFrame = this.atlas.getSpriteFrame(this.commonConfig.matIcon[matType]);
                spNode.parent = grid;
                var matName = matTypeToName[matType].matName;
                spNode.zIndex = matShowOrderMap[matName];
            }
        }
    }
});

cc._RF.pop();