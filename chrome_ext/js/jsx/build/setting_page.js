var Page=window.Page||{};
$(document).ready(function(){
    Page.App.init();
});


Page.App=(function(){
    var GroupsToolBar=(function(){
        var Dialog=React.createClass({displayName: "Dialog",
            getInitialState(){
                return{
                    show:true,
                    errMsg:"",
                    inputName:"",
                    inputDesc:""
                }
            },
            close(){
                this.props.onClose();
                this.state.show=false;
                this.setState(this.state);
            },
            ok(){
                var self=this;
                if(""==this.state.inputName){return}
                this.props.onOk({
                    name:this.state.inputName,
                    desc:this.state.inputDesc
                },function(result){
                    if(result.err){
                        self.setState({
                            errMsg:result.errMsg
                        });
                    }else{
                        self.setState({
                            errMsg:""
                        });
                    }
                });
            },
            componentWillReceiveProps(newProps){
                if(newProps.show==true){
                    this.state.show=true;
                    this.setState(this.state);
                }
            },
            render(){
                var self=this;
                if(!this.state.show){
                    return null;
                }
                var errMsg=null;
                if(this.state.errMsg!=""){
                    errMsg=React.createElement("p", {className: "errMsg"}, this.state.errMsg);
                }
                return  React.createElement("div", {className: "dialog createGroup"}, 
                            React.createElement("div", {className: "statusBar"}, 
                                React.createElement("label", {className: "title"}, this.props.title), 
                                React.createElement("div", {className: "closeBtn", onClick: this.close}, "×")
                            ), 
                            React.createElement("div", {className: "container"}, 
                                React.createElement("p", null, 
                                    React.createElement("label", null, "名称 :"), 
                                    React.createElement("input", {type: "text", value: this.state.inputName, onChange: function(event){
                                        self.setState({
                                            inputName:event.target.value
                                        });
                                    }})
                                ), 
                                React.createElement("p", null, 
                                    React.createElement("label", null, "描述 :"), 
                                    React.createElement("textarea", {value: this.state.inputDesc, onChange: function(event){
                                        self.setState({
                                            inputDesc:event.target.value
                                        });
                                    }})
                                ), 
                                errMsg
                            ), 
                            React.createElement("div", {className: "btnBar"}, 
                                React.createElement("div", {className: "btn", onClick: this.close}, "取消"), 
                                React.createElement("div", {className: "btn ok", onClick: this.ok}, "确定")
                            )
                        )
            }
        });

        var toolBar=React.createClass({displayName: "toolBar",
            componentDidMount() {
                var p = this.props.modalBoxId&& document.getElementById(this.props.modalBoxId);
                if (!p) {
                    var p = document.createElement('div');
                        p.setAttribute("class","overflow_layer");
                        p.style.display="none";
                    this.props.modalBoxId&&(p.id = this.props.modalBoxId);
                    document.body.appendChild(p);
                }
                this.DialogElement= p;
            },
            componentWillUnmount() {
                document.body.removeChild(this.DialogElement);
            },
            createDialog(){
                this.DialogElement.style.display="block";
                var self=this;
                ReactDOM.render(React.createElement(Dialog, {
                                    show: true, title: "创建组", 

                                    onClose: function(){
                                        self.DialogElement.style.display="none";
                                    }, 

                                    onOk: function(jsonData,callback){
                                        Page.Storage.addGroup(jsonData,function(result){
                                            callback(result);
                                            if(!result.err){
                                                self.DialogElement.style.display="none";
                                                self.props.onNewGroup(result.group);
                                            }
                                        });
                                    }
                                }),this.DialogElement);
            },
            render(){
                var self=this;
                return  React.createElement("div", {className: "toolBar"}, 
                            React.createElement("div", {className: "btn", onClick: this.createDialog}, "新建组")
                        )
            }
        });

        return toolBar;

    })();

    var Groups=(function(){
        var list=React.createClass({displayName: "list",
            getInitialState(){
                var tempGroup=this.props.selectedGroup;
                return {
                   selectedGroup:tempGroup,
                    groups:this.props.groups
                }
            },
            componentWillReceiveProps(newProps){
                this.setState({
                    selectedGroup:newProps.selectedGroup
                });
            },
            componentDidMount() {
                this.props.onSelected(this.state.selectedGroup);
            },
            render(){
                var self=this;
                var li=[];
                for(var i in this.state.groups){
                    var className="group";
                    var tempGroup=this.props.groups[i];
                    if(self.state.selectedGroup.name==tempGroup.name){className+=" selected"}
                    li.push(React.createElement("li", {
                        className: className, 
                        onClick: (function(){
                            var d=i;
                            return function(){
                                var tempGroup=self.props.groups[d];
                                self.props.onSelected(tempGroup);
                                self.setState({
                                    selectedGroup:tempGroup
                                });
                            }
                        })(), 
                        key: i}, 
                            React.createElement("input", {type: "checkbox", checked: tempGroup.checked, 
                                onClick: function(e){
                                    //e.preventDefault();
                                    //e.stopPropagation()
                                }, 
                                onChange: (function(){
                                    var _tempGroup=tempGroup;
                                    return function(){
                                        self.props.onSetChecked({
                                            group:_tempGroup,
                                            checked:!_tempGroup.checked
                                        });
                                    }
                                })()}), 
                            React.createElement("label", null, " ", tempGroup.name, " "), 
                            React.createElement("i", {className: "fa fa-times icon removeIcon", 
                                onClick: (function(){
                                   var g=tempGroup;
                                    return function(e){
                                        e.stopPropagation();
                                        if(confirm("确认要删除"+g.name+"分组?")){
                                            Page.Storage.removeGroup(g.name);
                                        }
                                    }
                                })()
                            })
                    ))
                }
                return  React.createElement("div", {className: "scrollBox"}, 
                            React.createElement("ul", {className: "groups"}, 
                                li
                            )
                        )
            }
        });

        return list;

    })();


    var LinkDialog=React.createClass({displayName: "LinkDialog",
        getInitialState(){
            return{
                show:true,
                errMsg:"",
                showAdvance:false,
                name:this.props.data?this.props.data.name:null,
                origin:this.props.data?this.props.data.origin:null,
                target:this.props.data?this.props.data.target:null,
                type:this.props.data?this.props.data.type:false,    //false: normal 只对比host+path true:force 将按照字符串匹配
                domainLimit:this.props.data?this.props.data.domainLimit:null 
            }
        },
        close(){
            this.props.onClose();
            this.state.show=false;
            this.setState(this.state);
        },
        ok(){
            var self=this;
            if( !self.state.name|| !self.state.origin||!self.state.target){
                self.setState({
                    errMsg:"不能为空"
                });
                return;
            }
            if(""==this.state.inputName){return}
            this.props.onOk({
                link:{
                    name:self.state.name,
                    origin:self.state.origin,
                    target:self.state.target,
                    type:self.state.type,
                    domainLimit:self.state.domainLimit
                }
            },function(result){
                if(result.err){
                    self.setState({
                        errMsg:result.errMsg
                    });
                }else{
                    self.setState({
                        errMsg:""
                    });
                }
            });
        },
        componentWillReceiveProps(newProps){
            this.setState({
                show:newProps.show,
                name:newProps.data?newProps.data.name:null,
                origin:newProps.data?newProps.data.origin:null,
                target:newProps.data?newProps.data.target:null,
                type:newProps.data?newProps.data.type:false, //false: normal 只对比host+path true:force 将按照字符串匹配
                domainLimit:newProps.data?newProps.data.domainLimit:null 
            });
        },
        render(){
            var self=this;
            if(!this.state.show){
                return null;
            }
            var errMsg=null;
            if(this.state.errMsg!=""){
                errMsg=React.createElement("p", {className: "errMsg"}, this.state.errMsg);
            }

            var name=this.state.name;
            var origin=this.state.origin;
            var target=this.state.target;

            return  React.createElement("div", {className: "dialog createLink"}, 
                React.createElement("div", {className: "statusBar"}, 
                    React.createElement("label", {className: "title"}, this.props.title), 
                    React.createElement("div", {className: "closeBtn", onClick: this.close}, "×")
                ), 
                React.createElement("div", {className: "container"}, 
                    React.createElement("p", null, 
                        React.createElement("label", null, "名称 :"), 
                        React.createElement("input", {type: "text", className: "name", value: name, onChange: function(event){
                                event.preventDefault();
                                self.setState({
                                    name:event.target.value
                                });
                            }})
                    ), 
                    React.createElement("p", null, 
                        React.createElement("label", null, "原生 :"), 
                        React.createElement("input", {type: "text", value: origin, onChange: function(event){
                                event.preventDefault();
                                        self.setState({
                                            origin:event.target.value
                                        });
                                    }})
                    ), 
                    React.createElement("p", null, 
                        React.createElement("label", null, "代理 :"), 
                        React.createElement("input", {type: "text", value: target, onChange: function(event){
                                event.preventDefault();
                                        self.setState({
                                            target:event.target.value
                                        });
                            }})
                    ), 
                    errMsg, 
                  React.createElement("div", {className: "advancedArea"}, 
                    React.createElement("div", {className: "advancedBtn", onClick: function(){

                        self.setState({
                          showAdvance:!self.state.showAdvance
                        });

                    }}, "高级设置"), 
                    React.createElement("div", {className: this.state.showAdvance?"dropList":"dropList hide"}, 
                      React.createElement("div", {className: "advancedItem"}, 
                        React.createElement("input", {type: "checkbox", 
                            checked: this.state.type, 
                            onChange: function(){
                                const type=self.state.type;
                                self.setState({
                                    type:!type
                                });
                            }}), 
                        React.createElement("label", null, " 强制匹配 "), 
                        React.createElement("p", {className: "info"}, " 选中后将把原生链接作为字符串匹配,任何一个字符都会影响匹配结果")
                      ), 
                      React.createElement("div", {className: "advancedItem"}, 
                        React.createElement("label", null, " 匹配域名 "), 
                        React.createElement("input", {
                            style: {width:680}, 
                            type: "text", 
                            value: this.state.domainLimit, 
                            onChange: function(event){
                                event.preventDefault();
                                self.setState({
                                    domainLimit:event.target.value
                                });
                            }}), 
                        React.createElement("p", {className: "info"}, " 本规则会在此域名下生效，如果保持空值会在所有域名下生效.")
                      )
                    )
                  )
                ), 
                React.createElement("div", {className: "btnBar"}, 
                    React.createElement("div", {className: "btn", onClick: this.close}, "取消"), 
                    React.createElement("div", {className: "btn ok", onClick: this.ok}, "确定")
                )
            )
        }
    });
    var ListToolBar=(function(){

        var toolBar=React.createClass({displayName: "toolBar",
            getInitialState(){
                return{
                    group:this.props.group
                }
            },
            componentWillReceiveProps(newProps){
                this.setState({
                    group:newProps.group
                });
            },
            componentDidMount() {
                var p = this.props.modalBoxId&& document.getElementById(this.props.modalBoxId);
                if (!p) {
                    var p = document.createElement('div');
                    p.setAttribute("class","overflow_layer");
                    p.style.display="none";
                    this.props.modalBoxId&&(p.id = this.props.modalBoxId);
                    document.body.appendChild(p);
                }
                this.DialogElement= p;
            },
            createDialog(){
                var self=this;
                this.DialogElement.style.display="block";
                ReactDOM.render(React.createElement(LinkDialog, {
                                    show: true, 
                                    title: this.state.group.name, 

                                    onClose: function(){
                                                        self.DialogElement.style.display="none";
                                                    }, 

                                    onOk: function(jsonData,callback){
                                        jsonData.group=self.state.group.name;
                                        Page.Storage.addLink(jsonData,function(result){
                                            callback(result);
                                            if(!result.err){
                                                self.DialogElement.style.display="none";
                                            }
                                        });
                                    }
                }),this.DialogElement);
            },
            render(){
                var self=this;
                return  React.createElement("div", {className: "toolBar"}, 
                    React.createElement("div", {className: "btn", onClick: this.createDialog}, "创建映射")
                )
            }
        });
        return toolBar;
    })();

    var Links=(function(){

        var links=React.createClass({displayName: "links",
            componentDidMount() {
                var p = this.props.modalBoxId&& document.getElementById(this.props.modalBoxId);
                if (!p) {
                    var p = document.createElement('div');
                    p.setAttribute("class","overflow_layer");
                    p.style.display="none";
                    this.props.modalBoxId&&(p.id = this.props.modalBoxId);
                    document.body.appendChild(p);
                }
                this.DialogElement= p;
            },
            createDialog(item){
                var self=this;
                this.DialogElement.style.display="block";
                ReactDOM.render(React.createElement(LinkDialog, {
                                    show: true, 
                                    title: "编辑 : "+item.name, 
                                    data: item, 
                                    onClose: function(){
                                        self.DialogElement.style.display="none";
                                    }, 

                                    onOk: function(jsonData,callback){
                                        Page.Storage.updateLinkData({
                                            group:self.props.group,
                                            link:item,
                                            data:{
                                                origin:jsonData.link.origin,
                                                target:jsonData.link.target,
                                                name:jsonData.link.name,
                                                type:jsonData.link.type,
                                                domainLimit:jsonData.link.domainLimit
                                            }
                                        },function(res){
                                            if(res.err){
                                                alert(res.errMsg);
                                            }else{
                                                self.DialogElement.style.display="none";
                                            }
                                        });
                                    }
                }),this.DialogElement);
            },
            render(){
                var self=this;
                var ary=this.props.group.links;
                if(!ary){return null;}
                var li=ary.map(function(item,index){
                    return  React.createElement("li", {key: index, className: "linkItem"}, 
                                React.createElement("div", {className: "name"}, 
                                    React.createElement("input", {type: "checkbox", 
                                        checked: item.checked, 
                                        onChange: function(){
                                            Page.Storage.updateLinkData({
                                                group:self.props.group,
                                                link:item,
                                                data:{
                                                    checked:!!!item.checked
                                                }
                                            },function(){});
                                        }}), 
                                    React.createElement("label", null, "名称 :"), item.name, 
                                    React.createElement("i", {className: "fa fa-pencil-square-o icon editIcon", 
                                       onClick: (function(){
                                        return function(){
                                            self.createDialog(item);
                                        }
                                    })()}), 
                                    React.createElement("i", {className: "fa fa-times icon removeIcon", 
                                       onClick: (function(){
                                        return function(){
                                            if(confirm("确认要删除"+item.name+"映射?")){
                                                Page.Storage.removeLink(self.props.group,item);
                                            }
                                        }
                                    })()})
                                ), 
                                React.createElement("div", {className: "origin"}, 
                                    React.createElement("p", null, 
                                        React.createElement("label", null, "原生 :"), 
                                        item.origin
                                    )
                                ), 
                                React.createElement("div", {className: "target"}, 
                                    React.createElement("p", null, 
                                        React.createElement("label", null, "目标 :"), 
                                        item.target
                                    )
                                )
                            )
                });
                return   React.createElement("ul", null, 
                            li
                         );
            }
        });

        return links;
    })();


    var App=React.createClass({displayName: "App",
        getInitialState(){
            var self=this;
            var groups=Page.Storage.getData().groups;

            Page.Storage.onChange(function(jsonData){
                self.setState({
                    groups:jsonData.groups
                });
            });

            var tempGroup="";
            for(var i in groups){
                tempGroup=groups[i];
                break;
            }
            return {
                groups:groups,
                selectedGroup:tempGroup
            }
        },
        render(){
            var self=this;
            return  React.createElement("div", {className: "pageContent"}, 
                        React.createElement("div", {className: "catalog"}, 
                            React.createElement("div", {className: "list"}, 
                                React.createElement(GroupsToolBar, {onNewGroup: function(group){
                                    self.setState({
                                        selectedGroup:group
                                    });
                                }
                                }), 
                                React.createElement(Groups, {
                                    groups: this.state.groups, 
                                    selectedGroup: self.state.selectedGroup, 
                                    onSelected: function(group){
                                        self.setState({
                                            selectedGroup:group
                                        });
                                    }, 
                                    onSetChecked: function(json){
                                        Page.Storage.setGroupChecked({
                                            group:json.group,
                                            checked:json.checked
                                        },function(){

                                        });
                                    }
                                })
                            )
                        ), 
                        React.createElement("div", {className: "list"}, 
                            React.createElement(ListToolBar, {group: this.state.selectedGroup}), 
                            React.createElement("div", {className: "scrollBox bg"}, 
                                React.createElement(Links, {group: this.state.selectedGroup})
                            )
                        )
                    )
        }
    });

    return {
        init:function(){
            var parentDOM=document.getElementById("page");

            ReactDOM.render(React.createElement(App, null),parentDOM);
        }
    }
})();



