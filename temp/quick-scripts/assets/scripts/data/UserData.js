(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/data/UserData.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'c7252SRxClLGbL1MxR+xocX', 'UserData', __filename);
// scripts/data/UserData.js

"use strict";

cc.Class({
    ctor: function ctor() {
        this.playerID = 0;
        this.userName = "guest";
        this.curPassIdx = 0;
        this.curMaxPassIdx = 0;
        this.headIcon = "";
    },
    init: function init(callback) {
        if (window && window.hasOwnProperty("FBInstant")) {
            cc.log("begin init fbinstant data");

            var sdkVersion = FBInstant.getSDKVersion();
            cc.log("!!!!!!!!!!!!!!!!!!!!!!FBInstant sdkVersion", sdkVersion);

            this.playerID = FBInstant.player.getID();
            this.userName = FBInstant.player.getName();
            this.headIcon = FBInstant.player.getPhoto();

            //获取玩家数据
            FBInstant.player.getDataAsync(['curPassIdx', 'curMaxPassIdx']).then(function (data) {
                this.curPassIdx = parseInt(data['curPassIdx'] || 0);
                this.curMaxPassIdx = parseInt(data['curMaxPassIdx'] || 0);
                cc.log("finished init fbinstant data");
                callback();
            }.bind(this));

            return;
        }

        cc.gameConfig.isTestMode = true;
        callback();
    },
    saveMaxPass: function saveMaxPass(passIdx) {
        if (passIdx <= this.curMaxPassIdx) {
            return;
        }

        this.curMaxPassIdx = passIdx;
        if (window && window.hasOwnProperty("FBInstant")) {
            //存储玩家数据
            FBInstant.player.setDataAsync({
                curMaxPassIdx: this.curMaxPassIdx
            }).then(function () {
                console.log('UserData:saveMaxPass setDataAsync', this.curMaxPassIdx);
            }.bind(this));

            //设置玩家统计数据
            FBInstant.player.setStatsAsync({
                curMaxPassIdx: this.curMaxPassIdx
            }).then(function () {
                console.log('UserData:saveMaxPass setStatsAsync', this.curMaxPassIdx);
            }.bind(this));
            return;
        }
    },
    savePass: function savePass(passIdx) {
        this.curPassIdx = passIdx;
        if (window && window.hasOwnProperty("FBInstant")) {
            //存储玩家数据
            FBInstant.player.setDataAsync({
                curPassIdx: this.curPassIdx
            }).then(function () {
                console.log('UserData:savePass setDataAsync', this.curPassIdx);
            }.bind(this));

            //设置玩家统计数据
            FBInstant.player.setStatsAsync({
                curPassIdx: this.curPassIdx
            }).then(function () {
                console.log('UserData:savePass setStatsAsync', this.curPassIdx);
            }.bind(this));

            return;
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
        //# sourceMappingURL=UserData.js.map
        