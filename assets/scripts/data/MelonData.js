var CurData = require("CurData");
cc.Class({
    extends:CurData,
    ctor(){

    },

    initNewTurn(turnIdx){
        this.curTurnIdx = turnIdx;
        this.turnData[this.curTurnIdx] = {};
        
        this.curTurnData = this.turnData[this.curTurnIdx];
        
        if(turnIdx==0){
            var passItemConfig = cc.resMgr.getRes(cc.resName.passItem).data;
            var passItem = passItemConfig["pass"+this.passIdx];
            var itemData = {};
            for(var itemName in passItem){
                var itemArr = [];
                for(var i=0;i<passItem[itemName];i++){
                    itemArr.push(cc.utils.clone(this.itemConfig[itemName]));
                }
                itemData[itemName] = itemArr
            }
            this.curTurnData.itemData = itemData;
            
            this.curTurnData.mapData = cc.utils.clone(this.configData.mapData);

            this.curTurnData.targetData = [];
            this.curTurnData.capperData = [];
            this.curTurnData.roleData = [];
        }else{
            var preTurnData = this.getPreTurn();
            this.curTurnData.itemData = cc.utils.clone(preTurnData.itemData);

            this.curTurnData.mapData = {};

            this.curTurnData.targetData = cc.utils.clone(preTurnData.targetData);
            this.curTurnData.capperData = cc.utils.clone(preTurnData.capperData);
            this.curTurnData.roleData = cc.utils.clone(preTurnData.roleData);

            //清空路径信息，回退时不需要路径信息，否则也会表现出走路状态
            for(var key in this.curTurnData.roleData){
                this.curTurnData.roleData[key].path = [];
            }
        }
    },

    getTurn(turnIdx){
        return this.turnData[turnIdx];
    },

    getPreTurn(){
        return this.getTurn(this.curTurnIdx-1);
    },

    setPreTurnGrid(row,col,colData){
        var preTurn = this.getTurn(this.curTurnIdx-1);
        cc.utils.setIfUndef(preTurn.mapData,row,col,cc.utils.clone(colData));
    },
    setCurTurnGrid(row,col,colData){
        cc.utils.setProperty(this.curTurnData.mapData,row,col,cc.utils.clone(colData));
    },
    setNewMaterial(row,col,newMaterial){
        var oldMaterial = cc.utils.getProperty(this.topMapData,row,col,"material");

        var topColData = this.topMapData[row][col];
        this.setPreTurnGrid(row,col,topColData);
        topColData.material = newMaterial;
        this.setCurTurnGrid(row,col,topColData);

        var newMaterial = cc.utils.getProperty(this.topMapData,row,col,"material");
        this.checkUpdateTree(row,col,oldMaterial,newMaterial);
    },

    nextTurn(chainToNext){
        this.curTurnData.chainToNext = chainToNext;
        this.initNewTurn(this.curTurnIdx+1);
        cc.globalEvent.emit("CurData:UpdateMap");
        cc.globalEvent.emit("CurData:UpdateItemlist");
    },

    backTurn(){
        if(this.curTurnIdx>1){
            //结果数据还原
            this.gameResult = undefined;
            cc.globalEvent.emit("CurData:UpdateResult",this.gameResult);

            do{
                this.initNewTurn(this.curTurnIdx-1);

                //恢复topMapData
                var preTurn = this.getTurn(this.curTurnIdx-1);
                //清空路径信息，回退时不需要路径信息，否则也会表现出走路状态
                for(var key in preTurn.roleData){
                    preTurn.roleData[key].path = [];
                }

                for(var row in preTurn.mapData){
                    var rowData = preTurn.mapData[row];
                    for(var col in rowData){
                        var oldMaterial = cc.utils.getProperty(this.topMapData,row,col,"material");
                        this.topMapData[row][col]=cc.utils.clone(rowData[col]);
                        var newMaterial = cc.utils.getProperty(this.topMapData,row,col,"material");
                        this.checkUpdateTree(row,col,oldMaterial,newMaterial);
                    }
                }

                cc.globalEvent.emit("CurData:UpdateMap");
                cc.globalEvent.emit("CurData:UpdateItemlist");

            }while(this.curTurnIdx>1&&this.getPreTurn().chainToNext)
        }else{
            cc.warn("MelonData:backTurn is the frontest");
        }
    },

    checkUpdateTree(row,col,oldMaterial,newMaterial){

        var isUpateTree = false;
        var oldTypeMap = {floor:0,target:0,capper:0,block:0};
        this.isGridContain(oldMaterial,oldTypeMap);

        var newTypeMap = {floor:0,target:0,capper:0,block:0};
        this.isGridContain(newMaterial,newTypeMap);

        //新增tree
        if(oldTypeMap.capper<newTypeMap.capper){
            var newSearchData = {row:row,col:col,matName:"capper_1",tree:{}};
            this.searchMapData.push(newSearchData);
            this.buildMinTree(newSearchData.row,newSearchData.col,newSearchData.tree,newSearchData.row,newSearchData.col);
            isUpateTree = true;
        }

        if(oldTypeMap.target<newTypeMap.target){
            var newSearchData = {row:row,col:col,matName:"target_1",tree:{}};
            this.searchMapData.push(newSearchData);
            this.buildMinTree(newSearchData.row,newSearchData.col,newSearchData.tree,newSearchData.row,newSearchData.col);
            isUpateTree = true;
        }

        //删除tree
        if(oldTypeMap.capper>newTypeMap.capper){
            var delObj = {row:row,col:col,matName:"capper_1"};
            cc.utils.delByObj(this.searchMapData,delObj);
            isUpateTree = true;
        }

        if(oldTypeMap.target>newTypeMap.target){
            var delObj = {row:row,col:col,matName:"target_1"};
            cc.utils.delByObj(this.searchMapData,delObj);
            isUpateTree = true;
        }

        //更新tree
        if(oldTypeMap.floor<newTypeMap.floor||
           oldTypeMap.block>newTypeMap.block){
            this.updateSearchMapData(row,col,"add");
            isUpateTree = true;
        }

        if(oldTypeMap.floor>newTypeMap.floor||
            oldTypeMap.block<newTypeMap.block){
             this.updateSearchMapData(row,col,"del");
             isUpateTree = true;
        }

        if(isUpateTree){
            this.optimizeSearchMapData();
        }
    },

    deleteMinTree(minTree,r,c){
        var rebuildTreeArr = {};
        var deleteArr = {};
        var deleteGrid = function(row,col){
            var deleteNode = cc.utils.getProperty(minTree,row,col);
            if(!deleteNode){
                return;
            }
            var parentNode = cc.utils.getProperty(minTree,deleteNode.fromRow,deleteNode.fromCol);
            if(!parentNode){
                return;
            }
            delete parentNode.children[row+"_"+col];

            for(var key in deleteNode.children){
                var childNode = deleteNode.children[key];
                deleteGrid(childNode.row,childNode.col);
            }
            delete minTree[row][col];
            deleteArr[row+"_"+col]={row:row,col:col};
        }.bind(this);
        deleteGrid(r,c);

        for(var key in deleteArr){
            var deleteInfo = deleteArr[key];
            var resArr = [];
            var resArrLen = this.traverseAround(deleteInfo.row,deleteInfo.col,resArr,
                function(row,col){
                    var aroundNode = cc.utils.getProperty(minTree,row,col);
                    if (aroundNode) {
                        return true;
                    }else{
                        return false;
                    }
            },this);
            for(var i=0;i<resArrLen;i++){
                var aroundNode = resArr[i];
                rebuildTreeArr[aroundNode.row+"_"+aroundNode.col]=aroundNode;
            }
        }
        return rebuildTreeArr;
    },

    addMinTree(minTree,r,c){

        var rebuildTreeArr=[];
        var resArr = [];
        var resArrLen = this.traverseAround(r,c,resArr,
            function(row,col){
                var aroundNode = cc.utils.getProperty(minTree,row,col);
                if (aroundNode) {
                    return true;
                }else{
                    return false;
                }
        },this);
        for(var i=0;i<resArrLen;i++){
            var aroundNode = resArr[i];
            rebuildTreeArr[aroundNode.row+"_"+aroundNode.col]=aroundNode;
        }

        return rebuildTreeArr;
    },

    updateMinTree_DelNode(rootRow,rootCol,minTree,delr,delc){
        var rebuildTreeArr = this.deleteMinTree(minTree,delr,delc);
        for(var key in rebuildTreeArr){
            var subRoot = rebuildTreeArr[key];
            this.buildMinTree(rootRow,rootCol,minTree,subRoot.row,subRoot.col);
        }
    },

    updateMinTree_AddNode(rootRow,rootCol,minTree,addr,addc){
        var rebuildTreeArr = this.addMinTree(minTree,addr,addc);
        for(var key in rebuildTreeArr){
            var subRoot = rebuildTreeArr[key];
            this.buildMinTree(rootRow,rootCol,minTree,subRoot.row,subRoot.col);
        }
    },

    updateSearchMapData(row,col,updateType){
        for(var key in this.searchMapData){
            var searchData = this.searchMapData[key];
            if(!searchData){
                continue;
            }
            if(updateType=="del"){
                this.updateMinTree_DelNode(searchData.row,searchData.col,searchData.tree,row,col);
            }else{
                this.updateMinTree_AddNode(searchData.row,searchData.col,searchData.tree,row,col);
            }
        }
    },

    optimizeSearchMapData(){
        var allMultiDir = {};
        for(var key in this.searchMapData){
            var searchData = this.searchMapData[key];
            if(!searchData){
                continue;
            }
            var tree = searchData.tree;
            for(var rowKey in tree){
                var rowData = tree[rowKey];
                if(!rowData)continue;
                for(var colKey in rowData){
                    var info = rowData[colKey];
                    if(!info)continue;
                    for(var fromKey in info.fromOther){
                        allMultiDir[fromKey] = allMultiDir[fromKey] || 0;
                        allMultiDir[fromKey]++;
                    }
                }
            }
        }

        for(var key in this.searchMapData){
            var searchData = this.searchMapData[key];
            if(!searchData){
                continue;
            }
            var tree = searchData.tree;
            for(var rowKey in tree){
                var rowData = tree[rowKey];
                if(!rowData)continue;
                for(var colKey in rowData){
                    var info = rowData[colKey];
                    if(!info||!info.fromOther)continue;
                    var maxNum = 1;
                    var maxInfo = info;
                    var fromOther = info.fromOther;
                    for(var fromKey in fromOther){
                        if(!fromOther[fromKey])continue;
                        if(!allMultiDir[fromKey])continue;
                        if(allMultiDir[fromKey]>maxNum){
                            maxInfo = fromOther[fromKey];
                            maxNum = allMultiDir[fromKey];
                        }
                        else if(allMultiDir[fromKey]==maxNum){
                            if(fromOther[fromKey].priority<maxInfo.priority){
                                maxInfo = fromOther[fromKey];
                                maxNum = allMultiDir[fromKey];
                            }
                        }
                    }
                    if(maxInfo!==info){
                        this.changeParent(tree,info,rowKey,colKey,maxInfo.fromRow,maxInfo.fromCol);
                    }
                }
            }
        }
    },

    changeParent(minTree,info,sr,sl,fr,fl){
        if(info.hasOwnProperty("fromRow")){
            var oldFromRow = info.fromRow;
            var oldFromCol = info.fromCol;
            var parentNode = minTree[oldFromRow][oldFromCol];
            if(parentNode){
                delete parentNode.children[sr+"_"+sl];
            }else{
                cc.error("parent is null",oldFromRow,oldFromCol);
            }
        }

        if(sr!=fr||sl!=fl){
            var parentNode = minTree[fr][fl];
            parentNode.children[sr+"_"+sl] = {row:sr,col:sl};
        }

        info.fromRow=parseInt(fr);
        info.fromCol=parseInt(fl);
    },

    getDir(row,col,fromRow,fromCol){
        /*
                0
            5       1
                       
            4       2
                3
        */
        if(col%2==0){
            if(row==fromRow){
                if(col==fromCol+1){
                    return "5";
                }else if(col==fromCol-1){
                    return "1";
                }else if(col==fromCol){
                    return "-1";//自己
                }else{
                    return undefined;
                }
            }else if(row==fromRow+1){
                if(col==fromCol+1){
                    return "4";
                }else if(col==fromCol-1){
                    return "2";
                }else if(col==fromCol){
                    return "3";
                }else{
                    return undefined;
                }
            }else if(row==fromRow-1){
                if(col==fromCol){
                    return "0";
                }else{
                    return undefined;
                }
            }else{
                return "-2";//传送
            }
        }else{
        /*
            0
        5       1
                    
        4       2
            3
        */
            if(row==fromRow){
                if(col==fromCol+1){
                    return "4";
                }else if(col==fromCol-1){
                    return "2";
                }else if(col==fromCol){
                    return "-1";//自己
                }else{
                    return undefined;
                }
            }else if(row==fromRow+1){
                if(col==fromCol){
                    return "3";
                }else{
                    return undefined;
                }
            }else if(row==fromRow-1){
                if(col==fromCol+1){
                    return "5";
                }else if(col==fromCol-1){
                    return "1";
                }else if(col==fromCol){
                    return "0";
                }else{
                    return undefined;
                }
                
            }else{
                return "-2";//传送
            }
        }
    },

    buildMinTree(rootRow,rootCol,minTree,row,col){
        var buildGrid = function(sr,sl,fr,fl,len,forceBuild){
            if(!this.isGridCanReach(sr,sl))
                return;
            var fromLen = len + 1;
            var info = cc.utils.getPropertyOrInit(minTree,sr,sl);
            if(!forceBuild&&info.hasOwnProperty("fromLen")&&info.fromLen<=fromLen){
                if(info.fromLen==fromLen&&!info.children[fr+"_"+fl]){
                    info.fromOther[sr+"_"+sl+"_"+fr+"_"+fl] = {
                        fromRow:parseInt(fr),
                        fromCol:parseInt(fl),
                        fromLen:fromLen,
                        priority:this.getDirPriority(rootRow,rootCol,sr,sl,fr,fl),
                    };
                }
                return;
            }

            var priority = this.getDirPriority(rootRow,rootCol,sr,sl,fr,fl);
            this.changeParent(minTree,info,sr,sl,fr,fl);
            info.fromLen=fromLen;
            info.priority=priority;
            info.children = info.children || {};
            info.fromOther = {}
            info.fromOther[sr+"_"+sl+"_"+info.fromRow+"_"+info.fromCol] = {
                fromRow:info.fromRow,
                fromCol:info.fromCol,
                fromLen:info.fromLen,
                priority:priority,
            };

            var resArr = [];
            var slen = this.traverseAround(sr,sl,resArr,this.isGridCanReach,this);
            for(var i=0;i<slen;i++){
                var childRow = resArr[i].row;
                var childCol = resArr[i].col;
                if(childRow==fr&&childCol==fl){
                    continue;
                }
                buildGrid(resArr[i].row,resArr[i].col,sr,sl,fromLen);
            }
        }.bind(this);
        var rootInfo = cc.utils.getProperty(minTree,row,col);
        if(rootInfo){
            buildGrid(row,col,rootInfo.fromRow,rootInfo.fromCol,rootInfo.fromLen-1,true);
        }else{
            buildGrid(row,col,row,col,-1,true);
        }
        
    },

    initSearchMapData(){
        for(var key in this.curTurnData.targetData){
            var rootInfo = this.curTurnData.targetData[key];
            var searchData = {row:rootInfo.row,col:rootInfo.col,matName:rootInfo.matName,tree:{}};
            this.searchMapData.push(searchData);
            this.buildMinTree(searchData.row,searchData.col,searchData.tree,searchData.row,searchData.col);
        }
        for(var key in this.curTurnData.capperData){
            var rootInfo = this.curTurnData.capperData[key];
            var searchData = {row:rootInfo.row,col:rootInfo.col,matName:rootInfo.matName,tree:{}};
            this.searchMapData.push(searchData);
            this.buildMinTree(searchData.row,searchData.col,searchData.tree,searchData.row,searchData.col);
        }
        this.optimizeSearchMapData();
    },

    getQuad(tr,tc,rr,rc){
        if(rc<=tc){
            if(rr>=tr){
                return "quad2"
            }else{
                return "quad3"
            }
        }else{
            if(rr>=tr){
                return "quad1"
            }else{
                return "quad4"
            }
        }
    },

    //target row
    //target col
    //role row
    //role col
    //from row
    //from col
    getDirPriority(tr,tc,rr,rc,fr,fc){
        var dir = this.getDir(rr,rc,fr,fc);
        var quad = this.getQuad(tr,tc,rr,rc);
        var priorityCfg = this.priorityConfig[quad];
        var p = priorityCfg[dir] || 0;
        return p;
    },

    initGameData(){
        this.turnData = [];

        this.priorityConfig = {

            /*
                     0                        0
                5        1                1       5
                4        2                2       4
                     0                        0    


                    0                          0
                2       4                 2        4
                1       5                 1        5
                    0                          0


            */


            /*
                0
            1       5
            2       4
                0
            */

            quad1:{
                ["0"]:0,
                ["1"]:5,
                ["2"]:4,
                ["3"]:0,
                ["4"]:2,
                ["5"]:1,
            },

            /*
                0
            5       1
            4       2
                0
            */

            quad2:{
                ["0"]:0,
                ["1"]:1,
                ["2"]:2,
                ["3"]:0,
                ["4"]:4,
                ["5"]:5
            },

            /*
                0
            2       4
            1       5
                0
            */

            quad3:{
                ["0"]:0,
                ["1"]:4,
                ["2"]:5,
                ["3"]:0,
                ["4"]:1,
                ["5"]:2,
            },

            /*
                0
            2       4
            1       5
                0
            */

            quad4:{
                ["0"]:0,
                ["1"]:4,
                ["2"]:5,
                ["3"]:0,
                ["4"]:1,
                ["5"]:2,
            }
        }

        this.ItemType = cc.constVal.ItemType;
        this.RoleState = cc.constVal.RoleState;
        this.gameResult = undefined;
        cc.globalEvent.emit("CurData:UpdateResult",this.gameResult);

        //传送门
        this.doorData = {};
        //记录每个格子最新修改的数据
        this.topMapData = cc.utils.clone(this.configData.mapData);
        //针对每个目标点建立最小生成树
        this.searchMapData = [
            /*
            [0]={
                row:rootInfo.row,col:rootInfo.col,matName:rootInfo.matName
                tree:{
                    [row]={
                        [col]={
                            fromRow:row,fromCol:col,fromLen:length,
                        }
                    }
                }
            }
            */
        ]
        this.selectItemObj = undefined;
        this.itemConfig = cc.resMgr.getRes(cc.resName.item).data;

        this.initNewTurn(0);

        CurData.prototype.initGameData.call(this);  

        //建立传送门
        for(var key in this.doorData){
            var door = this.doorData[key];
            door.toDoor = {}
            for(var akey in this.doorData){
                var toDoor = this.doorData[akey];
                if(door.row==toDoor.row&&door.col==toDoor.col)continue;
                if(door.matName == toDoor.matName){
                    door.toDoor[toDoor.row+"_"+toDoor.col]=toDoor;
                }
            }
        }

        this.initSearchMapData();
        this.nextTurn();

        cc.globalEvent.emit("CurData:InitGameData");
    },
    
    initEachGridData(material,rowKey,colKey){
        CurData.prototype.initEachGridData.call(this,material,rowKey,colKey);
        for(var matType in material){
            if(!material[matType]){
                continue;
            }
            var sameMatSize = material[matType];
            for(var i=0;i<sameMatSize;i++){
                var alias = this.MatName[matType].matAlias;
                var matName = this.MatName[matType].matName;
                switch(alias){
                    case "target":
                        this.curTurnData.targetData.push({row:rowKey,col:colKey,
                            matName:matName,matType:matType});
                    break;
                    case "capper":
                        this.curTurnData.capperData.push({row:rowKey,col:colKey,
                            matName:matName,matType:matType});
                    break;
                    case "role":
                        //[{row:xx,col:xx},{row:xx,col:xx},...,{row:rowKey,}]
                        this.curTurnData.roleData.push({row:rowKey,col:colKey,
                            matName:matName,
                            matType:matType,
                            path:[],
                            state:this.RoleState.Live});
                    break;
                    case "door":
                        this.doorData[rowKey+"_"+colKey] = {row:rowKey,col:colKey,
                            matName:matName,matType:matType};
                    break;
                }
            }
        }
    },
    //////////////////////////////////////////////////////////////
    //游戏操作流程
    getSelectItemType(){
        if(!this.selectItemObj){
            return undefined;
        }
        return this.selectItemObj.type;
    },
    selectItem(itemType){
        this.unSelectItem();
        var itemArr = this.curTurnData.itemData[itemType];
        var lastItem = undefined;
        while(itemArr.length>0){
            lastItem = itemArr[itemArr.length-1];
            if(lastItem.times > 0){
                break;
            }
            itemArr.pop();
        }
        if(itemArr.length==0){
            cc.warn("MelonData:selectItem item",itemType,"has use up");
            return;
        }
        this.selectItemObj = lastItem;
    },
    unSelectItem(){
        if(!this.selectItemObj){
            cc.log("MelonData:unSelectItem selectItemObj is null");
            return;
        }
        this.selectItemObj = undefined;
        cc.globalEvent.emit("CurData:UpdateItemlist");
    },
    consumeItem(){
        var itemArr = this.curTurnData.itemData[this.selectItemObj.type];
        var lastItem = undefined;
        while(itemArr.length>0){
            lastItem = itemArr[itemArr.length-1];
            if(lastItem.times > 0){
                break;
            }
            itemArr.pop();
        }
        if(itemArr.length==0){
            cc.warn("MelonData:selectItem item",this.selectItemObj.type,"has use up");
            return;
        }
        lastItem.times--;
        if(lastItem.times<=0){
            itemArr.pop();
            this.selectItemObj = undefined;
        }
    },
    addItem(itemType,itemNum){
        cc.utils.setIfUndef(this.curTurnData.itemData,itemType,[]);
        var itemArr = cc.utils.getProperty(this.curTurnData.itemData,itemType);
        for(var i=0;i<itemNum;i++){
            itemArr.push(cc.utils.clone(this.itemConfig[itemType]));
        }

        cc.globalEvent.emit("CurData:UpdateItemlist");
    },
    playerToHandle(row,col){

        if(this.gameResult){
            cc.log("!!!!!!!!!!!!!MelonData:playerToHandle hasResult",this.gameResult);
            cc.globalEvent.emit("CurData:UpdateResult",this.gameResult);
            if(!cc.gameConfig.isEditorMode){
                return;
            }
        }

        this.needRoleToHandle = false;
        this.needNextTurn = false;
        this.needChainToNext = false;
        var material = cc.utils.getProperty(this.topMapData,row,col,"material");
        if(!material){
            return false;
        }
        if(this.selectItemObj){
            this.playerToHandleWithItem(row,col,material);
        }else{
            this.playerToHandleWithoutItem(row,col,material);
        }
        if(this.needRoleToHandle){
            this.roleToHandle();
        }
        if(this.needNextTurn){
            this.nextTurn(this.needChainToNext);
        }
    },
    playerToHandleWithItem(row,col,material){

        switch(this.selectItemObj.type){
            case this.ItemType.Block:
                if(!this.isGrid_CanBe_Destroy_Or_Add(material)){
                    cc.log("MelonData:playerToHandleWithItem",row,col,"can not add block");
                    return;
                }
                var newMaterial = cc.utils.clone(material);
                newMaterial[this.MatType.block_1] = 1;
                this.setNewMaterial(row,col,newMaterial);
            break;
            case this.ItemType.Destroy:
                if(!this.isGrid_CanBe_Destroy_Or_Add(material)){
                    cc.log("MelonData:playerToHandleWithItem",row,col,"can not destroy double");
                    return;
                }
                this.destroyFloor(row,col,material);
            break;
            case this.ItemType.Capper:
                if(!this.isGrid_CanBe_Destroy_Or_Add(material)){
                    cc.log("MelonData:playerToHandleWithItem",row,col,"can not add capper");
                    return;
                }
                //新建搜索树
                var rootInfo = {row:row,col:col,matName:"capper_1"}
                this.curTurnData.capperData.push(rootInfo);

                //更新材质
                var newMaterial = cc.utils.clone(material);
                newMaterial[this.MatType.capper_1] = 1;
                this.setNewMaterial(row,col,newMaterial);

            break;
            case this.ItemType.Freeze:
                var typeMap = {role:0};
                this.isGridContain(material,typeMap);
                if(typeMap.role==0){
                    cc.log("MelonData:playerToHandleWithItem",row,col,"has no role");
                    return;
                }

                var findRole = false;
                for(var key in this.curTurnData.roleData){
                    var roleData = this.curTurnData.roleData[key];
                    if(!roleData)continue;
                    if(roleData.row!=row||roleData.col!=col)continue;
                    if(roleData.state==this.RoleState.Live){
                        roleData.state = this.RoleState.Freeze;
                        roleData.freezeBout = 0;
                        findRole = true;
                    }else if(roleData.state==this.RoleState.Protect){
                        cc.log("MelonData:playerToHandleWithItem",row,col,"role is protect");
                    }
                }

                if(!findRole)
                    return;

            break;
            case this.ItemType.Pocket:
                var typeMap = {target:0};
                this.isGridContain(material,typeMap);
                if(typeMap.target==0){
                    cc.log("MelonData:playerToHandleWithItem",row,col,"has no target");
                    return;
                }

                var delObj = {row:row,col:col,matName:"target_1"};
                cc.utils.delByObj(this.curTurnData.targetData,delObj);

                var newMaterial = cc.utils.clone(material);
                newMaterial[this.MatType.target_1]--;
                if(newMaterial[this.MatType.target_1]==0){
                    delete newMaterial[this.MatType.target_1];
                }
                this.setNewMaterial(row,col,newMaterial);
            break;
            default:
                return;
            break;
        }
        var preSelectItemType = this.selectItemObj.type;
        this.needNextTurn = true;
        this.consumeItem();
        if(!this.selectItemObj){
            //双重粉碎完成后，怪物需要走一步
            if(preSelectItemType == this.ItemType.Destroy){
                this.needRoleToHandle = true;
            }
        }
    },
    isGridContain(material,typeMap){
        if(!material)return;
        for(var matType in material){
            if(!material[matType]){
                continue;
            }
            var sameMatSize = material[matType];
            if(sameMatSize<=0)continue;
            var alias = this.MatName[matType].matAlias;
            if(typeMap.hasOwnProperty(alias)){
                typeMap[alias]+=sameMatSize;
            }
        }
    },
    isGrid_CanBe_Destroy_Or_Add(material){
        var typeMap = {floor:0,role:0,capper:0,block:0,target:0,door:0};
        this.isGridContain(material,typeMap);
        if(typeMap.floor==0||
           typeMap.door>0||
           typeMap.role>0||
           typeMap.capper>0||
           typeMap.block>0||
           typeMap.target>0){
            return false;
        }
        return true;
    },
    destroyFloor(row,col,material){
        var floor_3 = material[this.MatType.floor_3];
        if(floor_3&&floor_3>0){
            return false;
        }
        var floor_1 = material[this.MatType.floor_1];
        if(floor_1&&floor_1>0){
            var newMaterial = {}
            newMaterial[this.MatType.water_1] = 1;
            this.setNewMaterial(row,col,newMaterial);
            return true;
        }
        var floor_2 = material[this.MatType.floor_2];
        if(floor_2&&floor_2>0){
            var newMaterial = {}
            newMaterial[this.MatType.floor_1] = 1;
            this.setNewMaterial(row,col,newMaterial);
            return true;
        }
        return false;
    },
    playerToHandleWithoutItem(row,col,material){
        if(!this.isGrid_CanBe_Destroy_Or_Add(material)){
            cc.log("MelonData:playerToHandleWithoutItem",row,col,"can not be destroy");
            return;
        }
        var isSuccess = this.destroyFloor(row,col,material);
        if(isSuccess){
            this.needRoleToHandle = true;
            this.needNextTurn = true;
        }
    },
    isGridCanReach(row,col){
        if(row<0||col<0){
            return false;
        }
        var material = cc.utils.getProperty(this.topMapData,row,col,"material");
        if(!material){
            return false;
        }
        var typeMap = {floor:0,block:0,door:0};
        this.isGridContain(material,typeMap);
        if((typeMap.floor==0&&typeMap.door==0)||
           typeMap.block>0){
            return false;
        }
        return true;
    },
    traverseAround(row,col,resArr,judgeFunc,caller){
        row = parseInt(row);
        col = parseInt(col);

        var idx=0;
        var i=(col%2==0)?row-1:row+1;
        var j=col-1;
        for(j=col-1;j<=col+1;j++){
            if(judgeFunc.call(caller,i,j)){
                resArr[idx]={row:i,col:j};
                idx++;
            }
        }
        i=row;
        j=col-1;
        if(judgeFunc.call(caller,i,j)){
            resArr[idx]={row:i,col:j};
            idx++;
        }
        i=row;
        j=col+1;
        if(judgeFunc.call(caller,i,j)){
            resArr[idx]={row:i,col:j};
            idx++;
        }
        i=(col%2==0)?row+1:row-1;
        j=col;
        if(judgeFunc.call(caller,i,j)){
            resArr[idx]={row:i,col:j};
            idx++;
        }
        var door = this.doorData[row+"_"+col];
        if(door){
            for(var key in door.toDoor){
                var toDoor = door.toDoor[key];
                if(judgeFunc.call(caller,toDoor.row,toDoor.col)){
                    resArr[idx]={row:toDoor.row,col:toDoor.col};
                    idx++;
                }
            }
        }
        return idx;
    },
    roleToGrid(roleInfo,toRow,toCol){
        var matName=roleInfo.matName;
        var row=roleInfo.row;
        var col=roleInfo.col;

        roleInfo.row=toRow;
        roleInfo.col=toCol;

        var oldMaterial = cc.utils.getProperty(this.topMapData,row,col,"material");
        var newMaterial = cc.utils.clone(oldMaterial);
        newMaterial[this.MatType[matName]]--;
        this.setNewMaterial(row,col,newMaterial);

        oldMaterial = cc.utils.getProperty(this.topMapData,toRow,toCol,"material");
        newMaterial = cc.utils.clone(oldMaterial);
        cc.utils.setIfUndef(newMaterial,this.MatType[matName],0);
        newMaterial[this.MatType[matName]]++;

        var typeMap = {target:0,capper:0};
        this.isGridContain(newMaterial,typeMap);
        if(typeMap.target>0){
            this.gameResult = "lost";
            cc.globalEvent.emit("CurData:UpdateResult",this.gameResult);
            cc.log("!!!!!!!!!!!!MelonData:roleToGrid hasResult",this.gameResult);
        }
        
        if(typeMap.capper>0){
            var delObj = {row:toRow,col:toCol,matName:"capper_1"};
            cc.utils.delByObj(this.curTurnData.capperData,delObj);
            newMaterial[this.MatType.capper_1]--;
            if(newMaterial[this.MatType.capper_1]==0){
                delete newMaterial[this.MatType.capper_1];
            }
        }

        this.setNewMaterial(toRow,toCol,newMaterial);
    },
    roleToHandle(){
        var hasPath = false;
        for(var akey in this.curTurnData.roleData){
            var roleInfo = this.curTurnData.roleData[akey];
            var minPathInfo = undefined;
            var minSearchData = undefined;

            for(var key in this.searchMapData){
                var searchData = this.searchMapData[key];
                var pathInfo = cc.utils.getProperty(searchData,"tree",roleInfo.row,roleInfo.col);
                if(!pathInfo)continue;
                if(!minPathInfo||minPathInfo.fromLen>pathInfo.fromLen){
                    minPathInfo = pathInfo;
                    minSearchData = searchData;
                }
            }

            if(minPathInfo){
                hasPath = true;

                if(roleInfo.state == this.RoleState.Freeze){
                    roleInfo.freezeBout++;
                    if(roleInfo.freezeBout<this.itemConfig.freeze.effectBout){
                        cc.log("MelonData:roleToHandle",roleInfo.row,roleInfo.col,"has freeze");
                    }else{
                        roleInfo.state = this.RoleState.Protect;
                        delete roleInfo.freezeBout;
                    }
                    continue;
                }else if(roleInfo.state == this.RoleState.Protect){
                    roleInfo.state = this.RoleState.Live;
                }

                if(roleInfo.matName=="role_2"){
                    var endPathInfo = cc.utils.getProperty(minSearchData,"tree",minPathInfo.fromRow,minPathInfo.fromCol);
                    roleInfo.path[0] = {row:minPathInfo.fromRow,col:minPathInfo.fromCol};
                    roleInfo.path[1] = {row:endPathInfo.fromRow,col:endPathInfo.fromCol};
                    this.roleToGrid(roleInfo,endPathInfo.fromRow,endPathInfo.fromCol);
                }else{
                    this.roleToGrid(roleInfo,minPathInfo.fromRow,minPathInfo.fromCol);
                }
            }
        }
        if(!hasPath){
            this.gameResult = "win";
            cc.globalEvent.emit("CurData:UpdateResult",this.gameResult);
            cc.log("!!!!!!!!!!!!MelonData:roleToHandle hasResult",this.gameResult);
            cc.userData.saveMaxPass(this.passIdx+1);
            cc.userData.savePass(this.passIdx+1);
        }
    },
})