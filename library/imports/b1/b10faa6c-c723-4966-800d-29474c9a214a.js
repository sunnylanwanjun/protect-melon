"use strict";
cc._RF.push(module, 'b10fapsxyNJZoANKUdMmiFK', 'Editor');
// scripts/component/Editor.js

"use strict";

cc.Class({
    extends: cc.Component,
    properties: {
        passLabel: {
            default: undefined,
            type: cc.Label
        }
    },
    onLoad: function onLoad() {
        this.curPassIdx = cc.passData.getCurPassIdx();
        this.curPassData = cc.passData.getCurPassData();
        this.passLabel.string = "pass:" + this.curPassIdx;
    },
    toGame: function toGame() {
        this.curPassData.initGameData();
        cc.utils.loadScene("game");
    },
    toSelect: function toSelect() {
        cc.utils.loadScene("select");
    }
});

cc._RF.pop();