cc.Class({
    extends: cc.Component,

    properties: {
        progress:{
            default:undefined,
            type:cc.Label,
        }
    },

    // use this for initialization
    onLoad: function () {
        
        cc.constVal = require("ConstVal");
        cc.resName = cc.constVal.ResName;

        cc.globalEvent = new cc.EventTarget();
        
        var MyTimer = require("MyTimer");
        cc.timer = new MyTimer();

        var Utils = require("Utils");
        cc.utils = new Utils();

        var ResMgr = require("ResMgr");
        cc.resMgr = new ResMgr();
        cc.resMgr.init(cc.constVal.ResName,
            cc.constVal.ResConfig,
            cc.constVal.CommonRes,
            cc.constVal.ScenePreloadRes);

        cc.resMgr.loadCommon(function(err){
            if(err){
                return;
            }
            cc.log("load common finished");
            this.initGameData();
        }.bind(this),function(err,loadedResName,loadedNum,totalNum){
            if(err){
                return;
            }
            cc.log("loadProgress",loadedResName,loadedNum,totalNum);
            this.progress.string = "loading("+loadedNum+"/"+totalNum+")";
        }.bind(this));
    },

    // called every frame
    update: function (dt) {

    },

    initGameData: function(){
        cc.gameConfig = cc.resMgr.getRes(cc.resName.gameConfig);
        cc.adConfig = cc.resMgr.getRes(cc.resName.adConfig);

        var UserData = require("UserData");
        cc.userData = new UserData();
        cc.userData.init(function(){
            this.initGame();
        }.bind(this));
    },

    initGame: function(){
        var PassData = require("PassData");
        var GameDataClass = require("MelonData");
        cc.passData = new PassData();
        cc.passData.init(GameDataClass);
        cc.passData.initConfigList(function(){
            var GameCtrl = require("GameCtrl");
            cc.gameCtrl = new GameCtrl();
            cc.utils.loadScene("main");
        });
    }
});
