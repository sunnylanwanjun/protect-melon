cc.Class({
    extends:cc.Component,
    properties:{
        passLabel:{
            default:undefined,
            type:cc.Label,
        }
    },
    onLoad(){
        this.curPassIdx = cc.passData.getCurPassIdx();
        this.curPassData = cc.passData.getCurPassData();
        this.passLabel.string = "pass:"+this.curPassIdx;
    },
    toGame(){
        this.curPassData.initGameData();
        cc.utils.loadScene("game");
    },
    toSelect(){
        cc.utils.loadScene("select");
    }
})