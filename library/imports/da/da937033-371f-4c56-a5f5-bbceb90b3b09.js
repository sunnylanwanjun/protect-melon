"use strict";
cc._RF.push(module, 'da937AzNx9MVqX1u865CzsJ', 'MaterialList');
// scripts/component/MaterialList.js

"use strict";

cc.Class({
    extends: cc.Component,
    properties: {
        tpl: {
            default: undefined,
            type: cc.Node
        },
        content: {
            default: undefined,
            type: cc.Node
        }
    },
    onLoad: function onLoad() {
        this.itemArr = [];
        this.commonConfig = cc.passData.getCommonConfig();
        var matIconList = this.commonConfig.matIcon;

        this.atlas = cc.resMgr.getRes(cc.resName.commonui);
        for (var i = 0; i < matIconList.length; i++) {
            var newItem = this.tpl;
            if (i > 0) {
                newItem = cc.instantiate(this.tpl);
                newItem.parent = this.tpl.parent;
            }
            newItem.itemIdx = i;
            this.itemArr.push(newItem);

            var frame = this.atlas.getSpriteFrame(matIconList[i]);
            var sp = newItem.getComponent(cc.Sprite);
            sp.spriteFrame = frame;
        }

        var layout = this.content.getComponent(cc.Layout);
        var contentW = layout.paddingLeft + matIconList.length * layout.spacingX + layout.paddingRight + matIconList.length * this.tpl.width;
        this.content.width = contentW;

        this.updateSelectItem(0);
    },
    onSelectItem: function onSelectItem(event) {
        var target = event.currentTarget;
        var itemIdx = target.itemIdx;
        this.updateSelectItem(itemIdx);
    },
    updateSelectItem: function updateSelectItem(itemIdx) {
        for (var i = 0; i < this.itemArr.length; i++) {
            this.itemArr[i].color = new cc.Color(255, 255, 255);
        }
        this.itemArr[itemIdx].color = new cc.Color(0, 100, 0);
        var editorData = cc.passData.getCurEditorData();
        editorData.curMatieral = itemIdx;
        cc.globalEvent.emit("Editor:UpdateMaterial");
    }
});

cc._RF.pop();