$(document).ready(function(){

    $View.init(document.getElementById("groupArea"));
    document.getElementById("setting").addEventListener("click",function(){
        chrome.tabs.create({'url': chrome.extension.getURL('setting.html')}, function(tab) {
            // Tab opened.
        });
    });
});