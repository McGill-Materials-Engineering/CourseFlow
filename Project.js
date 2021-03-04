//Class for main project. Also controls most of what happens with regards to workflows, and as the top level object class includes a few logistical functions that didn't really fit as global.

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

class Project{
    constructor(container){
        this.xmlData;
        this.workflows={activity:[],course:[],program:[],outcome:[]};
        this.graph;
        this.activeLayout;
        this.terminologySet = "standard";
        this.outcomesview = false;
        this.container=container;
        this.sidenav = new WFToolbar(this,document.getElementById("sidenav"),"left","layoutnav");
        this.navigatorDivs = {};
        this.newWFDiv = document.getElementById("newWFDiv");
        this.nameDiv = this.sidenav.addBlock(LANGUAGE_TEXT.layoutnav.navigator[USER_LANGUAGE],null,null,'3');
        this.buttons=[];
        this.addButton(this.nameDiv,false);
        var p = this;
        this.idNum=0;
        this.backList = [];
        this.loadAppend=false;
        this.name = LANGUAGE_TEXT.menus.newproject[USER_LANGUAGE];
        this.readOnly=false;
        this.nodesMovable=false;
        this.floatbar = $("#floatbar")[0];
        
        $("#save").removeClass("disabled");
        $("#exporthtml").removeClass("disabled");
        $("#exportjson").removeClass("disabled");
        $("#import").removeClass("disabled");
        $("#importcsv").removeClass("disabled");
        $("#savereadonly").removeClass("disabled");
        $("#genhelp").removeClass("disabled");
        $("#layouthelp").removeClass("disabled");
        $("#terminology").removeClass("disabled");
        $("#terminologycegep").removeClass("disabled");
        $("#terminologyeng").removeClass("disabled");
        document.body.contextItem=p;
        $("#sidenav").get()[0].contextItem=p;
        $("#topnav").get()[0].contextItem=p;
        
        
        
        var nav = LANGUAGE_TEXT.confirm.navigate[USER_LANGUAGE]
        window.onbeforeunload = function() {
            if(p.readOnly)return null
            else return nav;
        }
        
        
        
        this.createNavigators();
        this.createFloatBar();
        this.createViewBar();
        
        
        
        
        
        var newfile = document.getElementById('new');
        newfile.onclick = function(){
            if(mxUtils.confirm(LANGUAGE_TEXT.confirm.newproject[USER_LANGUAGE])){
                p.clearProject();
                p.requestName(LANGUAGE_TEXT.menus.newproject[USER_LANGUAGE]);
            }
        }
        
        var save = document.getElementById('save');
        save.onclick = function(){
            try{
                p.saveProject();
                gaEvent('Save/Open','Save',p.name);
            }catch(err){
                alert(LANGUAGE_TEXT.errors.filesave[USER_LANGUAGE]);
                gaError("Save",err);
            }
        }
        
        var duplicateWF = document.getElementById('duplicatewf');
        duplicateWF.onclick = function(){
            if(p.readOnly)return;
            p.duplicateActiveWF();
        }
        
        var open = document.getElementById('open');
        var openProject = function(){
            var reader = new FileReader();
            reader.readAsText(p.fileLoader.files[0]);
            reader.onload = function(evt){
                var readData = evt.target.result;
                var path = p.fileLoader.value;
                var filename=null;
                if(!p.loadAppend){
                    filename="";
                    if(path.indexOf("\\")>=0)filename = path.substr(path.lastIndexOf("\\")+1);
                    else if(path.indexOf("\/")>=0)filename = path.substr(path.lastIndexOf("\\")+1);
                    if(filename.indexOf(".CFlow")>0)filename=filename.substr(0,filename.indexOf(".CFlow"));
                    else filename=null;
                }
                try{
                    p.fromXML(readData,p.loadAppend);
                    gaEvent('Save/Open','Open',p.name);
                    var splash = document.getElementById("splashpage");
                    var renamebarrier = document.getElementById("renamebarrier");
                    if(splash.style.display!="none"){
                        splash.style.opacity=0;
                        splash.firstElementChild.style.top="-100%";
                        setTimeout(function(){splash.style.display="none";},500)
                    }
                    if(renamebarrier.style.display!="none"){
                        renamebarrier.style.opacity=0;
                        renamebarrier.firstElementChild.style.top="-100%";
                        setTimeout(function(){renamebarrier.style.display="none";},500)
                    }
                    p.filename = filename;
                }catch(err){
                    alert(LANGUAGE_TEXT.errors.fileopen[USER_LANGUAGE]);
                    gaError("Open",err);
                }
                
                p.changeActive(p);
                console.log(p);
            }
        }
        
        this.fileLoader = document.createElement("input");
        this.fileLoader.type="file";
        this.fileLoader.accept=".xml,.CFlow";
        this.fileLoader.addEventListener('change',openProject);
        
        
        var openCSV = function(){
            var reader = new FileReader();
            reader.readAsText(p.csvLoader.files[0]);
            reader.onload = function(evt){
                var readData = evt.target.result;
                try{
                    p.loadCSV(readData);
                    gaEvent('Save/Open','ImportCSV',p.name);
                }catch(err){
                    alert(LANGUAGE_TEXT.errors.loadcsv[USER_LANGUAGE]);
                }
            }
        }
        
        this.csvLoader = document.createElement("input");
        this.csvLoader.type="file";
        this.csvLoader.accept=".csv";
        this.csvLoader.addEventListener('change',openCSV);
        
        open.onclick = function(){
            p.loadAppend=false;
            p.fileLoader.click();
        }
        
        
        
        var exportWF = document.getElementById('export');
        exportWF.onclick = function(){
            gaEvent('Save/Open','Export',p.name);
            p.exportCurrent();
        }
        
        var exportHTML = document.getElementById('exporthtml');
        exportHTML.onclick = function(){
            gaEvent('Save/Open','ExportHTML',p.name);
            p.showExportOptions(true);
        }
        
        var exportHTML = document.getElementById('exportjson');
        exportHTML.onclick = function(){
            gaEvent('Save/Open','ExportJSON',p.name);
            p.exportJSON();
        }
        var exportCSV = document.getElementById('exportcsv');
        exportCSV.onclick = function(){
            gaEvent('Save/Open','ExportCSV',p.name);
            p.exportCSV();
        }
        
        var importWF = document.getElementById('import');
        importWF.onclick = function(){
            if(p.readOnly)return;
            p.loadAppend=true;
            p.fileLoader.click();
            gaEvent('Save/Open','Import',p.name);
        }
        
        var importCSV = document.getElementById('importcsv');
        importCSV.onclick = function(){
            if(p.readOnly)return;
            p.csvLoader.click();
        }
        
        var saveReadOnly = document.getElementById('savereadonly');
        saveReadOnly.onclick = function(){
            gaEvent('Save/Open','Save Read Only',p.name);
            p.showExportOptions(false);
        }
        
        var printWF = document.getElementById("print");
        printWF.onclick = function(){
            p.printActive();
            gaEvent('Save/Open','Print',p.name);
        }
        
        var undoButton = document.getElementById("undo");
        undoButton.onclick = function(){
            if(p.activeLayout instanceof Workflow&&!p.readOnly){
                try{
                    p.activeLayout.undo();
                }catch(err){
                    alert(LANGUAGE_TEXT.errors.undo[USER_LANGUAGE]);
                    gaError('Undo',err);
                }
            }
        }
        
        var redoButton = document.getElementById("redo");
        redoButton.onclick = function(){
            if(p.activeLayout instanceof Workflow&&!p.readOnly){
                try{
                    p.activeLayout.redo();
                }catch(err){
                    alert(LANGUAGE_TEXT.errors.redo[USER_LANGUAGE]);
                    gaError('Undo',err);
                }
            }
        }
        
        
        var settingsButton = document.getElementById("settings");
        settingsButton.onclick = function(){
            if(!p.settingsDisplayed)p.showSettings();
        }
        
        var expand = document.getElementById("expand");
        var collapse = document.getElementById("collapse");
        expand.onclick = function(){makeLoad(function(){
            if(p.activeLayout!=null)p.activeLayout.expandAllNodes();
        })};
        collapse.onclick = function(){makeLoad(function(){
            if(p.activeLayout!=null)p.activeLayout.expandAllNodes(false);
        })};
        
        var showLegend = document.getElementById("showlegend");
        showLegend.onclick = function(){if(p.activeLayout instanceof Workflow&&p.activeLayout.view)p.activeLayout.view.showLegend();};
        
        var outcomeView = document.getElementById("outcomeview");
        outcomeView.onclick = function(){
            if(p.activeLayout instanceof Workflow){
                var wf = p.activeLayout;
                gaEvent('View','Outcomes Toggled',wf.getType(),wf.tagSets.length);
                wf.makeInactive();
                p.outcomesview=(!p.outcomesview);
                var ocvcheck = $('#outcomeviewbar .switch input')[0];
                if(ocvcheck && ocvcheck.checked!=p.outcomesview)ocvcheck.checked=p.outcomesview;
                wf.makeActive(p.container);
                
            }
        
        }
        
        var terminologyStandard = document.getElementById("terminologystandard");
        var terminologyCegep = document.getElementById("terminologycegep");
        var terminologyEng = document.getElementById("terminologyeng");
        terminologyStandard.onclick=function(){p.setTerminology("standard");}
        terminologyCegep.onclick=function(){p.setTerminology("cegep");}
        terminologyEng.onclick=function(){p.setTerminology("eng");}
        
        
        $("#english").get()[0].onclick = function(){
            p.setLanguage('en');
        };
        $("#french").get()[0].onclick = function(){
            p.setLanguage('fr');
        };
        
        
        var genHelp = document.getElementById("genhelp");
        genHelp.onclick = function(){p.showHelp("help.html");}
        var layoutHelp = document.getElementById("layouthelp");
        layoutHelp.onclick = function(){p.showHelp("layouthelp.html");}
        
        
        
        var helpDiv = document.getElementById("helpDiv");
        
        var dragHandle = document.createElement('div');
        $("#helpDiv").draggable({
            start: function(event, ui){
                ui.helper.append($("<div/>", {
                    id: "iframe-barrier",
                    css: {
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        "z-index": 10
                    }
                }));
            },stop: function(event, ui) {
                $("#iframe-barrier", ui.helper).remove();
            }
        });
        $("#helpDiv").resizable({
            start: function(event, ui){
                ui.element.append($("<div/>", {
                    id: "iframe-barrier",
                    css: {
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        "z-index": 10
                    }
                }));
            },stop: function(event, ui) {
                $("#iframe-barrier", ui.element).remove();
            }
        });
        
        var helpDivHide = document.getElementById("helpDivHide");
        helpDivHide.onclick = function(){document.getElementById("helpFrame").parentElement.classList.remove("active");}
        
        
        
        
        //Keyboard shortcuts
        document.addEventListener("keydown",function(evt){
            if(!evt.ctrlKey)return;
            switch(evt.key.toLowerCase()){
                case "z":
                    if(evt.shiftKey)redoButton.click();
                    else undoButton.click();
                    break;
                case "s":
                    evt.preventDefault();
                    save.click();
                    break;
                case "o":
                    open.click();
                    break;
                case "n":
                    evt.preventDefault();
                    newfile.click();
                    break;
                case "l":
                    evt.preventDefault();
                    showLegend.click();
                    break;
                case "q":
                    evt.preventDefault();
                    outcomeView.click();
                    break;
            }
            
        });
        
        document.addEventListener("click",function(evt){
            if(p.activeLayout instanceof Workflow&&!p.container.contains(evt.target)){
                var wf = p.activeLayout;
                if(wf.view==null||wf.view.graph==null)return;
                if(evt.target.classList.contains("detached"))return;
                if(!wf.view.editbar.container.parentElement.contains(evt.target))wf.view.graph.clearSelection();
            }
        });
        
        this.changeActive(this);
        
        
        
		
    }
    
    saveProject(options){
        this.toXML(options);
        var filename;
        if(this.filename)filename=this.filename;
        else filename = this.name.replace(/[&,\[\]<>:\*\\/?|"']/g,"");
        if(options&&options.readonly)filename+="_ReadOnly";
        filename+='.CFlow';
        this.saveXML(this.xmlData,filename);
    }
    
    saveXML(xml,filename){
        var file = new Blob([xml], {type: "data:text;charset=utf-8;"});
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var url = URL.createObjectURL(file);
            var a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.target="save as";
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }
    
    saveCSV(csv,filename){
        var file = new Blob([csv], {type: "data:text;charset=utf-8;"});
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var a = document.createElement("a"),
                    url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            a.target="save as";
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }
    saveJSON(json,filename){
        let replacer = (key, value) =>
            typeof value === 'undefined' ? null : value;
        var file = new Blob([JSON.stringify(json,replacer)], {type: "data:text;charset=utf-8;"});
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var a = document.createElement("a"),
                    url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            a.target="save as";
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                alert("To import your file, go to your home page on CourseFlow and replace '/home' with '/import' at the end of the url");
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }
    
    exportCurrent(){
        var serializer = new XMLSerializer();
        var wf = this.activeLayout;
        if(wf==null)return;
        var children=[];
        if(wf instanceof Workflow) children= this.getDependencies(wf);
        var exported=[];
        var xml = "";
        xml+=makeXML(wf.name.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]"),"prname",true);
        xml+=makeXML(this.idNum,"idnum");
        xml+=makeXML(this.terminologySet,"terminologyset");
        xml+=wf.toXML();
        for(var i=0;i<children.length;i++){
            if(exported.indexOf(children[i])>=0)continue;
            exported.push(children[i]);
            xml+=children[i].toXML();
        }
        xml = makeXML(xml,"project");
        var filename = wf.name.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]")+".CFlow";
        this.saveXML(xml,filename);
    }
    
    exportJSON(){
        var json = {
            project:[{id:int(this.idNum)+1,title:this.name,activities:this.workflows.activity.map((activity)=>activity.id),courses:this.workflows.course.map((course)=>course.id),programs:this.workflows.program.map((program)=>program.id),outcomes:this.workflows.outcome.map((outcome)=>outcome.id)}],
            outcome:[],
            activity:[],
            course:[],
            program:[],
            column:[],
            week:[],
            node:[],
            nodelink:[],
            outcomenode:[],
        };
        console.log(this);
        console.log(this.workflows);
        for(let prop in this.workflows){
            for(let i = 0;i<this.workflows[prop].length;i++){
                this.workflows[prop][i].toJSON(json);
            }
        }
        console.log(json);
        this.saveJSON(json,"export.json");
    }
    
    exportCSV(){
        var csv;
        var filename;
        if(this.activeLayout instanceof Tag){
            csv = this.activeLayout.toCSV();
            filename = "Exported_Outcome";
        }else if(this.activeLayout.view instanceof Outcomeview){
            csv = this.activeLayout.view.toCSV();
            filename = "Outcomes_Table"
        }
        if(csv)this.saveCSV(csv,filename+".csv");
        
    }
    
    exportHTML(options){
        this.toXML(options);
        var suffix = this.name.replace(/[^a-zA-Z0-9]/g,'');
        var xmlData = this.xmlData.replace(/\n/g,'').replace(/"/g,'\\"').replace(/link/g,'"+"link"+"');
        var str = '<iframe style="margin:0px;width:100%;height:1200px;border:0px;" src="https://wfm.saltise.ca/CourseFlow/courseplanner.html" id="actualpage'+suffix+'"></iframe>\n';
        str = str+ '<script>\n';
        str = str+ 'var xmlstr'+suffix+' = "';
        str = str+xmlData;
        str = str+'";\n';
        str = str+'var page'+suffix+' = document.getElementById("actualpage'+suffix+'");\n';
        str = str+'window.addEventListener("message", function(evt) {\n';
        str = str+'if (evt.data == "ready") {\n';
        str = str+'page'+suffix+'.contentWindow.postMessage(xmlstr'+suffix+', "*");\n';
        str = str+'}\n';
        str = str+'});\n';
        str = str+'</script>';
        this.createMessage(str);
    }
    
    showExportOptions(toHTML=false){
        var p = this;
        var div = document.createElement('div');
        div.className = 'messagediv';
        var head = document.createElement('h4');
        head.innerHTML = LANGUAGE_TEXT.project.selectoptions[USER_LANGUAGE]+":";
        div.appendChild(head);
        
        var readonly = this.createCheckboxOption("Read Only");
        div.appendChild(readonly.parentElement);
        var hidecomments = this.createCheckboxOption("Hide Comments");
        div.appendChild(hidecomments.parentElement);
        var nodesmovable = this.createCheckboxOption("Nodes Movable in Read-Only");
        div.appendChild(nodesmovable.parentElement);
        
        
        var button = document.createElement('button');
        div.appendChild(button);
        button.innerHTML = "OK";
        button.onclick=function(){
            var options = {readonly:readonly.checked,hidecomments:hidecomments.checked,nodesmovable:nodesmovable.checked}
            document.body.removeChild(div);
            if(toHTML)p.exportHTML(options);
            else p.saveProject(options);
        };
        document.body.appendChild(div);
    }
    
    createCheckboxOption(string,value){
        var div = document.createElement('div');
        var checkbox = document.createElement('input');
        checkbox.type="checkbox";
        checkbox.value=value;
        checkbox.style.display = "inline-block";
        var label = document.createElement('div');
        label.innerHTML = string;
        label.style.display = "inline-block";
        div.appendChild(checkbox);
        div.appendChild(label);
        return checkbox;
    }
    
    createMessage(str){
        var div = document.createElement('div');
        div.className = 'messagediv';
        var head = document.createElement('h4');
        head.innerHTML = LANGUAGE_TEXT.project.copypaste[USER_LANGUAGE]+":";
        div.appendChild(head);
        var textarea = document.createElement('textarea');
        var button = document.createElement('button');
        div.appendChild(textarea);
        div.appendChild(button);
        textarea.value=str;
        button.innerHTML = "OK";
        button.onclick=function(){document.body.removeChild(div)};
        document.body.appendChild(div);
        
    }
    
    showSettings(){
        if(this.activeLayout instanceof Workflow)this.activeLayout.showSettings();
    }
    
    getDependencies(wf){
        var array = [];
        for(var i=0;i<wf.children.length;i++){
            array.push(wf.children[i]);
            array = array.concat(this.getDependencies(wf.children[i]));
        }
        if(wf.tagSets.length>0){
            for(i=0;i<wf.tagSets.length;i++){
                var tag = wf.tagSets[i];
                while (tag.depth>0)tag=tag.parentTag;
                array.push(tag);
            }
        }else if(wf.xmlData!=null){
            if(getXMLVal(wf.xmlData,"tagsetARRAY")!=null){
                var tagset = getXMLVal(wf.xmlData,"tagsetARRAY");
                for(i=0;i<tagset;i++){
                    var tag = this.getTagByID(tagset[i]);
                    while (tag.depth>0)tag=tag.parentTag;
                    array.push(tag);
                }
            }
        }
        return array;
    }
    
    makeReadOnly(readOnly){
        var p = this;
        if(p.readOnly==readOnly)return;
        p.readOnly=readOnly;
        if(readOnly){
            document.body.classList.add("readonly");
            $('#import').addClass("disabled");
            $('#importcsv').addClass("disabled");
            $('#save').addClass("disabled");
        }else {
            document.body.classList.remove("readonly");
            $('#import').removeClass("disabled");
            $('#importcsv').removeClass("disabled");
            $('#save').removeClass("disabled");
        }
    }
    
    duplicateActiveWF(){
        if(!this.activeLayout instanceof Workflow)return;
        var wf = this.activeLayout;
        var xml = (new DOMParser()).parseFromString(this.assignNewIDsToXML(wf.toXML(),false),"text/xml");
        var wfcopy = this.addWorkflowFromXML(xml);
        wfcopy.setName(wf.name+" (Copy)");
        wfcopy.id = this.genID();
        wfcopy.children = wf.children;
        wfcopy.tagSets = wf.tagSets;
        for(var i=0;i<wfcopy.children.length;i++){
            wfcopy.children[i].addButton(wfcopy.buttons[0].childdiv);
        }
        if(!this.sidenav.toggled){this.sidenav.toggleShow(0);this.sidenav.show(0);}
        
        
    }
    
    printActive(){
        if(window.navigator.userAgent.match("Chrome"))alert(LANGUAGE_TEXT.errors.printchrome[USER_LANGUAGE]);
        if(this.activeLayout!=null)this.activeLayout.requestPrint();
        
        
    }
    
    setName(name){
        name = name.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
        this.name=name;
        for(var i=0;i<this.buttons.length;i++)this.buttons[i].updateButton();
        if(this.view)this.view.nameUpdated();
    }
    
    
    
    toXML(options){
        var xml = "";
        var serializer = new XMLSerializer();
        xml+=makeXML(this.name,"prname",true);
        xml+=makeXML(this.idNum,"idnum");
        xml+=makeXML(this.terminologySet,"terminologyset");
        if(options){
            if(options.readonly)xml+=makeXML("true","readonly");
            if(options.nodesmovable)xml+=makeXML("true","nodesmovable");
        }
        for(var prop in this.workflows){
            for(var i=0;i<this.workflows[prop].length;i++){
                xml+=this.workflows[prop][i].toXML();
            }
        }
        if(options&&options.hidecomments){
            xml = xml.replace(/<comment>/g,'<hiddencomment>').replace(/<\/comment>/g,'</hiddencomment>');
        }
        this.xmlData = makeXML(xml,"project");
    }
    
    clearProject(){
        if(this.activeLayout!=null){this.activeLayout.makeInactive();this.activeLayout=null;}
        for(var prop in this.navigatorDivs)while(this.navigatorDivs[prop].childElementCount>0)this.navigatorDivs[prop].removeChild(this.navigatorDivs[prop].firstElementChild);
        this.workflows={activity:[],course:[],program:[],outcome:[]};
        this.name="New Project";
        this.terminologySet= "standard";
        $("#terminologycegep").removeClass("disabled");
        $("#terminologystandard").addClass("disabled");
        $("#terminologyeng").removeClass("disabled");
        for(var i=0;i<this.buttons.length;i++)this.buttons[i].updateButton();
        this.idNum="0";
        if(this.readOnly)this.makeReadOnly(false);
        this.nodesMovable=false;
        this.changeActive(this);
    }
    
    //Import a project from xml. isAppend will create new workflows, otherwise we clear the project first.
    fromXML(xmlData,isAppend){
        var parser = new DOMParser();
        if(isAppend)xmlData = this.assignNewIDsToXML(xmlData);
        var xmlDoc = parser.parseFromString(purgeInvalidCharacters(xmlData),"text/xml");
        if(!isAppend){
            this.clearProject();
            this.setName(getXMLVal(xmlDoc,"prname",true));
            this.idNum = int(getXMLVal(xmlDoc,"idnum"));
            var terminology = getXMLVal(xmlDoc,"terminologyset");
            if(terminology)this.setTerminology(terminology);
            var readOnly = getXMLVal(xmlDoc,"readonly");
            if(readOnly)this.makeReadOnly(true);
            else this.makeReadOnly(false);
            var nodesMovable = getXMLVal(xmlDoc,"nodesmovable");
            if(nodesMovable)this.nodesMovable=true;
            else this.nodesMovable=false;
        }
        var addedWF = [];
        var xmltags = [];
        for(var i=0;i<xmlDoc.childNodes[0].childNodes.length;i++){
            if(xmlDoc.childNodes[0].childNodes[i].tagName=="tag")xmltags.push(xmlDoc.childNodes[0].childNodes[i]);
        }
        for(i=0;i<xmltags.length;i++){
            this.addWorkflowFromXML(xmltags[i]);
        }
        var xmlwfs = xmlDoc.getElementsByTagName("workflow");
        for(i=0;i<xmlwfs.length;i++){
            addedWF.push(this.addWorkflowFromXML(xmlwfs[i]));
        }
        for(i=0;i<addedWF.length;i++){
            var wf =addedWF[i];
            for(var j=0;j<wf.usedWF.length;j++){
                wf.addChild(this.getWFByID(wf.usedWF[j]),false);
            }
            if(wf.tagsetArray!=null)for(j=0;j<wf.tagsetArray.length;j++){
                wf.addTagSet(this.getTagByID(wf.tagsetArray[j]));
            }
        }
        this.xmlData = xmlData;
    }
    
    genID(){
        this.idNum=""+(int(this.idNum)+1);
        return ""+this.idNum;
    }
    
    addWorkflow(type){
        var wf;
        if(type=="activity")wf = new Activityflow(this.container,this);
        else if(type=="program")wf = new Programflow(this.container,this);
        else if(type=="course")wf = new Courseflow(this.container,this);
        else if(type=="outcome")wf = new Tag(this);
        else return;
        gaEvent('Workflow',"created",type);
        wf.addButton(this.navigatorDivs[type]);
        if(this.view)this.view.workflowAdded(wf);
        this.workflows[type].push(wf);
        return wf;
    }
    
    
    addWorkflowFromXML(xml){
        var type = getXMLVal(xml,"wftype");
        if(type==null)type="outcome";
        var wf = this.addWorkflow(type);
        wf.fromXML(xml);
        return wf;
    }
    
    
    moveLayout(layout1,layout2,isAfter){
        var array = this.workflows[layout1.getType()];
        array.splice(array.indexOf(layout1),1);
        array.splice(array.indexOf(layout2)+isAfter,0,layout1);
    }
    
    
    getNumberOfDescendants(wfp,des){
        var children = wfp.getChildren();
        for(var i=0;i<children.length;i++){
            var wfc = children[i];
            if(des[wfc.getType()]==null)des[wfc.getType()]=1;
            else des[wfc.getType()]=des[wfc.getType()]+1;
            des = this.getNumberOfDescendants(wfc,des);
            
        }
        return des;
    }
    
    
    //Causes the workflow to delete itself and all its contents
    deleteWF(wf){
        while(this.backList.indexOf(wf)>=0)this.backList.splice(this.backList.indexOf(wf),1);
        if(wf instanceof Workflow)for(var i=wf.children.length-1;i>=0;i--){
            wf.removeChild(wf.children[i]);
        }
        //Seek out all wf that use this one, remove it from children and from any nodes that use it
        for(var prop in this.workflows){
            for(i=0;i<this.workflows[prop].length;i++){
                var wfp = this.workflows[prop][i];
                if(wfp instanceof Workflow){
                    if(wf instanceof Workflow)wfp.purgeUsedWF(wf);
                    else if(wf instanceof Tag)wfp.deleteTagSet(wf);
                }
            }
        }
        while(wf.buttons.length>0){
            wf.removeButton(wf.buttons[0]);
        }
        if(this.activeLayout==wf){this.changeActive(this,true);}
        else if(this.activeLayout==this)this.view.workflowRemoved(wf);
        this.workflows[wf.getType()].splice(this.workflows[wf.getType()].indexOf(wf),1);
        
        if(wf instanceof Tag && this.activeLayout instanceof Workflow&&this.activeLayout.view&&this.activeLayout.view.tagSelect!=null){
            this.activeLayout.view.populateTagBar();
            this.activeLayout.view.populateTagSelect(this.workflows["outcome"],this.activeLayout.getTagDepth());
        }
    }
    
    
    getWFByID(id){
        for(var prop in this.workflows){
            for(var i=0;i<this.workflows[prop].length;i++){
                if(this.workflows[prop][i].id==id)return this.workflows[prop][i];
            }
        }
        return null;
    }
    
    
    getTagByID(id){
        for(var i=0;i<this.workflows["outcome"].length;i++){
            var tag = this.workflows["outcome"][i].getTagByID(id);
            if(tag!=null)return tag;
        }
        return null;
    }
    
    changeActive(layout,back=false){
        var p = this;
        makeLoad(function(){
            if(layout==p)$("#returndiv").css("display","none");
            else $("#returndiv").css("display","inline-block");
            if(p.activeLayout!=null)p.activeLayout.makeInactive();
            if(p.activeLayout&&!back){
                p.backList.push(p.activeLayout);if(p.backList.length>20)p.backList.shift();
                $("#gobackdiv").css("display","inline-block");
            }
            p.activeLayout = layout;
            if(layout instanceof Workflow)layout.makeActive(p.container);
            else if (layout instanceof Tag)layout.makeActive(new Tagbuilder(p.container,layout));
            else if (layout instanceof Project)layout.makeActive(p.container);
            p.cleanBackList();
        });
    }
    
    goBack(){
        if(this.backList.length>0)this.changeActive(this.backList.pop(),true);
        if(this.backList.length==0)$("#gobackdiv").css("display","none");
    }
    
    cleanBackList(){
        for(var i=1;i<this.backList.length;i++){
            if(this.backList[i]==this.backList[i-1]){
                this.backList.splice(i,1);
                i--;
            }
        }
        if(this.backList[this.backList.length-1]==this.activeLayout)this.backList.pop();
        if(this.backList.length==0)$("#gobackdiv").css("display","none");
    }
    
    makeActive(container){
        for(var i=0;i<this.buttons.length;i++)this.buttons[i].makeActive();
        this.view = new ProjectOverview(container,this);
        this.view.makeActive();
    }
        
    makeInactive(){
        for(var i=0;i<this.buttons.length;i++)this.buttons[i].makeInactive();
        this.view.makeInactive();
        this.view = null;
    }
    
    createNavigators(){
        for(var prop in this.workflows){
            this.createNavigator(prop);
        }
    }
    
    createNavigator(type){
        var p = this;
        var createNew = document.createElement('div');
        createNew.innerHTML = "+"+LANGUAGE_TEXT.layoutnav.createnew[USER_LANGUAGE];
        createNew.className = "createlayoutdiv";
        createNew.onclick = function(){p.addWorkflow(type);}
        this.navigatorDivs[type] = this.sidenav.addBlock(LANGUAGE_TEXT.workflow.plurals[type][USER_LANGUAGE],createNew);
        
        
    }
    
    addButton(container,recurse=true){
        var button = new Layoutbutton(this,container);
        button.makeEditable(true,false,false);
        this.buttons.push(button);
        if(recurse)for(var i=0;i<this.children.length;i++){
            this.children[i].addButton(button.childdiv);
        }
        return button;
    }
    
    getButtonClass(){
        return "layoutactivity";
    }
    
    getIcon(){
        return null;
    }
    
    clickButton(){
        this.changeActive(this);
    }
    
    createFloatBar(){
        var p = this;
        var floatbar = this.floatbar;
        floatbar.appendChild(this.createFloatBarButton(LANGUAGE_TEXT.layoutnav.goback[USER_LANGUAGE],"returnimg","gobackdiv"));
        $("#gobackdiv")[0].onclick = function(){p.goBack();}
        floatbar.appendChild(this.createFloatBarButton(LANGUAGE_TEXT.layoutnav.returntooverview[USER_LANGUAGE],"goback","returndiv"));
        $("#returndiv")[0].onclick = function(){p.changeActive(p)};
        
       
        /*
        */
        
    }
    
    createFloatBarButton(text,imgname,id){
        var div = document.createElement('div');
        var img = document.createElement("img");
        var textdiv = document.createElement('div');
        div.id = id;
        div.classList.add("floatbardiv")
        div.appendChild(img);
        div.appendChild(textdiv);
        textdiv.id = id+"text";
        img.src=iconpath+imgname+".svg";
        textdiv.innerHTML = text;
        return div;
    }

    createViewBar(){
        var p = this;
        var vb = $("#viewbar")[0];
        vb.appendChild(this.createViewBarButton("","validate","validateviewbar"));
        $("#validateviewbar").attr("title",LANGUAGE_TEXT.menus.validate[USER_LANGUAGE]);
        $("#validateviewbar")[0].onclick = function(){
            if(p.activeLayout instanceof Workflow)p.activeLayout.validate(true);
        }
        vb.appendChild(this.createOutcomeSwitch(LANGUAGE_TEXT.menus.toggleoutcomeswitch[USER_LANGUAGE],"outcomeviewbar"));
        vb.appendChild(this.createViewBarButton("","expand","expandviewbar"));
        $("#expandviewbar")[0].onclick = function(){$("#expand")[0].click();}
        $("#expandviewbar").attr("title",LANGUAGE_TEXT.menus.expand[USER_LANGUAGE]);
        vb.appendChild(this.createViewBarButton("","collapse","collapseviewbar"));
        $("#collapseviewbar")[0].onclick = function(){$("#collapse")[0].click();}
        $("#collapseviewbar").attr("title",LANGUAGE_TEXT.menus.collapse[USER_LANGUAGE]);
        vb.appendChild(this.createViewBarButton("","settings","settingsviewbar"));
        $("#settingsviewbar")[0].onclick = function(){$("#settings")[0].click();}
        $("#settingsviewbar").attr("title",LANGUAGE_TEXT.menus.settings[USER_LANGUAGE]);
        
    }
    
    createViewBarButton(text,imgname,id){
        var div = document.createElement('div');
        var img = document.createElement("img");
        var textdiv = document.createElement('div');
        div.id = id;
        div.classList.add("topdropwrapper")
        div.appendChild(img);
        div.appendChild(textdiv);
        img.src=iconpath+imgname+".svg";
        textdiv.innerHTML = text;
        div.classList.add("disabled");
        return div;
    }
    
    createOutcomeSwitch(text,id){
        var div = document.createElement('div');
        var label = document.createElement('label');
        var input = document.createElement('input');
        var slider = document.createElement('span');
        var textdiv = document.createElement('div');
        textdiv.innerHTML = text;
        textdiv.className = "outcomeviewtext";
        input.onclick = function(){$("#outcomeview")[0].click();}
        label.appendChild(input);
        label.appendChild(slider);
        input.type="checkbox";
        slider.className="slider round";
        label.className="switch";
        div.id = id;
        div.appendChild(textdiv);
        div.appendChild(label);
        div.classList.add("disabled");
        return div;
    }
    
    
    showHelp(url){
        gaEvent('View','Help',url);
        var helpFrame = document.getElementById("helpFrame");
        helpFrame.src = "resources/helpdocs/"+url;
        helpFrame.parentElement.classList.add("active");
        
    }
    
    
    
    //Since this assigns a bunch of IDs without actually increasing idNum, it should only be called when an xml file is about to be imported into the project and IDs generated.
    assignNewIDsToXML(xml,doWorkflows=true){
        var xmlString = xml;//(new XMLSerializer()).serializeToString(xml);
        var id = int(this.idNum)+1;
        //Nodes
        while(xmlString.indexOf("<id>")>=0){
            var startIndex=xmlString.indexOf("<id>");
            var endIndex = xmlString.indexOf("</id>");
            var replaceId=xmlString.substring(startIndex+4,endIndex);
            xmlString=xmlString.substring(0,startIndex)+"<tempid>"+id+"</tempid>"+xmlString.substring(endIndex+5);
            //cycle through all the links. Linked IDs need to be updated, otherwise they'll link to random things.
            while(xmlString.indexOf("<topnode>"+replaceId+"</topnode>")>=0){xmlString = xmlString.replace("<topnode>"+replaceId+"</topnode>","<topnode>temporaryID"+id+"</topnode>");}
            while(xmlString.indexOf("<bottomnode>"+replaceId+"</bottomnode>")>=0){xmlString = xmlString.replace("<bottomnode>"+replaceId+"</bottomnode>","<bottomnode>temporaryID"+id+"</bottomnode>");}
            while(xmlString.indexOf("<targetid>"+replaceId+"</targetid>")>=0){xmlString = xmlString.replace("<targetid>"+replaceId+"</targetid>","<targetid>temporaryID"+id+"</targetid>");}
            xmlString = this.assignNewIDsToXMLArrays(xmlString,"fixedlinkARRAY",replaceId,""+id);
            id++;
        }
        //Weeks
        while(xmlString.indexOf("<weekid>")>=0){
            var startIndex=xmlString.indexOf("<weekid>");
            var endIndex = xmlString.indexOf("</weekid>");
            var replaceId=xmlString.substring(startIndex+8,endIndex);
            xmlString=xmlString.substring(0,startIndex)+"<weektempid>"+id+"</weektempid>"+xmlString.substring(endIndex+9);
            id++;
        }
        //Workflows
        if(doWorkflows)while(xmlString.indexOf("<wfid>")>=0){
            var startIndex=xmlString.indexOf("<wfid>");
            var endIndex = xmlString.indexOf("</wfid>");
            var replaceId=xmlString.substring(startIndex+6,endIndex);
            xmlString=xmlString.substring(0,startIndex)+"<wftempid>"+id+"</wftempid>"+xmlString.substring(endIndex+7);
            //cycle through all the links. Linked IDs need to be updated, otherwise they'll link to random things.
            xmlString = this.assignNewIDsToXMLArrays(xmlString,"usedwfARRAY",replaceId,""+id);
            xmlString = this.assignNewIDsToXMLArrays(xmlString,"linkedwf",replaceId,""+id);
            id++;
        }
        if(doWorkflows)while(xmlString.indexOf("<tagid>")>=0){
            var startIndex=xmlString.indexOf("<tagid>");
            var endIndex = xmlString.indexOf("</tagid>");
            var replaceId=xmlString.substring(startIndex+7,endIndex);
            xmlString=xmlString.substring(0,startIndex)+"<tagtempid>"+id+"</tagtempid>"+xmlString.substring(endIndex+8);
            //cycle through all the links. Linked IDs need to be updated, otherwise they'll link to random things.
            while(xmlString.indexOf("<nodetagid>"+replaceId+"</nodetagid>")>=0){xmlString = xmlString.replace("<nodetagid>"+replaceId+"</nodetagid>","<nodetagid>temporaryID"+id+"</nodetagid>");}
            while(xmlString.indexOf("<linktagid>"+replaceId+"</linktagid>")>=0){xmlString = xmlString.replace("<linktagid>"+replaceId+"</linktagid>","<linktagid>temporaryID"+id+"</linktagid>");}
            xmlString = this.assignNewIDsToXMLArrays(xmlString,"tagsetARRAY",replaceId,""+id);
            xmlString = this.assignNewIDsToXMLArrays(xmlString,"tagARRAY",replaceId,""+id);
            id++;
        }
        //replace all those temp id tage with real ones.
        while(xmlString.indexOf("tempid>")>=0)xmlString = xmlString.replace("tempid>","id>");
        while(xmlString.indexOf("temporaryID")>=0)xmlString = xmlString.replace("temporaryID","");
        //save the new id number
        this.idNum=id;
        //return as string
        return xmlString;
        
    }
    
    assignNewIDsToXMLArrays(xmlString,arrayName,oldID,newID){
        var currentIndex=0;
        while(xmlString.indexOf("<"+arrayName+">",currentIndex)>=0){
            currentIndex = xmlString.indexOf("<"+arrayName+">",currentIndex);
            var endIndex = xmlString.indexOf("</"+arrayName+">",currentIndex);
            var indexArray= xmlString.substring(currentIndex+("<"+arrayName+">").length,endIndex).split(",");
            while(indexArray.indexOf(oldID)>=0){indexArray.splice(indexArray.indexOf(oldID),1,newID+"temporaryID");}
            xmlString = xmlString.substring(0,currentIndex+("<"+arrayName+">").length) + indexArray.join(',') + xmlString.substring(endIndex);
            currentIndex=endIndex;
        }
        return xmlString;
    }
    
    requestName(text){
        var p = this;
        var renamebarrier = document.getElementById("renamebarrier");
        var renameproject = document.getElementById("renameproject");
        renamebarrier.firstElementChild.firstElementChild.innerHTML=text;
        renameproject.value=p.name;
        renamebarrier.style.display="inline";
        renameproject.focus();
        renamebarrier.style.opacity=1;
        renamebarrier.firstElementChild.style.top='calc(50% - 160px)';
        
        
        var rename = function(evt,cancel=false){
            if(evt==null||(evt.key&&evt.key.toLowerCase()=='enter')){
                if(renameproject.value!=""&&!cancel)p.setName(renameproject.value);
                document.removeEventListener("keydown",rename);
                renamebarrier.firstElementChild.style.top='-100%';
                renamebarrier.style.opacity=0;
                $("#splashpage").css('opacity',0);
                $("#splashpage").first().css('top',"-100%");
                setTimeout(function(){renamebarrier.style.display="none";$("#splashpage").css('display',"none")},200);
                
                
            }
        }
        
        document.addEventListener("keydown",rename);
        
        document.getElementById("acceptrename").onclick = function(){
            rename();
        }
        document.getElementById("cancelrename").onclick = function(){
            rename(null,true);
        }
        
    }
    
    setTerminology(term){
        if(term!=this.terminologySet){
            var oldterm = this.terminologySet;
            this.terminologySet = term;
            for(var i=0;i<this.workflows["outcome"].length;i++){
                this.workflows["outcome"][i].terminologyUpdated(oldterm);
            }
        }
        if(this.activeLayout instanceof Workflow){
            var wf = this.activeLayout;
            if(wf.view&&wf.view.tagSelect)wf.view.populateTagSelect(this.workflows["outcome"],wf.getTagDepth());
        }
        if(term=="standard"){
            $("#terminologycegep").removeClass("disabled");
            $("#terminologystandard").addClass("disabled");
            $("#terminologyeng").removeClass("disabled");
        }else if(term=="cegep"){
            $("#terminologycegep").addClass("disabled");
            $("#terminologystandard").removeClass("disabled");
            $("#terminologyeng").removeClass("disabled");
        }else if(term=="eng"){
            $("#terminologycegep").removeClass("disabled");
            $("#terminologystandard").removeClass("disabled");
            $("#terminologyeng").addClass("disabled");
        }
    }
    
    setLanguage(lang){
        var p = this;
        makeLoad(function(){
            if(p.activeLayout!=null)p.activeLayout.makeInactive();
            USER_LANGUAGE=lang;
            p.nameDiv.headertext.innerHTML = LANGUAGE_TEXT.layoutnav.navigator[lang]+":";
            for(var prop in p.navigatorDivs){p.navigatorDivs[prop].headertext.innerHTML=LANGUAGE_TEXT.workflow.plurals[prop][lang];}
            $("#sidenav .createlayoutdiv").html("+"+LANGUAGE_TEXT.layoutnav.createnew[lang]);
            setMenuLanguage();
            if(p.activeLayout instanceof Workflow)p.activeLayout.makeActive(p.container);
            else if(p.activeLayout instanceof Tag)p.activeLayout.makeActive(new Tagbuilder(p.container,p.activeLayout));
            else p.activeLayout.makeActive(p.container);
        });
    }
    
    loadCSV(csv){
        var array = parseCSV(csv);
        var currentdepth=0;
        var tag = this.addWorkflow("outcome");
        tag.fromCSV(array,0,0);
    }
    
    populateMenu(menu){
        var p = this;
        menu.addItem(LANGUAGE_TEXT.layoutnav.projectreanmetitle[USER_LANGUAGE],'',function(){
            p.requestName(LANGUAGE_TEXT.layoutnav.projectreanmetitle[USER_LANGUAGE]);
        });
        menu.addItem(LANGUAGE_TEXT.menus.saveproject[USER_LANGUAGE],'',function(){
            $("#save").click();
        });
        menu.addItem(LANGUAGE_TEXT.menus.openproject[USER_LANGUAGE],'',function(){
            $("#open").click();
        });
        menu.addItem(LANGUAGE_TEXT.workflowview.whatsthis[USER_LANGUAGE],iconpath+'info.svg',function(){
            p.showHelp('help.html');
        });
        
    }
}
