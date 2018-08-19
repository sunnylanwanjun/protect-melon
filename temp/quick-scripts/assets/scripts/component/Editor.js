(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/component/Editor.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'b10fapsxyNJZoANKUdMmiFK', 'Editor', __filename);
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
        //# sourceMappingURL=Editor.js.map
        