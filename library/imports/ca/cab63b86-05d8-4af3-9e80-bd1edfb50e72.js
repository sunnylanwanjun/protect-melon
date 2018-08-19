"use strict";
cc._RF.push(module, 'cab63uGBdhK856AvR7ftQ5y', 'PassData');
// scripts/data/PassData.js

"use strict";

cc.Class({
    ctor: function ctor() {},
    init: function init(GameDataClass) {

        this.configList = [];

        this.commonConfig = cc.resMgr.getRes(cc.resName.passCommon);

        this.passAuto = cc.resMgr.getRes(cc.resName.passAuto);

        this.template = cc.resMgr.getRes(cc.resName.passTpl);

        var matTypeArr = this.commonConfig.matTypeArr;
        var matNameToType = this.commonConfig.matNameToType;
        var matTypeToName = this.commonConfig.matTypeToName;
        var matIcon = this.commonConfig.matIcon;
        for (var idx = 0; idx < matTypeArr.length; idx++) {
            var matName = matTypeArr[idx];
            matNameToType[matName] = idx;
            matTypeToName[idx] = { matName: matName, matAlias: matName.split("_")[0] };
            matIcon[idx] = "ui-" + matName;
        }
        var matShowOrder = this.commonConfig.matShowOrder;
        var matShowOrderMap = {};
        for (var idx = 0; idx < matShowOrder.length; idx++) {
            matShowOrderMap[matShowOrder[idx]] = idx;
        }
        this.commonConfig.matShowOrderMap = matShowOrderMap;

        this.curPassData = new GameDataClass();
        this.curPassData.initCommonConfig(this.commonConfig);
    },
    initConfigList: function initConfigList(onFinished) {
        if (cc.gameConfig.isEditorMode && cc.sys.isNative && (cc.sys.platform == cc.sys.WIN32 || cc.sys.platform == cc.sys.MACOS)) {
            var idx = 0;
            var path = "/config/pass/pass";
            var loadedCallback = function (err, res) {
                if (err) {
                    cc.log("load all pass finished config list len", idx);
                    this.savePassAuto();
                    this.savePassAll();
                    onFinished();
                    return;
                }

                //兼容旧配置
                res.mapInfo.scale = res.mapInfo.scale || 1.0;

                this.configList[idx] = res;
                idx++;
                cc.resMgr.loadEditorRes(path + idx, loadedCallback);
            }.bind(this);
            cc.resMgr.loadEditorRes(path + idx, loadedCallback);
        } else {
            var loadedCallback = function (err, res) {
                if (err) {
                    cc.error("load all pass failed");
                    return;
                }

                //兼容旧配置
                for (var key in res) {
                    var aRes = res[key];
                    if (aRes) {
                        aRes.mapInfo.scale = aRes.mapInfo.scale || 1.0;
                    }
                }

                this.configList = res;
                cc.log("load all pass finished config list len", this.configList.length);
                onFinished();
            }.bind(this);
            cc.resMgr.loadEditorRes("/config/pass/passAll", loadedCallback);
        }
    },
    loadPass: function loadPass(passIdx, callback) {
        cc.log("PassMgr:loadPass", passIdx);
        if (this.configList[passIdx]) {
            cc.log("PassMgr:loadPass from cache", JSON.stringify(this.configList[passIdx]));
            this.initCurPassData(passIdx);
            callback(true);
            return;
        }
        var url = "/config/pass/pass" + passIdx;
        cc.resMgr.loadRes(url, function (err, res) {
            if (err) {
                if (cc.gameConfig.isEditorMode) {
                    cc.log("PassData:loadPass", url, "failure will init by template");
                    this.configList[passIdx] = cc.utils.clone(this.template);
                    this.initCurPassData(passIdx);
                    callback(true);
                } else {
                    cc.log("PassData:loadPass", url, "failure");
                    callback(false);
                }
                return;
            }
            cc.log("PassData:loadPass", url, " success");

            //兼容旧配置
            res.mapInfo.scale = res.mapInfo.scale || 1.0;

            this.configList[passIdx] = res;
            this.initCurPassData(passIdx);
            callback(true);
        }.bind(this));
    },
    savePassAuto: function savePassAuto() {
        this.passAuto.passCount = this.configList.length;
        cc.resMgr.writeEditorRes("/config/pass/passAuto.json", JSON.stringify(this.passAuto));
    },
    savePassAll: function savePassAll() {
        cc.resMgr.writeEditorRes("/config/pass/passAll.json", JSON.stringify(this.configList));
    },
    savePass: function savePass(passIdx) {
        cc.resMgr.writeEditorRes("/config/pass/pass" + passIdx + ".json", JSON.stringify(this.configList[passIdx]));
        this.savePassAuto();
    },
    initCurPassData: function initCurPassData(passIdx) {
        this.curPassData.initConfigData(passIdx);
        this.curEditorData = { curMatierl: 0 };
        cc.userData.savePass(passIdx);
    },
    getPassCount: function getPassCount() {
        return this.passAuto.passCount;
    },
    getConfigData: function getConfigData(passIdx) {
        return this.configList[passIdx];
    },
    getConfigList: function getConfigList() {
        return this.configList;
    },
    getCurPassData: function getCurPassData() {
        return this.curPassData;
    },
    getCurPassIdx: function getCurPassIdx() {
        return this.curPassData.passIdx;
    },
    getCurEditorData: function getCurEditorData() {
        return this.curEditorData;
    },
    getCommonConfig: function getCommonConfig() {
        return this.commonConfig;
    }
});

cc._RF.pop();