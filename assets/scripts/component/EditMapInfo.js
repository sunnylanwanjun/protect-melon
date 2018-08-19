cc.Class({
    extends: cc.Component,

    properties: {
        rowObj:{
            default:undefined,
            type:cc.EditBox,
        },
        colObj:{
            default:undefined,
            type:cc.EditBox,
        },
        posxObj:{
            default:undefined,
            type:cc.EditBox,
        },
        posyObj:{
            default:undefined,
            type:cc.EditBox,
        },
        isDragObj:{
            default:undefined,
            type:cc.Toggle,
        },
        scaleObj:{
            default:undefined,
            type:cc.EditBox,
        }
    },

    onLoad(){
        
    },

    onEnable () {
        this.curPassData = cc.passData.getCurPassData();
        var mapInfo = this.curPassData.configData.mapInfo;
        this.rowObj.string = mapInfo.row;
        this.colObj.string = mapInfo.col;
        this.posxObj.string = mapInfo.posx;
        this.posyObj.string = mapInfo.posy;
        this.scaleObj.string = mapInfo.scale;
        this.isDragObj.isChecked = mapInfo.isDrag;
    },

    start () {

    },

    // update (dt) {},

    clear(){
        this.curPassData.configData.mapData = {};
        cc.passData.initCurPassData(this.curPassData.passIdx);
        cc.passData.savePass(cc.passData.getCurPassIdx());
        cc.globalEvent.emit("Editor:UpdateMap");
    },

    apply(){
        var mapInfo = this.curPassData.configData.mapInfo;
        var needUpdateMap = false;

        var newRow = parseInt(this.rowObj.string);
        var newCol = parseInt(this.colObj.string);
        if(newRow<=0||newCol<=0){
            cc.warn("map row or col must be bigger than 0");
            return;
        }
        if( newRow != mapInfo.row || 
            newCol != mapInfo.col){
            this.curPassData.configData.mapData = {};
            needUpdateMap = true;
            mapInfo.row = newRow;
            mapInfo.col = newCol;
            cc.passData.initCurPassData(this.curPassData.passIdx);
            cc.warn("!!!!!!!!!row col chnage clear map data!!!!!!!!!");
        }
        mapInfo.scale = parseFloat(this.scaleObj.string);
        mapInfo.posx = parseInt(this.posxObj.string);
        mapInfo.posy = parseInt(this.posyObj.string);
        mapInfo.isDrag = this.isDragObj.isChecked;
        cc.passData.savePass(cc.passData.getCurPassIdx());
        if(needUpdateMap){
            cc.globalEvent.emit("Editor:UpdateMap");
        }else{
            cc.globalEvent.emit("Editor:UpdateMapPos");
        }
    },
});
