"use strict";
cc._RF.push(module, '8e2b61hFmNFIYFWKIK/e2ls', 'ResultWnd');
// scripts/component/ResultWnd.js

"use strict";

cc.Class({
    extends: cc.Component,
    properties: {
        lostWnd: {
            default: undefined,
            type: cc.Node
        },
        winWnd: {
            default: undefined,
            type: cc.Node
        },
        lastWnd: {
            default: undefined,
            type: cc.Node
        },
        recommendWnd: {
            default: undefined,
            type: cc.Node
        },
        tpl: {
            default: undefined,
            type: cc.Node
        },
        content: {
            default: undefined,
            type: cc.Node
        }
    },
    ctor: function ctor() {
        if (!CC_EDITOR) {
            cc.globalEvent.on("CurData:UpdateResult", this.updateResult, this);
        }
    },
    onLoad: function onLoad() {
        this.recommendWnd.active = cc.gameCtrl.needShowRecommend();
        this.atlas = cc.resMgr.getRes(cc.resName.commonui);
        if (this.recommendWnd.active) {
            var list = cc.gameConfig.recommendGame_FB;
            for (var i = 0; i < list.length; i++) {
                var newItem = this.tpl;
                if (i > 0) {
                    newItem = cc.instantiate(this.tpl);
                    newItem.parent = this.tpl.parent;
                }
                newItem.itemIdx = i;
                var frame = this.atlas.getSpriteFrame(list[i].icon);
                var sp = newItem.getComponent(cc.Sprite);
                sp.spriteFrame = frame;
            }

            var layout = this.content.getComponent(cc.Layout);
            var contentW = layout.paddingLeft + list.length * layout.spacingX + layout.paddingRight + list.length * this.tpl.width;
            if (this.content.width < contentW) {
                this.content.width = contentW;
            }
        }
        cc.globalEvent.on("CurData:UpdateResult", this.updateResult, this);
        this.updateResult();
    },
    onDestroy: function onDestroy() {
        cc.globalEvent.off("CurData:UpdateResult", this.updateResult, this);
    },
    updateResult: function updateResult() {
        var curPassData = cc.passData.getCurPassData();
        var curPassIdx = cc.passData.getCurPassIdx();
        var passCount = cc.passData.getPassCount();
        this.node.active = curPassData.gameResult != undefined;
        if (!this._isOnLoadCalled) return;
        if (curPassIdx < passCount - 1) {
            if (curPassData.gameResult == "win") {
                this.winWnd.active = true;
                this.lostWnd.active = false;
            } else {
                this.winWnd.active = false;
                this.lostWnd.active = true;
            }
            this.lastWnd.active = false;
        } else {
            this.lostWnd.active = false;
            this.winWnd.active = false;
            this.lastWnd.active = true;
        }
    },
    share: function share() {
        cc.gameCtrl.invite();
    },
    replay: function replay() {
        var curPassData = cc.passData.getCurPassData();
        curPassData.initGameData();
    },
    next: function next() {
        cc.gameCtrl.playPassAD(function () {
            var curPassIdx = cc.passData.getCurPassIdx();
            curPassIdx++;
            cc.passData.loadPass(curPassIdx, function (success) {
                if (!success) {
                    cc.error("load pass config failure", curPassIdx);
                    return;
                }
            }.bind(this));
        }.bind(this));
    },
    main: function main() {
        cc.utils.loadScene("select");
    },
    clickRecommend: function clickRecommend(event) {
        var target = event.currentTarget;
        var itemIdx = target.itemIdx;
        cc.gameCtrl.requestRecommend(itemIdx);
    }
});

cc._RF.pop();