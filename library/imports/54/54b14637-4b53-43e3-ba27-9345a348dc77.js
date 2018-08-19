"use strict";
cc._RF.push(module, '54b14Y3S1ND47onk0WjSNx3', 'CurData');
// scripts/data/CurData.js

"use strict";

cc.Class({
    ctor: function ctor() {
        /*
        mapSize : {w:xx,h:xx},
        */

        /*
        "gameData":{
            gridData : {[row]:{
                                [col]:{
                                        pos:{x:0,y:0},//run time data
                                },
                       },}
        }
        */

        /*
        "mapData":{
            [row]:{
                    [col]:{
                            material:{0:num,1:num,...},
                    },
            }
        }
        */
    },

    //////////////////////////////////////////////////////////////
    //游戏配置
    initCommonConfig: function initCommonConfig(commonConfig) {
        this.commonConfig = commonConfig;
        this.MatType = this.commonConfig.matNameToType;
        this.MatName = this.commonConfig.matTypeToName;
    },
    initConfigData: function initConfigData(passIdx) {
        this.passIdx = passIdx;
        this.configData = cc.passData.getConfigData(passIdx);

        var gridInfo = this.commonConfig.gridInfo;
        var mapH = this.configData.mapInfo.row * gridInfo.gridH;
        var mapW = this.configData.mapInfo.col * gridInfo.gridW;
        this.mapSize = { w: mapW, h: mapH };
        this.gameData = {};
        this.initGameData();
    },
    initGameData: function initGameData() {
        this.gameData.gridData = {};
        this.rebuildGameData();
    },
    rebuildGameData: function rebuildGameData() {
        var mapData = this.configData.mapData;
        for (var rowKey in mapData) {
            var rowData = mapData[rowKey];
            if (!rowData) {
                continue;
            }
            for (var colKey in rowData) {
                var colData = rowData[colKey];
                if (!colData || !colData.material) {
                    continue;
                }
                this.initEachGridData(colData.material, rowKey, colKey);
            }
        }
    },
    initEachGridData: function initEachGridData(material, rowKey, colKey) {
        cc.utils.setProperty(this.gameData.gridData, rowKey, colKey, this.getGridPosByRowCol(rowKey, colKey));
    },
    getGridPosByRowCol: function getGridPosByRowCol(row, col) {
        var gridData = cc.utils.getPropertyOrInit(this.gameData.gridData, row, col);
        if (!gridData.x || !gridData.y) {
            var gridInfo = this.commonConfig.gridInfo;
            var halfGridW = parseInt(gridInfo.gridW / 2);
            var halfGridH = parseInt(gridInfo.gridH / 2);

            var mapSize = this.mapSize;

            var gridX = col * gridInfo.gridW + halfGridW;

            var gridY = 0;
            if (col % 2 == 0) {
                gridY = row * gridInfo.gridH + halfGridH;
            } else {
                gridY = row * gridInfo.gridH + halfGridH + gridInfo.staggerY;
            }
            gridData.x = gridX - mapSize.w * 0.5;
            gridData.y = gridY - mapSize.h * 0.5;
        }
        return gridData;
    },
    getGridInfoByMousePos: function getGridInfoByMousePos(x, y) {
        //return {row=?,col=?,x=?,y=?}

        // gridInfo
        // "staggerY":65,//奇数Y错开
        // "staggerX":0, //奇数X错开
        // "gridW":110,
        // "gridH":130

        var gridInfo = this.commonConfig.gridInfo;
        if (x < 0 || y < 0) {
            return undefined;
        }

        var col = parseInt(x / gridInfo.gridW);

        var row = 0;
        if (col % 2 == 0) {
            row = parseInt(y / gridInfo.gridH);
        } else {
            if (y < gridInfo.staggerY) {
                return undefined;
            }
            row = parseInt((y - gridInfo.staggerY) / gridInfo.gridH);
        }
        var pos = this.getGridPosByRowCol(row, col);
        return { col: col, row: row, x: pos.x, y: pos.y };
    }
});

cc._RF.pop();