var ResName = {
    commonui:"texture/ui",
    gameConfig:"config/gameConfig",
    adConfig:"config/advConfig",
    passCommon:"config/pass/common",
    passTpl:"config/pass/template",
    loading:"prefab/loadingWnd",
    alert:"prefab/alert",
    singleColor:"texture/singleColor",
    editorConfig:"config/editorConfig",
    passAuto:"config/pass/passAuto",
    passItem:"config/pass/passItem",
    item:"config/pass/item",
};

var ItemType = {
    Block:"block",
    Destroy:"destroy",
    Freeze:"freeze",
    Capper:"capper",
    Pocket:"pocket",
    Wall:"wall"
}

var ConstVal = {
    ResName:ResName,
    ResConfig:{
        [ResName.commonui]:{resType:cc.SpriteAtlas},
        [ResName.loading]:{resType:cc.Prefab},
        [ResName.alert]:{resType:cc.Prefab},
    },
    CommonRes:[
        ResName.commonui,
        ResName.gameConfig,
        ResName.adConfig,
        ResName.passCommon,
        ResName.passTpl,
        ResName.singleColor,
        ResName.editorConfig,
        ResName.passAuto,
        ResName.passItem,
        ResName.item,
        ResName.loading,
        ResName.alert,
    ],
    //场景预加载资源
    ScenePreloadRes:{
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
    RoleState:{
        Live:"Live",
        Death:"Death",
        Reach:"Reach",
        Freeze:"Freeze",
        Protect:"Protect",
    },
    ItemOrder:[
        ItemType.Block,
        ItemType.Destroy,
        ItemType.Freeze,
        ItemType.Capper,
        ItemType.Pocket,
        ItemType.Wall
    ],
    ItemType:ItemType,
};

module.exports = ConstVal;