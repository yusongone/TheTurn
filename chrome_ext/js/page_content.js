console.log("偷天换日正在为您代理...");
chrome.extension.onMessage.addListener(function(request, sender, response) {
    console.warn("** 偷天换日 ** 命中 '"+request.data.group.name+"' 中的 : "+request.data.info+"\n");
});


