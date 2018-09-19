"use strict";
cc._RF.push(module, 'e669ftwgA1GvLG+WN49SpIt', 'Pool');
// scripts/Pool.js

"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

cc.Class({
    ctor: function ctor() {
        this.useList = {};
        this.poolList = [];
        this.useIdx = 0;
    },
    setBuildFunc: function setBuildFunc(buildFunc) {
        this._buildFunc = buildFunc;
    },
    setResetFunc: function setResetFunc(resetFunc) {
        this._resetFunc = resetFunc;
    },
    get: function get() {
        var obj = this.poolList.pop();
        if (!obj && this._buildFunc) {
            obj = this._buildFunc.apply(this, arguments);
        }
        if (obj) {
            obj.useFlag = this.useIdx;
            this.useIdx = this.useIdx + 1;
            this.useList[obj.useFlag] = obj;
        }
        return obj;
    },
    push: function push(obj) {
        var useFlag = obj.useFlag;
        delete this.useList[useFlag];
        delete obj.useFlag;
        this.poolList.push(obj);
        if (this._resetFunc) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            this._resetFunc.apply(this, [obj].concat(_toConsumableArray(args)));
        }
    },
    reset: function reset() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        for (var objKey in this.useList) {
            var obj = this.useList[objKey];
            if (obj) {
                this.poolList.push(obj);
                if (this._resetFunc) {
                    this._resetFunc.apply(this, [obj].concat(_toConsumableArray(args)));
                }
            }
        }
        this.useList = {};
    }
});

cc._RF.pop();