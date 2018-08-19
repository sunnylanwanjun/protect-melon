cc.Class({
    getPropertyOrInit(obj,...args){
        if(!obj)return undefined;
        var argsLen = arguments.length-1;
        for(var i=0;i<argsLen;i++){
            if(!obj[args[i]]){
                obj[args[i]] = {}
            }
            obj = obj[args[i]];
        }
        return obj;
    },
    getProperty(obj,...args){
        if(!obj)return undefined;
        var argsLen = arguments.length-1;
        for(var i=0;i<argsLen;i++){
            if(!obj[args[i]]){
                return undefined;
            }
            obj = obj[args[i]];
        }
        return obj;
    },
    setIfUndef(obj,...args){
        if(!obj)return undefined;
        var argsLen = arguments.length-1;
        for(var i=0;i<argsLen-2;i++){
            if(!obj[args[i]]){
                obj[args[i]] = {}
            }
            obj = obj[args[i]];
        }
        if(obj[args[argsLen-2]]){
            return;
        }
        obj[args[argsLen-2]] = args[argsLen-1];
    },
    setProperty(obj,...args){
        if(!obj)return undefined;
        var argsLen = arguments.length-1;
        for(var i=0;i<argsLen-2;i++){
            if(!obj[args[i]]){
                obj[args[i]] = {}
            }
            obj = obj[args[i]];
        }
        obj[args[argsLen-2]] = args[argsLen-1];
    },
    alert(title,yesCallback,noCallback){
        var curScene = cc.director.getScene();
        var prefab = cc.resMgr.getRes(cc.resName.alert);
        var alert = cc.instantiate(prefab);
        this.center(alert);
        alert.parent = curScene;
        alert.name = "__ALERT_WND__";
        var alertScript = alert.getComponent("Alert");
        alertScript.init(title,yesCallback,noCallback);
        return alert;
    },
    openLoading(){
        this.closeLoading();
        var curScene = cc.director.getScene();
        var prefab = cc.resMgr.getRes(cc.resName.loading);
        var loading = cc.instantiate(prefab);
        this.center(loading);
        loading.parent = curScene;
        loading.name = "__LOADING_WND__";
        return loading;
    },
    closeLoading(){
        var curScene = cc.director.getScene();
        var child = curScene.getChildByName("__LOADING_WND__");
        if(child){
            child.destroy();
        }
    },
    loadScene(sceneName,callback){
        var loading = this.openLoading();
        cc.resMgr.loadScene(sceneName,function(err){
            if(err){
                return;
            }
            var sceneAssets = cc.resMgr.getRes(sceneName);
            cc.director.runSceneImmediate(sceneAssets.scene);
            if(callback){
                callback();
            }
        },function(err,loadedResName,loadedNum,totalNum){
            if(err){
                return;
            }
            cc.log("Utils:loadScene",loadedResName,loadedNum,totalNum);
            if(cc.isValid(loading)){
                var loadingScript = loading.getComponent("Loading");
                loadingScript.setProgress(loadedNum,totalNum);
            }
        });
    },
    clone(obj){
        if(!obj){
            cc.log("Utils:clone obj is undefined");
            return undefined;
        }
        var jsonStr = JSON.stringify(obj);
        return JSON.parse(jsonStr);
    },
    getMapCount(map){
        var count = 0;
        for(var key in map){
            if(map[key]){
                count++;
            }
        }
        return count;
    },
    delByObj(srcObj,delObj){
        for(var key in srcObj){
            var srcVal = srcObj[key];
            if(!srcVal)continue;
            var hasFind = true;
            for(var delKey in delObj){
                if(srcVal[delKey] != delObj[delKey]){
                    hasFind = false;
                    break;
                }
            }
            if(hasFind){
                delete srcObj[key];
                break;
            }
        }
    },
    loadNetImg(remoteUrl,node,width,height){
        if(!remoteUrl||!node)return;
        cc.loader.load({url: remoteUrl, type: 'png'}, function (err, texture) {
            // Use texture to create sprite frame
            if(err){
                cc.log("Utils:loadNetImg failure",remoteUrl);
                return;
            }
            if(cc.isValid(node)){
                var sp = node.getComponent(cc.Sprite);
                sp.spriteFrame = new cc.SpriteFrame(texture);
                node.width = width;
                node.height = height;
            }
        });
    },
    center(node){
        node.x = cc.winSize.width*0.5;
        node.y = cc.winSize.height*0.5;
    },
    random(min,max){
        return Math.floor(Math.random()*(max-min+1)+min);
    },
})