window.$View=(function(){

    var Item=React.createClass({
        getInitialState:function(){
            return {
                name:this.props.link.name,
                proxyLink:this.props.link.proxyLink
            }
        },
        render(){
            var self=this;
            var link=self.props.link;
            return <li className={link.checked?"item checked":"item"}>
                                <span>
                                    <input
                                        type="checkbox" className="checkbox"
                                        onChange={function(){
                                            Page.Storage.updateLinkData({
                                                group:self.props.group,
                                                link:link,
                                                data:{
                                                    checked:!!!link.checked
                                                }
                                            },function(){

                                            });
                                        }}
                                        checked={link.checked}
                                    />
                                </span>
                <span className="itemName">{link.name}</span>
                {link.type?<div title="此规则按照字符串规则对比。" className="statusIcon force">强</div>:""}
                {link.domainLimit?<div title="此规则在固定域名下生效。" className="statusIcon domainLimit">域</div>:""}
                <span className="itemOriginLink">{link.origin}</span>
                <span className="itemProxyLink">{link.target}</span>
            </li>
        }
    });

    var GroupItem=React.createClass({
        getInitialState:function(){
            return {
                status:{
                    hideArea:true
                }
            }
        },
        componentWillReceiveProps(){
            console.log("fefe");
        },
        render(){
            var self=this;
            var checkedCount=0;
            var items=this.props.group.links.map(function(item,index){
                item.checked?checkedCount++:"";
                return <Item group={self.props.group} link={item} key={index}></Item>
            });
            var hide=this.state.status.hideArea?"hidden":"";
            var className="hideArea "+hide;
            return <li className="group">
                <div className="bar"
                     onClick={function(){
                        self.state.status.hideArea=!self.state.status.hideArea;
                        self.setState(self.state,function(){ });
                        return false;
                     }}
                >
                    <input type="checkbox" className="checkbox"
                        onClick={function(e){
                            e.stopPropagation()
                        }}

                        onChange={function(e,a,b){
                            Page.Storage.setGroupChecked({
                                group:self.props.group,
                                checked:!self.props.group.checked
                            },function(){

                            });
                        }}
                        checked={this.props.group.checked} />

                    {this.props.group.name}
                    <div className="drop">
                        {
                            self.state.status.hideArea?
                                <i className="fa fa-chevron-down"></i>
                            :
                                <i className="fa fa-chevron-up"></i>
                        }
                    </div>
                    <div className="checkedCount">{checkedCount+"/"+this.props.group.links.length}</div>
                </div>
                <div className={className}>
                    <ul>
                        {items}
                    </ul>
                </div>
            </li>
        }
    });

    var Group=React.createClass({
        getInitialState:function(){
            var self=this;
            var groups=Page.Storage.getData().groups;

            Page.Storage.onChange(function(jsonData){
                self.setState({
                    groups:jsonData.groups
                });
            });

            return {
                groups:groups
            }
        },
        getDefaultProps(){
        },
        componentWillReceiveProps(){

        },
        render(){
            var GroupItems=[];
            for(var i in this.state.groups){
                var item=this.state.groups[i];
                GroupItems.push(<GroupItem group={item} key={i}/>);
            }


            return  <ul className="groupList">
                        {GroupItems}
                    </ul>

        }
    });
    return {
        init:function(parentDOM){
            ReactDOM.render(<Group />,parentDOM);
        }
    }
})();