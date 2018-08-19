(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/component/SelectMap.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '271d0Aa2M9PLJnbT5sZJena', 'SelectMap', __filename);
// scripts/component/SelectMap.js

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
        var configListLen = cc.passData.getPassCount();
        if (cc.gameConfig.isEditorMode) {
            configListLen++;
        }
        for (var i = 0; i < configListLen; i++) {
            var newItem = this.tpl;
            if (i > 0) {
                newItem = cc.instantiate(this.tpl);
                newItem.parent = this.tpl.parent;
            }
            var btn_pass = newItem.getChildByName("btn_pass");
            if (cc.gameConfig.isTestMode) {
                btn_pass.color = cc.color(255, 255, 255);
            } else {
                if (cc.userData.curPassIdx == i) {
                    btn_pass.color = cc.color(0, 255, 0);
                } else if (cc.userData.curMaxPassIdx >= i) {
                    btn_pass.color = cc.color(255, 255, 255);
                } else {
                    btn_pass.color = cc.color(75, 75, 75);
                }
            }
            btn_pass.itemIdx = i;
            var label = btn_pass.getChildByName("Label").getComponent(cc.Label);
            label.string = i;
        }

        var contentH = configListLen * this.tpl.height;
        this.content.height = contentH;
    },
    start: function start() {},


    // update (dt) {},

    clickPass: function clickPass(event) {
        var target = event.currentTarget;
        var itemIdx = target.itemIdx;

        if (!cc.gameConfig.isTestMode) {
            if (itemIdx > cc.userData.curMaxPassIdx) {
                cc.log("SelectMap:clickPass failure,itemIdx", itemIdx, "maxPassIdx", cc.userData.curMaxPassIdx);
                return;
            }
        }

        cc.gameCtrl.playPassAD(function () {
            cc.passData.loadPass(itemIdx, function (success) {
                if (!success) {
                    cc.error("load pass config failure", itemIdx);
                    return;
                }
                cc.utils.loadScene("game");
            }.bind(this));
        }.bind(this));
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
        //# sourceMappingURL=SelectMap.js.map
        