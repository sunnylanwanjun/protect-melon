(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/ConstVal.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '0d80fhbQ7ZKRYBRYflU+j9a', 'ConstVal', __filename);
// scripts/ConstVal.js

"use strict";

var _ResConfig;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ResName = {
    commonui: "texture/ui",
    gameConfig: "config/gameConfig",
    adConfig: "config/advConfig",
    passCommon: "config/pass/common",
    passTpl: "config/pass/template",
    loading: "prefab/loadingWnd",
    alert: "prefab/alert",
    singleColor: "texture/singleColor",
    editorConfig: "config/editorConfig",
    passAuto: "config/pass/passAuto",
    passItem: "config/pass/passItem",
    item: "config/pass/item"
};

var ItemType = {
    Block: "block",
    Destroy: "destroy",
    Freeze: "freeze",
    Capper: "capper",
    Pocket: "pocket",
    Wall: "wall"
};

var ConstVal = {
    ResName: ResName,
    ResConfig: (_ResConfig = {}, _defineProperty(_ResConfig, ResName.commonui, { resType: cc.SpriteAtlas }), _defineProperty(_ResConfig, ResName.loading, { resType: cc.Prefab }), _defineProperty(_ResConfig, ResName.alert, { resType: cc.Prefab }), _ResConfig),
    CommonRes: [ResName.commonui, ResName.gameConfig, ResName.adConfig, ResName.passCommon, ResName.passTpl, ResName.singleColor, ResName.editorConfig, ResName.passAuto, ResName.passItem, ResName.item, ResName.loading, ResName.alert],
    //场景预加载资源
    ScenePreloadRes: {
        // editor:[
        //     //this.resName.commonui
        // ],
        // main:[

        // ],
        // select:[

        // ],
        // game:[

        // ],
    },
    RoleState: {
        Live: "Live",
        Death: "Death",
        Reach: "Reach",
        Freeze: "Freeze",
        Protect: "Protect"
    },
    ItemOrder: [ItemType.Block, ItemType.Destroy, ItemType.Freeze, ItemType.Capper, ItemType.Pocket, ItemType.Wall],
    ItemType: ItemType
};

module.exports = ConstVal;

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
        //# sourceMappingURL=ConstVal.js.map
        