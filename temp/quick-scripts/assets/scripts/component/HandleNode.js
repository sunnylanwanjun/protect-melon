(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/component/HandleNode.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'a1cafiu3pFJrbYyCxirXGPP', 'HandleNode', __filename);
// scripts/component/HandleNode.js

'use strict';

cc.Class({
    extends: cc.Component,
    show: function show(event, value) {
        this.node.active = value == 'true';
    },
    switch: function _switch() {
        this.node.active = !this.node.active;
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
        //# sourceMappingURL=HandleNode.js.map
        