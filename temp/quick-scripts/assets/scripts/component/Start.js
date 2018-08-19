(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/component/Start.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'd52f9pwUcJIeZVx5RrfOQzk', 'Start', __filename);
// scripts/component/Start.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        progress: {
            default: undefined,
            type: cc.Label
        }
    },

    // use this for initialization
    onLoad: function onLoad() {

        cc.constVal = require("ConstVal");
        cc.resName = cc.constVal.ResName;

        cc.globalEvent = new cc.EventTarget();

        var MyTimer = require("MyTimer");
        cc.timer = new MyTimer();

        var Utils = require("Utils");
        cc.utils = new Utils();

        var ResMgr = require("ResMgr");
        cc.resMgr = new ResMgr();
        cc.resMgr.init(cc.constVal.ResName, cc.constVal.ResConfig, cc.constVal.CommonRes, cc.constVal.ScenePreloadRes);

        cc.resMgr.loadCommon(function (err) {
            if (err) {
                return;
            }
            cc.log("load common finished");
            this.initGameData();
        }.bind(this), function (err, loadedResName, loadedNum, totalNum) {
            if (err) {
                return;
            }
            cc.log("loadProgress", loadedResName, loadedNum, totalNum);
            this.progress.string = "loading(" + loadedNum + "/" + totalNum + ")";
        }.bind(this));
    },

    // called every frame
    update: function update(dt) {},

    initGameData: function initGameData() {
        cc.gameConfig = cc.resMgr.getRes(cc.resName.gameConfig);
        cc.adConfig = cc.resMgr.getRes(cc.resName.adConfig);

        var UserData = require("UserData");
        cc.userData = new UserData();
        cc.userData.init(function () {
            this.initGame();
        }.bind(this));
    },

    initGame: function initGame() {
        var PassData = require("PassData");
        var GameDataClass = require("MelonData");
        cc.passData = new PassData();
        cc.passData.init(GameDataClass);
        cc.passData.initConfigList(function () {
            var GameCtrl = require("GameCtrl");
            cc.gameCtrl = new GameCtrl();
            cc.utils.loadScene("main");
        });
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
        //# sourceMappingURL=Start.js.map
        