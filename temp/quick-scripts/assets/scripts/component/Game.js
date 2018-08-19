(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/component/Game.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '6eb64Cts/xDdaSsbTk0Q8l6', 'Game', __filename);
// scripts/component/Game.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        btnEditor: {
            default: undefined,
            type: cc.Node
        },
        passLabel: {
            default: undefined,
            type: cc.Label
        },
        itemTpl: {
            default: undefined,
            type: cc.Node
        },
        showGridBtn: {
            default: undefined,
            type: cc.Node
        },
        nextRoadBtn: {
            default: undefined,
            type: cc.Node
        }
    },

    onLoad: function onLoad() {
        var Pool = require("Pool");
        this.gridPool = new Pool();
        this.itemParent = this.itemTpl.parent;
        this.gridPool.setResetFunc(function (gridNode) {
            this.itemParent.removeChild(gridNode);
        }.bind(this));

        var itemOrder = cc.constVal.ItemOrder;
        for (var i = 0; i < itemOrder.length; i++) {
            var newItem = this.itemTpl;
            if (i > 0) {
                newItem = cc.instantiate(this.itemTpl);
                newItem.parent = this.itemParent;
            }
            this.gridPool.push(newItem);
        }

        this.nextRoadBtn.active = cc.gameConfig.isEditorMode;
        this.showGridBtn.active = cc.gameConfig.isEditorMode;
        this.btnEditor.active = cc.gameConfig.isEditorMode;

        cc.globalEvent.on("CurData:InitGameData", this.initGameData, this);
        this.initGameData();

        cc.globalEvent.on("CurData:UpdateItemlist", this.updateItemList, this);
        this.updateItemList();
    },
    initGameData: function initGameData() {
        this.curPassData = cc.passData.getCurPassData();
        this.passLabel.string = "pass:" + this.curPassData.passIdx;
    },
    onDestroy: function onDestroy() {
        cc.globalEvent.off("CurData:UpdateItemlist", this.updateItemList, this);
        cc.globalEvent.off("CurData:InitGameData", this.initGameData, this);
    },
    start: function start() {},


    // update (dt) {},

    updateItemList: function updateItemList() {
        this.gridPool.reset();

        var selectItemType = this.curPassData.getSelectItemType();
        var itemData = this.curPassData.curTurnData.itemData;
        var itemOrder = cc.constVal.ItemOrder;
        this.itemArr = {};
        for (var i = 0; i < itemOrder.length; i++) {
            var itemType = itemOrder[i];
            var item = itemData[itemType];
            if (!item) {
                continue;
            }
            var itemNum = item.length;
            if (itemNum <= 0) {
                continue;
            }
            var newItem = this.gridPool.get();
            newItem.itemType = itemOrder[i];
            newItem.parent = this.itemParent;
            newItem.scaleX = 1.0;
            newItem.scaleY = 1.0;

            if (itemType == selectItemType) {
                newItem.color = new cc.Color(0, 100, 0);
            } else {
                newItem.color = new cc.Color(255, 255, 255);
            }
            this.itemArr[itemType] = newItem;
            var label = newItem.getChildByName("Label").getComponent(cc.Label);
            label.string = itemOrder[i] + "(" + itemNum + ")";
        }
    },
    toEditor: function toEditor() {
        cc.utils.loadScene("editor");
    },
    toSelect: function toSelect() {
        cc.utils.loadScene("select");
    },
    addItem: function addItem(event) {
        cc.gameCtrl.playItemAD();
    },
    selectItem: function selectItem(event) {
        var target = event.currentTarget;
        var itemType = target.itemType;

        var selectItemType = this.curPassData.getSelectItemType();
        if (selectItemType == itemType) {
            this.curPassData.unSelectItem();
            return;
        }

        this.curPassData.selectItem(itemType);
        var selectItemType = this.curPassData.getSelectItemType();
        if (selectItemType) {
            var item = this.itemArr[selectItemType];
            item.color = new cc.Color(0, 100, 0);
        }
    }
});

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=Game.js.map
        