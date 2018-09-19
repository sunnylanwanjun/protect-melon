"use strict";
cc._RF.push(module, 'faa19i71thFoaD0pEhMZ949', 'Utils');
// scripts/Utils.js

"use strict";

cc.Class({
    getPropertyOrInit: function getPropertyOrInit(obj) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        if (!obj) return undefined;
        var argsLen = arguments.length - 1;
        for (var i = 0; i < argsLen; i++) {
            if (!obj[args[i]]) {
                obj[args[i]] = {};
            }
            obj = obj[args[i]];
        }
        return obj;
    },
    getProperty: function getProperty(obj) {
        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
        }

        if (!obj) return undefined;
        var argsLen = arguments.length - 1;
        for (var i = 0; i < argsLen; i++) {
            if (!obj[args[i]]) {
                return undefined;
            }
            obj = obj[args[i]];
        }
        return obj;
    },
    setIfUndef: function setIfUndef(obj) {
        for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
            args[_key3 - 1] = arguments[_key3];
        }

        if (!obj) return undefined;
        var argsLen = arguments.length - 1;
        for (var i = 0; i < argsLen - 2; i++) {
            if (!obj[args[i]]) {
                obj[args[i]] = {};
            }
            obj = obj[args[i]];
        }
        if (obj[args[argsLen - 2]]) {
            return;
        }
        obj[args[argsLen - 2]] = args[argsLen - 1];
    },
    setProperty: function setProperty(obj) {
        for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
            args[_key4 - 1] = arguments[_key4];
        }

        if (!obj) return undefined;
        var argsLen = arguments.length - 1;
        for (var i = 0; i < argsLen - 2; i++) {
            if (!obj[args[i]]) {
                obj[args[i]] = {};
            }
            obj = obj[args[i]];
        }
        obj[args[argsLen - 2]] = args[argsLen - 1];
    },
    alert: function alert(title, yesCallback, noCallback) {
        var curScene = cc.director.getScene();
        var prefab = cc.resMgr.getRes(cc.resName.alert);
        var alert = cc.instantiate(prefab);
        this.center(alert);
        alert.parent = curScene;
        alert.name = "__ALERT_WND__";
        var alertScript = alert.getComponent("Alert");
        alertScript.init(title, yesCallback, noCallback);
        return alert;
    },
    openLoading: function openLoading() {
        this.closeLoading();
        var curScene = cc.director.getScene();
        var prefab = cc.resMgr.getRes(cc.resName.loading);
        var loading = cc.instantiate(prefab);
        this.center(loading);
        loading.parent = curScene;
        loading.name = "__LOADING_WND__";
        return loading;
    },
    closeLoading: function closeLoading() {
        var curScene = cc.director.getScene();
        var child = curScene.getChildByName("__LOADING_WND__");
        if (child) {
            child.destroy();
        }
    },
    loadScene: function loadScene(sceneName, callback) {
        var loading = this.openLoading();
        cc.resMgr.loadScene(sceneName, function (err) {
            if (err) {
                return;
            }
            var sceneAssets = cc.resMgr.getRes(sceneName);
            cc.director.runSceneImmediate(sceneAssets.scene);
            if (callback) {
                callback();
            }
        }, function (err, loadedResName, loadedNum, totalNum) {
            if (err) {
                return;
            }
            cc.log("Utils:loadScene", loadedResName, loadedNum, totalNum);
            if (cc.isValid(loading)) {
                var loadingScript = loading.getComponent("Loading");
                loadingScript.setProgress(loadedNum, totalNum);
            }
        });
    },
    clone: function clone(obj) {
        if (!obj) {
            cc.log("Utils:clone obj is undefined");
            return undefined;
        }
        var jsonStr = JSON.stringify(obj);
        return JSON.parse(jsonStr);
    },
    getMapCount: function getMapCount(map) {
        var count = 0;
        for (var key in map) {
            if (map[key]) {
                count++;
            }
        }
        return count;
    },
    delByObj: function delByObj(srcObj, delObj) {
        for (var key in srcObj) {
            var srcVal = srcObj[key];
            if (!srcVal) continue;
            var hasFind = true;
            for (var delKey in delObj) {
                if (srcVal[delKey] != delObj[delKey]) {
                    hasFind = false;
                    break;
                }
            }
            if (hasFind) {
                delete srcObj[key];
                break;
            }
        }
    },
    loadNetImg: function loadNetImg(remoteUrl, node, width, height) {
        if (!remoteUrl || !node) return;
        cc.loader.load({ url: remoteUrl, type: 'png' }, function (err, texture) {
            // Use texture to create sprite frame
            if (err) {
                cc.log("Utils:loadNetImg failure", remoteUrl);
                return;
            }
            if (cc.isValid(node)) {
                var sp = node.getComponent(cc.Sprite);
                sp.spriteFrame = new cc.SpriteFrame(texture);
                node.width = width;
                node.height = height;
            }
        });
    },
    center: function center(node) {
        node.x = cc.winSize.width * 0.5;
        node.y = cc.winSize.height * 0.5;
    },
    random: function random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
});

cc._RF.pop();