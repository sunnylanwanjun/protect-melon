(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/component/Alert.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '4a09cblugtBqYDo83Gwk6xA', 'Alert', __filename);
// scripts/component/Alert.js

"use strict";

var nop = function nop() {};

cc.Class({
    extends: cc.Component,
    properties: {
        title: {
            default: undefined,
            type: cc.Label
        }
    },
    onLoad: function onLoad() {},
    init: function init(title, yesCallback, noCallback) {
        this.yesCallback = yesCallback || nop;
        this.noCallback = noCallback || nop;
        this.title.string = title;
    },
    clickYes: function clickYes() {
        this.yesCallback();
        this.node.destroy();
    },
    clickNo: function clickNo() {
        this.noCallback();
        this.node.destroy();
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
        //# sourceMappingURL=Alert.js.map
        