cc.Class({
    ctor(){
        this.useList = {};
        this.poolList = [];
        this.useIdx = 0;
    },
    setBuildFunc(buildFunc){
        this._buildFunc = buildFunc;
    },
    setResetFunc(resetFunc){
        this._resetFunc = resetFunc;
    },
    get(...args){
        var obj = this.poolList.pop();
        if(!obj&&this._buildFunc){
            obj = this._buildFunc(...args);
        }
        if(obj){
            obj.useFlag = this.useIdx;
            this.useIdx = this.useIdx + 1;
            this.useList[obj.useFlag] = obj;
        }
        return obj;
    },
    push(obj,...args){
        var useFlag = obj.useFlag;
        delete this.useList[useFlag];
        delete obj.useFlag;
        this.poolList.push(obj);
        if(this._resetFunc){
            this._resetFunc(obj,...args);
        }
    },
    reset(...args){
        for(var objKey in this.useList){
            var obj = this.useList[objKey];
            if(obj){
                this.poolList.push(obj);
                if(this._resetFunc){
                    this._resetFunc(obj,...args);
                }
            }
        }
        this.useList = {};
    }
})