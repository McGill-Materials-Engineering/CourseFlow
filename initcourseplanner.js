//Starts the program, and ensures the user cannot navigate away without confirmation.

/*    Copyright (C) 2019  SALTISE

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>*/

//Start of the program, invoked by onLoad()
function main(container)
{
    
    // Checks if the browser is supported
    if (!mxClient.isBrowserSupported())
    {
        // Displays an error message if the browser is not supported.
        mxUtils.error('Browser is not supported!', 200, false);
    }
    else
    {
        
        $(".topdropdiv").click(function(){this.style.display="none";var el=this;setTimeout(function(){el.style.display="";},100)});
        
        if(window.navigator.language.substr(0,2)=='fr')USER_LANGUAGE='fr';
        setMenuLanguage();
        $("#english").get()[0].onclick = function(){USER_LANGUAGE='en';setMenuLanguage();};
        $("#french").get()[0].onclick = function(){USER_LANGUAGE='fr';setMenuLanguage();};
        
        makeSplashpage(container);
        var toOpen = decodeURIComponent(requestQueryString("filename"));
        var filetype = decodeURIComponent(requestQueryString("filetype"));
        var fileurl = decodeURIComponent(requestQueryString("fileurl"));
        if(toOpen!=""||fileurl!=""){
            //try to open file based on url
            try{
                var filename;
                if(filetype=="ALA")filename = "https://jchoquette.github.io/ALA_Files/"+toOpen+".CFlow";
                else if(filetype=="post")filename = "resources/posted_files/"+toOpen+".CFlow";
                else if(fileurl!=null)filename = fileurl;
                var opened = loadServerXML(filename);
                if(opened==null)toOpen="";
                else{
                    var project = new Project(container);
                    project.fromXML(opened,false);
                    var splash = document.getElementById("splashpage");
                    var renamebarrier = document.getElementById("renamebarrier");
                    splash.style.display="none";
                    renamebarrier.style.display="none";
                    for(var prop in project.workflows){
                        if(project.workflows[prop].length>0){
                            project.changeActive(project.workflows[prop][0]);
                            break;
                        }
                    }
                }
            }catch(err){
                alert("Failed to open the file you linked in the URL. Opening a blank project instead.");
                toOpen="";
            }
        }
        
        //Create the popup menu
        document.addEventListener('contextmenu',function(evt){
            
            if(evt.shiftKey)return evt;
            evt.preventDefault();
            var target = evt.target;
            while(target.contextItem==null){
                target = target.parentElement;
                if(target==null)return;
            }
            var context = new CFContext(document.body,target.contextItem,evt.pageX,evt.pageY);
            context.populate();
            context.open();

        },false);
        
        
        
    }
} //End of main

function makeSplashpage(container){
    var splashpage = document.getElementById('splashpage');
    splashpage.style.display="inline";
    splashpage.firstElementChild.style.top='calc(50% - 160px)';
    var newfile = document.getElementById('splashnewfile');
    var openfile = document.getElementById('splashopenfile');
    var project;
    newfile.onclick = function(){
        if(project==null)project = new Project(container);
        project.requestName(LANGUAGE_TEXT.menus.newproject[USER_LANGUAGE]);
        setTimeout(function(){splashpage.style.opacity="0";splashpage.style.display="none";},500);
    }
    openfile.onclick = function(){
        if(project==null)project = new Project(container);
        document.getElementById('open').click();
    }
    $('#new')[0].onclick = function(){newfile.click();}
    $('#open')[0].onclick = function(){openfile.click();}
    
    //postmessage listening
    window.addEventListener("message",function(evt){
        console.log(evt);
        console.log("Message Received! Attempting to build project...");
        if(!(evt.data instanceof String) || evt.data.indexOf("<project>")>=0)return;
        var success=false;
        try{
            if(project==null)project = new Project(container);
            project.fromXML(evt.data);
            success=true;
        }catch(err){
            console.log("failed to build project from message");
        }
        if(success){
            console.log("successfully built project from message");
            setTimeout(function(){splashpage.style.opacity="0";splashpage.style.display="none";},500);
        }
    });
    if(window!=window.parent)window.parent.postMessage("ready","*");
    console.log("frame is ready");

}

function requestQueryString(name)
{
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if( results == null ) {
        return "";
    } else {
        return results[1];
    }
}

function loadServerXML(filepath){
    var result =null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET",filepath,false);
    xmlhttp.send();
    if(xmlhttp.status == 200){
        result = xmlhttp.responseText;
    }
    return result;
}






