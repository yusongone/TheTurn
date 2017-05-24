var Page=window.Page||{};
Page.Storage=(function(){
    var changeHandlers=[];
    if(!localStorage.Data){
        localStorage.Data=JSON.stringify({
            groups:{}
        });
    };
    var _storage=JSON.parse(localStorage.Data);

    function updateLocalStorage(){
        var str=JSON.stringify(_storage);
        localStorage.Data=str;
        fireChange();
    }

    function fireChange(){
        for(var i=0;i<changeHandlers.length;i++){
            changeHandlers[i](_storage);
        }
    }

    function getLinkByName(group,name){
        for(var i=0;i<group.links.length;i++) {
            if (group.links[i].name == name) {
                return group.links[i];
            }
        }
    }

    function removeLinkByName(group,name){
        for(var i=0;i<group.links.length;i++) {
            if (group.links[i].name == name) {
                return group.links.splice(i,1);
            }
        }
    }

    return {
        addGroup(jsonData,callback){
            if(!_storage.groups[jsonData.name]){
                _storage.groups[jsonData.name]={
                    checked:true,
                    name:jsonData.name,
                    desc:jsonData.desc,
                    links:[]
                };
                callback({err:false,group:_storage.groups[jsonData.name]});
            }else{
                callback({err:true,errMsg:"分组已经存在!"});
            }
            updateLocalStorage();
        },
        removeGroup(groupName){
            delete _storage.groups[groupName];
            updateLocalStorage();
        },
        addLink(json,callback){
            json.link.checked=true;
            _storage.groups[json.group].links.push(json.link);
            updateLocalStorage();
            callback({err:false});
        },
        removeLink(group,link){
            var group=_storage.groups[group.name];
            removeLinkByName(group,link.name)
            updateLocalStorage();
        },
        setGroupChecked(json){
            _storage.groups[json.group.name].checked=json.checked;
            updateLocalStorage();
        },
        updateLinkData(json,callback){
            var group=_storage.groups[json.group.name];
            var link=getLinkByName(group,json.link.name);
            if(!link){
                return callback({err:true,errMsg:"库中不存在此映射"});
            }

            var bool1=link.name!=json.data.name;//要更改的名字和自己旧的名字不一样
            if(bool1&&getLinkByName(group,json.data.name)){
                return callback({err:true,errMsg:"名称已经存在"});
            }

            for(var j in json.data){
                link[j]=json.data[j]
            }
            updateLocalStorage();
            callback({err:false});
        },
        onChange(handler){
            changeHandlers.push(handler);
        },
        getData(){
            _storage=JSON.parse(localStorage.Data);
            window._storage= _storage;
            return _storage;
        }
    }
})();
