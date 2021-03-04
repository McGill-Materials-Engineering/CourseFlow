//The basic workflow class and extensions, which store each individual workflow (flowchart)

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


class Workflow{
    constructor(container,project){
        this.weeks=[];
        this.columns=[];
        this.brackets=[];
        this.comments=[];
        this.children=[];
        this.xmlData;
        this.project=project;
        this.buttons=[];
        this.name = this.getDefaultName();
        this.depth = this.getDepth();
        this.author;
        this.description;
        this.id = this.project.genID();
        this.tagSets=[];
        this.isActive=false;
        this.undoHistory=[];
        this.currentUndo;
        this.undoEnabled=false;
        this.view;
        this.legendCoords;
        this.outcomeSortType;
        this.isSimple = (this instanceof Activityflow);
        this.settings = new WorkflowSettings();
        this.errorlist=[];
    }
    
    getDefaultName(){return "Untitled Workflow";}
    getDepth(){return 99;}
    getBracketList(){return null;}
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.name,"wfname",true);
        xml+=makeXML(this.author,"wfauthor",true);
        xml+=makeXML(this.description,"wfdescription",true);
        xml+=makeXML(this.id,"wfid");
        xml+=this.typeToXML();
        for(var prop in this.settings.settingsKey){
            if(this.settings.settingsKey[prop].value)xml+=makeXML(this.settings.settingsKey[prop].value,prop);
        }
        
        var usedWF = [];
        for(var i=0;i<this.children.length;i++)usedWF.push(this.children[i].id);
        xml+=makeXML(usedWF.join(","),"usedwfARRAY");
        
        var tagSets = [];
        for(i=0;i<this.tagSets.length;i++){tagSets.push(this.tagSets[i].id);}
        xml+=makeXML(tagSets.join(","),"tagsetARRAY");
        if(this.isActive)this.saveXMLData();
        if(this.xmlData!=null)xml+=(new XMLSerializer()).serializeToString(this.xmlData);
        var xmlData = makeXML(xml,"workflow");
        return xmlData;
    }
    
    toJSON(json){
        if(!this.isActive)
        this.openXMLData();
        let outcomes_type=0;
        if(this.settings.settingsKey["advancedoutcomes"].value)outcomes_type=1;
        json[this.getType()].push({id:this.id,title:this.name,description:this.description,weeks:this.weeks.map((week)=>week.id),columns:this.columns.map((column)=>column.name),outcomes_type:outcomes_type})
        for(let i=0;i<this.columns.length;i++){
            this.columns[i].toJSON(json);
        }
        for(let i=0;i<this.weeks.length;i++){
            this.weeks[i].toJSON(json);
        }
        if(!this.isActive)this.makeInactive();
        
        
    }
    
    saveXMLData(){
        var xml="";
        if(this.view&&this.view.legend){
            this.legendCoords={x:this.view.legend.x,y:this.view.legend.y};
        }
        for(var i=0;i<this.columns.length;i++){
            xml+=this.columns[i].toXML();
        }
        for(i=0;i<this.weeks.length;i++){
            xml+=this.weeks[i].toXML();
        }
        for(i=0;i<this.comments.length;i++){
            xml+=this.comments[i].toXML();
        }
        for(i=0;i<this.brackets.length;i++){
            xml+=this.brackets[i].toXML();
        }
        if(this.legendCoords){xml+=makeXML(this.legendCoords.x,'wflegendx');xml+=makeXML(this.legendCoords.y,'wflegendy');}
        if(this.isSimple != (this instanceof Activityflow))xml+=makeXML("true","simpletoggled");
        if(this.outcomeSortType)xml+=makeXML(this.outcomeSortType,"wfoutcomesorttype");
        xml=makeXML(xml,"wfdata");
        this.xmlData = (new DOMParser).parseFromString(xml,"text/xml").childNodes[0];
    }
    
    openXMLData(){
        var xmlData = this.xmlData;
        var xmlcols = [];
        for(var i=0;i<xmlData.childNodes.length;i++){
            if(xmlData.childNodes[i].tagName=="column")xmlcols.push(xmlData.childNodes[i]);
        }
        for(var i=0;i<xmlcols.length;i++){
            var col = new Column(this);
            col.fromXML(xmlcols[i]);
            this.columns.push(col);
        }
        if(this.columns.length==0)this.createInitialColumns();
        
        var isSimple = getXMLVal(xmlData,"simpletoggled");
        if(isSimple!=null)this.isSimple = !(this instanceof Activityflow);
        var outcomeSortType = getXMLVal(xmlData,"wfoutcomesorttype");
        if(outcomeSortType)this.outcomeSortType=outcomeSortType;
        var xmlweeks = xmlData.getElementsByTagName("week");
        for(i=0;i<xmlweeks.length;i++){
            var week = this.createWeek();
            week.fromXML(xmlweeks[i]);
            this.weeks.push(week);
        }
        var xmlbrackets = xmlData.getElementsByTagName("bracket");
        for(i=0;i<xmlbrackets.length;i++){
            var br = new Bracket(this);
            br.fromXML(xmlbrackets[i]);
            this.brackets.push(br);
        }
        var xmlcomments = xmlData.getElementsByTagName("comment");
        for(var i=0;i<xmlcomments.length;i++){
            var com = new WFComment(this,0,0);
            com.fromXML(xmlcomments[i]);
            this.addComment(com);
        }
        for(var i=0;i<this.weeks.length;i++){
            for(var j=0;j<this.weeks[i].nodes.length;j++){
                this.weeks[i].nodes[j].makeAutoLinks();
            }
        }
        var legendx = int(getXMLVal(xmlData,'wflegendx'));
        var legendy = int(getXMLVal(xmlData,'wflegendy'));
        if(legendx&&legendy)this.legendCoords ={x:legendx,y:legendy};
        
        
    }
    
    
    
    fromXML(xmlData){
        this.setName(getXMLVal(xmlData,"wfname",true));
        this.setAuthor(getXMLVal(xmlData,"wfauthor",true));
        var description = getXMLVal(xmlData,"wfdescription",true);
        if(description)this.setDescription(description);
        for(var prop in this.settings.settingsKey){
            var settingType = this.settings.settingsKey[prop].type;
            var settingValue = getXMLVal(xmlData,prop);
            console.log(settingValue);
            if(settingValue&&settingType=="checkbox")this.settings.settingsKey[prop].value=true;
            else if(settingValue&&settingType=="number")this.settings.settingsKey[prop].value=int(settingValue);
        }
        
        this.id = getXMLVal(xmlData,"wfid");
        this.tagsetArray = getXMLVal(xmlData,"tagsetARRAY");
        this.usedWF = getXMLVal(xmlData,"usedwfARRAY");
        this.xmlData = xmlData.getElementsByTagName("wfdata")[0];
        if(this.xmlData==null){
            if(xmlData.getElementsByTagName("week").length==0)return;
            console.log("The savefile is an older version. Attempting to repair...");
            //This is an old savefile, and doesn't have a wfdata tag.
            this.xmlData = (new DOMParser()).parseFromString("<wfdata></wfdata>","text/xml");
            var weeks = xmlData.getElementsByTagName("week");
            var brackets = xmlData.getElementsByTagName("bracket");
            var comments = xmlData.getElementsByTagName("comment");
            for(var i=0;i<weeks.length;i++){this.xmlData.documentElement.appendChild(weeks[i].cloneNode(true));}
            for(i=0;i<brackets.length;i++){this.xmlData.documentElement.appendChild(brackets[i].cloneNode(true));}
            for(i=0;i<comments.length;i++){this.xmlData.documentElement.appendChild(comments[i].cloneNode(true));}
        }
        
    }
    
    addButton(container,recurse=true){
        var button = new Layoutbutton(this,container);
        button.makeEditable(true,true,false);
        button.makeMovable();
        button.makeExpandable();
        this.buttons.push(button);
        if(recurse)for(var i=0;i<this.children.length;i++){
            this.children[i].addButton(button.childdiv);
        }
        return button;
    }
    
    removeButton(button){
        if(this.children!=null)for(var i=0;i<this.children.length;i++){
            var wfc = this.children[i];
            for(var j=0;j<wfc.buttons.length;j++){
                if(wfc.buttons[j].container==button.childdiv){
                    wfc.removeButton(wfc.buttons[j]);
                    
                }
            }
        }
        this.buttons.splice(this.buttons.indexOf(button),1);
        button.removeSelf();
    }
    
    clickButton(){
        this.project.changeActive(this);
    }
    
    getType(){return "other";}
    getButtonClass(){return "layoutactivity";}
    getIcon(){return "";}
    
    addChild(child,recurse=true){
        if(child==null)return;
        this.children.push(child);
        //Add it to the parent at all locations in the tree
        for(var i=0;i<this.buttons.length;i++){
            child.addButton(this.buttons[i].childdiv,recurse);
        }
    }
    
    moveChild(layout1,layout2,isAfter){
        var array;
        if(layout1 instanceof Workflow)array = this.children;
        else array = this.tagSets;
        if(array.indexOf(layout1)<0||array.indexOf(layout2)<0)return;
        
        array.splice(array.indexOf(layout1),1);
        array.splice(array.indexOf(layout2)+isAfter,0,layout1);
    }
    
    
    removeChild(child){
        this.children.splice(this.children.indexOf(child),1);
        //remove the button from all instances of the parent, but only once (we might use the same activity twice in one course, for example)
        for(var i=0;i<this.buttons.length;i++){
            for(var j=0;j<child.buttons.length;j++){
                if(child.buttons[j].bdiv.parentElement == this.buttons[i].childdiv){
                    child.removeButton(child.buttons[j]);
                    break;
                }
            }
        }
        
        
        
    }
    
    getChildren(){
        return this.children;
    }
    
    getNumberOfDescendants(des){
        var children = this.children;
        for(var i=0;i<children.length;i++){
            var wfc = children[i];
            var type = LANGUAGE_TEXT.workflow[wfc.getType()][USER_LANGUAGE];
            if(des[type]==null)des[type]=1;
            else des[type]=des[type]+1;
            des = wfc.getNumberOfDescendants(des);
            
        }
        return des;
    }
    
    typeToXML(){return "";}
    
    
    
    findNodeById(id){
        for(var i=0;i<this.weeks.length;i++){
            for(var j=0;j<this.weeks[i].nodes.length;j++){
                if(this.weeks[i].nodes[j].id==id)return this.weeks[i].nodes[j];
            }
        }
        return null;
    }
    
    
    setName(name){
        name = this.setNameSilent(name);
        //if active, we have to change the name tag label to this
        if(this.view)this.view.nameUpdated();
                
    }
    
    //sets the name without changing the label
    setNameSilent(name){
        if(name!=null && name!=""){
            //name = name.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
            this.name=name;
            for(var i=0;i<this.buttons.length;i++){
                this.buttons[i].updateButton();
            }
            return name;
        }else{
            return this.name;
        }
        
    }
    
    setAuthor(name){
        name = this.setAuthorSilent(name);
        //if active, we have to change the name tag label to this
        if(this.view)this.view.authorUpdated();
                
    }
    
    //sets the name without changing the label
    setAuthorSilent(name){
        if(name!=null && name!=""){
            //name = name.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
            this.author=name;
            return name;
        }else{
            return this.author;
        }
        
    }
    
    setDescription(name){
        name = this.setDescriptionSilent(name);
        //if active, we have to change the name tag label to this
        if(this.view)this.view.descriptionUpdated();
                
    }
    
    //sets the name without changing the label
    setDescriptionSilent(name){
        if(name!=null && name!=""){
            //name = name.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
            this.description=name;
            return name;
        }else{
            return this.description;
        }
        
    }
    
    makeActive(container){
        try{
            this.isActive=true;
            for(var i=0;i<this.buttons.length;i++){
                this.buttons[i].makeActive();
                //uncommenting this line will allow all parents of the activated workflow to automatically expand
                //this.activateParents(this.buttons[i],true);
            }
            if(this.xmlData!=null){
                this.openXMLData();
            }else{
                this.createInitialColumns();
                this.createBaseWeek();
            }
            var view;
            if(this.project.outcomesview){
                if(this instanceof Programflow)view = new ProgramOutcomeview(container,this);
                else if(this instanceof Activityflow)view = new Workflowview(container,this);
                else view = new Outcomeview(container,this);
            }else{
                view = new Workflowview(container,this);
            }
            this.view=view;
            if(this.view)this.view.makeActive();

            if(this.undoHistory.length==0){
                this.currentUndo=-1;
                this.addUndo("Initial",this);
            }
            
            $("#outcomeview").removeClass("disabled");
            $("#outcomeviewbar").removeClass("disabled");
            if(!this.project.readOnly)$("#settingsviewbar").removeClass("disabled");
            if(!this.project.readOnly)$("#settings").removeClass("disabled");
            if(!this.project.readOnly)$("#duplicatewf").removeClass("disabled");
            $("#export").removeClass("disabled");
            $("#export").get()[0].innerHTML = LANGUAGE_TEXT.menus.exportwf[USER_LANGUAGE];
            if(this.currentUndo>0)$("#undo").removeClass("disabled");
            if(this.currentUndo<this.undoHistory.length-1)$("#redo").removeClass("disabled");
            if(this.settings.settingsKey.validation.value)this.validate();
            this.undoEnabled=true;
        }catch(err){
            alert(LANGUAGE_TEXT.errors.wfopen[USER_LANGUAGE]);
            gaError("Workflow",err);
        }
    }
    
    
    
    makeInactive(){
        this.undoEnabled=false;
        $("#outcomeview").addClass("disabled");
        $("#outcomeviewbar").addClass("disabled");
        $("#settingsviewbar").addClass("disabled");
        $("#settings").addClass("disabled");
        $("#duplicatewf").addClass("disabled");
        $("#export").addClass("disabled");
        $("#undo").addClass("disabled");
        $("#redo").addClass("disabled");
        this.isActive=false;
        if(this.view)this.view.makeInactive();
        for(var i=0;i<this.buttons.length;i++){
            this.buttons[i].makeInactive();
            //uncommenting this will revert automatic expansion of parents when a workflow is activated
            //this.activateParents(this.buttons[i],false);
        }
        this.saveXMLData();
        this.weeks=[];
        this.columns=[];
        this.comments=[];
        this.brackets=[];
        this.view=null;
    }
    
    clearAll(){
        if(this.view)this.view.makeInactive();
        this.weeks=[];
        this.columns=[];
        this.comments=[];
        this.brackets=[];
    }
    
    activateParents(b,add){
        if(b.parentElement.classList.contains("layoutdiv")){
            if(add)b.parentElement.classList.add("activechild");
            else b.parentElement.classList.remove("activechild");
            this.activateParents(b.parentElement,add);
        }
    }
    
    addColumn(name){
        var col = new Column(this,name);
        if(col.name.substr(0,3)=='CUS'&&col.nodetext!=col.text)col.setNodeText(col.text);
        this.columns.push(col);
        if(this.view)this.view.columnAdded(col);
        
    }
    
    removeColumn(column){
        var index = this.columns.indexOf(column);
        this.columns.splice(index,1);
        if(this.view instanceof Workflowview)this.view.columnRemoved(column);
        for(var i=0;i<this.weeks.length;i++){
            for(var j=0;j<this.weeks[i].nodes.length;j++){
                var node = this.weeks[i].nodes[j];
                if(node.column==column.name)node.column=this.columns[this.columns.length-1].name;
                if(node.view)node.view.columnUpdated();
            }
        }
        if(this.view instanceof Outcomeview)this.view.columnRemoved(column);
    }
    
    getColIndex(name){
        for(var i=0;i<this.columns.length;i++){
            if(this.columns[i].name==name)return i;
        }
        return 0;
    }
    
    ensureColumn(name){
        for(var i=0;i<this.columns.length;i++){
            if(this.columns[i].name==name)return i;
        }
        this.addColumn(name);
        return this.columns.length-1;
    }
    
    
    createBaseWeek(){
        var baseWeek = this.createWeek();
        this.weeks.push(baseWeek);
        if(this.view)this.view.weekAdded(baseWeek);
        this.updateWeekIndices();
    }
    
    createWeek(){
        var week = new Week(this);
        return week;
    }
    
    updateWeekIndices(){
        var weeks = this.weeks;
        for(var i=0;i<weeks.length;i++){
            weeks[i].index=i;
            if(this.view)this.view.weekIndexUpdated(weeks[i]);
            if(weeks[i].name==null&&weeks[i].name!="")weeks[i].setName(null);
        }
    }
    
    
    moveWeek(week,direction){
        var index = week.index;
        if((direction>0&&index<this.weeks.length-1)||(direction<0&&index>0)){
            var week2 = this.weeks[index+direction];
            //This doesn't take into account the heights of the weeks!
            if(this.view)this.view.weeksSwapped(week,week2,direction);
            [this.weeks[index],this.weeks[index+direction]]=[this.weeks[index+direction],this.weeks[index]]
            this.updateWeekIndices();
        }
    }
    
    
    
    getTagByID(id){
        var tag;
        for(var i=0;i<this.tagSets.length;i++){
            tag = this.tagSets[i].getTagByID(id);
            if(tag!=null)return tag;
        }
    }
    
    createNodeOfType(column){
        var node;
        var wf = this;
        if(this instanceof Courseflow) node = new ACNode(wf);
        else if (column=="CO") node = new CONode(wf);
        else if(this instanceof Activityflow)node = new WFNode(wf);
        else if(this instanceof Programflow)node = new CONode(wf);
        else node = new CFNode(wf);
        return node;
        
    }
    
    findNextNodeOfSameType(node,direction,sameType=true){
        var week = node.week;
        var nodeIndex = week.nodes.indexOf(node);
        var weekIndex = this.weeks.indexOf(week);
        nodeIndex+=direction;
        while(weekIndex<this.weeks.length&&weekIndex>=0){
            while(nodeIndex<this.weeks[weekIndex].nodes.length&&nodeIndex>=0){
                if(!sameType||this.weeks[weekIndex].nodes[nodeIndex].constructor===node.constructor)return(this.weeks[weekIndex].nodes[nodeIndex]);
                nodeIndex+=direction;
            }
            weekIndex+=direction;
            if(nodeIndex<0&&weekIndex>=0)nodeIndex=this.weeks[weekIndex].nodes.length-1;
            else if(nodeIndex>0&&weekIndex<this.weeks.length)nodeIndex=0;
        }
        return null;
    }
    
    
    
    addBracket(icon,node){
        var bracket = new Bracket(this);
        bracket.changeNode(node,true);
        bracket.changeNode(node,false);
        bracket.setIcon(icon);
        this.brackets.push(bracket);
        if(this.view)this.view.bracketAdded(bracket);
    }
    
    
    addComment(com){
        this.comments.push(com);
    }
    
    addTagSet(tag,checkParent=true){
        if(tag==null)return;
        //Remove any children of the tag we are adding
        var allTags = tag.getAllTags([]);
        for(var i=0;i<this.tagSets.length;i++){
            if(allTags.indexOf(this.tagSets[i])>=0){
                this.tagSets.splice(i,1);
                i--;
            }
        }
        //Add the tag
        this.tagSets.push(tag);
        if(this.view)this.view.tagSetAdded(tag);
        
        //Check to see if we have all children of the parent, if the parent exists
        var parentTag = tag.parentTag;
        if(parentTag!=null&&checkParent){
            var children = parentTag.getAllTags([],parentTag.depth+1);
            children.splice(0,1);
            var addParent=true;
            for(i=0;i<children.length;i++){
                if(this.tagSets.indexOf(children[i])<0){
                    addParent=false;
                    break;
                }
            }
            if(addParent){
                this.addTagSet(parentTag);
                if(this.isActive&&this.tagSelect!=null)for(i=0;i<this.tagSelect.options.length;i++){
                    if(this.tagSelect.options[i].value==parentTag.id){
                        this.tagSelect.remove(i);
                        i--;
                    }
                }
            }
        }
        var wf = this;
        if(wf.view)wf.view.populateTagBar();
        //asynchronous debounced call to refresh the nodes
        var debouncetime=200;
        var prevRefreshCall=this.lastRefreshCall;
        this.lastRefreshCall = Date.now();
        if(prevRefreshCall&&this.lastRefreshCall-prevRefreshCall<=debouncetime){
            clearTimeout(this.lastRefreshTimer);
        }
        this.lastRefershTimer = setTimeout(function(){wf.refreshAllTags();},debouncetime);
    }
    
    removeTagSet(tag,purge=true,purgechildren=true){
        if(this.tagSets.indexOf(tag)>=0){
            this.tagSets.splice(this.tagSets.indexOf(tag),1);
        }else if(tag.parentTag!=null){
            this.removeTagSet(tag.parentTag,true,false);
            for(var i=0;i<tag.parentTag.children.length;i++){
                if(tag.parentTag.children[i]!=tag)this.addTagSet(tag.parentTag.children[i],false);
            }
        } 
        if(purge)this.purgeTag(tag,purgechildren);
        if(this.view)this.view.tagSetRemoved(tag);
            
    }
    
    deleteTagSet(tag){
        var allTags = [];
        allTags = tag.getAllTags(allTags);
        for(var i=0;i<allTags.length;i++){
            var currentTag = allTags[i];
            if(this.tagSets.indexOf(currentTag)>=0){
                this.tagSets.splice(this.tagSets.indexOf(currentTag),1);
                if(this.view)this.view.tagSetRemoved(currentTag);
            }
        }
        this.purgeTag(tag,true);
        
    }
    
    purgeTag(tag,purgechildren){
        
        var idSet = [];
        if(purgechildren)idSet = tag.getAllID(idSet);
        else idSet = [tag.id];
        if(idSet.length==0)return;
        if(this.isActive){
                for(var i=0;i<this.weeks.length;i++){
                    for(var j=0;j<this.weeks[i].nodes.length;j++){
                        var node = this.weeks[i].nodes[j];
                        for(var k=0;k<idSet.length;k++){
                            var id=idSet[k];
                            for(var l=0;l<node.tags.length;l++){
                                if(node.tags[l].id==id){
                                    node.removeTag(node.tags[l]);
                                    l--;
                                }
                            }
                        }
                    }
                }
            }else{
                if(this.xmlData==null)return;
                for(var k =0;k<idSet.length;k++){
                    var id = idSet[k];
                    var xmlused =this.xmlData.getElementsByTagName("tagARRAY");
                    for(i=0;i<xmlused.length;i++){
                        if(xmlused[i].childNodes.length==0)continue;
                        var usedArray = xmlused[i].childNodes[0].nodeValue.split(',');
                        while(usedArray.indexOf(id)>=0){
                            usedArray.splice(usedArray.indexOf(id),1);
                        }
                        xmlused[i].childNodes[0].nodeValue = usedArray.join(',');
                    }
                }
            }
    }
    
    getTagDepth(){return 2;}
    
    refreshAllTags(){
        for(var i=0;i<this.weeks.length;i++){
            for(var j=0;j<this.weeks[i].nodes.length;j++){
                if(this instanceof Programflow)this.weeks[i].nodes[j].refreshLinkedTags();
            }
        }
    }
    
    expandAllNodes(expand=true){
        if(this.view)this.view.expandAllNodes(expand);
    }
    
    //Purge the workflow from this one
    purgeUsedWF(wf){
        var checknodes=false;
        while(this.children.indexOf(wf)>=0){
            this.children.splice(this.children.indexOf(wf),1);
            checknodes=true;
        }
        if(checknodes){
        //if it's active, easy to remove from nodes
            if(this.isActive){
                for(var j=0;j<this.weeks.length;j++){
                    for(var k=0;k<this.weeks[j].nodes.length;k++){
                        var node = this.weeks[j].nodes[k];
                        if(node.linkedWF==wf.id)node.linkedWF=null;
                    }
                }
            }else{
                //do it in the xmlvar 
                if(this.xmlData==null)return;
                var xmllinks = this.xmlData.getElementsByTagName("linkedwf");
                for(var i=0;i<xmllinks.length;i++){
                    xmllinks[i].childNodes[0].nodeValue="";
                }
            }
            
        }
    }
    
    
    getDeleteText(){
        return LANGUAGE_TEXT.confirm.deleteworkflow[USER_LANGUAGE];
    }
    
    getUnassignText(){
        return LANGUAGE_TEXT.confirm.unassignworkflow[USER_LANGUAGE];
    }

    deleteSelf(){
        this.project.deleteWF(this);
    }
    
    unassignFrom(parent){
        if(parent instanceof Workflow){
            this.project.removeChild(parent,this);
            
        }else{
            console.log("I don't know what to do with this");
        }
    }

    
    //swap the two used workflows (used to rearrange the layout)
    swapChildren(c1,c2){
        var i1 = this.children.indexOf(c1);
        var i2 = this.children.indexOf(c2);
        [this.children[i1],this.children[i2]]=[this.children[i2],this.children[i1]];
        
    }
    
    //swap two tag sets
    swapTagSets(i1,i2){
        [this.tagSets[i1],this.tagSets[i2]]=[this.tagSets[i2],this.tagSets[i1]];
        if(this.view)this.view.tagSetsSwapped(i1,i2);
    }
    
    
    swapColumns(in1,in2){
        [this.columns[in1],this.columns[in2]]=[this.columns[in2],this.columns[in1]];
        if(this.view)this.view.columnsSwitched(in1,in2);
    }
    
    //Move node 1 to before or after node2
    moveNodeTo(node1,node2,isAfter=true){
        node1.week.removeNode(node1);
        node1.week = node2.week;
        node2.week.addNode(node1,0,node2.week.nodes.indexOf(node2)+isAfter);
        if(this.view)this.view.nodeMovedTo(node1,node2,isAfter);
    }
    
    addNodesFromXML(week,startIndex,xml){
        xml = (new DOMParser()).parseFromString(this.project.assignNewIDsToXML(xml),"text/xml");
        //Add everything
        var xmlnodes = xml.getElementsByTagName("node");
        var xmlbrackets = xml.getElementsByTagName("bracket");
        var nodes = [];
        for(var i=0;i<xmlnodes.length;i++){
            var xmlnode = xmlnodes[i];
            var column = getXMLVal(xmlnode,"column");
            var node = this.createNodeOfType(column);
            node.week = week;
            node.fromXML(xmlnode);
            if(this.view)this.view.nodeAddedFromXML(node);
            week.addNodeSilent(node,0,startIndex+i);
            nodes.push(node);
        }
        for(i=0;i<xmlbrackets.length;i++){
            var br = new Bracket(this);
            br.fromXML(xmlbrackets[i]);
            if(this.view)this.view.bracketAddedFromXML(br);
            this.brackets.push(br);
        }
        for(i=0;i<nodes.length;i++)nodes[i].makeAutoLinks();
        if(this.view)this.view.finishedAddingNodesFromXML(week,startIndex+xmlnodes.length);
        
    }
    
    makeUndo(type,source=null){
        this.addUndo(type,source);
    }
    
    //Call to create an undo/update event, which will debounce calls
    updated(type,source){
        var debouncetime=500;
        var prevUndoCall = this.lastUndoCall;
        this.lastUndoCall=Date.now();
       //Debounce
        if(prevUndoCall&&this.lastUndoCall-prevUndoCall<=debouncetime){
            clearTimeout(this.lastCallTimer);
        }
        var wf = this;
        this.lastCallTimer = setTimeout(function(){
            if(wf.isActive){
                wf.makeUndo(type,source);
                if(wf.settings.settingsKey.validation.value){wf.validate();}
            }
        },debouncetime);
        
        
        
    }
        
    addUndo(type,source){
        
        this.undoEnabled=false;
        var undo = new Undo(this,type,source);
        //If we have just done one or more undos, the index will be less than the max; we should destroy everything past the current index.
        if(this.currentUndo<this.undoHistory.length-1){
            this.undoHistory.splice(this.currentUndo+1,this.undoHistory.length-2-this.currentUndo)
        }
        //If the most recent undo is of the same type and source, we probably only need to keep one.
        if(this.undoHistory.length>1){
            var lastUndo = this.undoHistory[this.undoHistory.length-1];
            if((lastUndo.type==undo.type&&lastUndo.source==undo.source)||undo.xml==lastUndo.xml){
                this.undoHistory.splice(this.undoHistory.length-1,1);
                this.currentUndo--;
            }
        }
        this.undoHistory.push(undo);
        this.currentUndo++;
        if(this.currentUndo>0)$("#undo").removeClass("disabled");
        this.undoEnabled=true;
    }
    
    undo(){
        if(this.undoEnabled&&this.currentUndo>0){
            var wf = this;
            wf.undoEnabled=false;
            makeLoad(function(){
                if(wf.view&&wf.view.graph)wf.view.graph.clearSelection();
                var lastUndo = wf.undoHistory[wf.currentUndo-1];
                wf.xmlData = lastUndo.xml;
                wf.clearAll();
                wf.tagSets = [];
                for(var i=0;i<lastUndo.tagSets.length;i++)                wf.tagSets.push(wf.project.getTagByID(lastUndo.tagSets[i]));
                wf.openXMLData();
                wf.updateChildrenFromNodes();
                if(wf.view)wf.view.makeActive();
                wf.currentUndo--;
                if(wf.currentUndo==0)$("#undo").addClass("disabled");
                $("#redo").removeClass("disabled");
                wf.undoEnabled=true;
            });
            
        }
    }
    
    redo(){
        if(this.undoEnabled&&this.currentUndo<this.undoHistory.length-1){
            var wf = this;
            wf.undoEnabled=false;
           makeLoad(function(){
                if(wf.view&&wf.view.graph)wf.view.graph.clearSelection();
                var nextUndo = wf.undoHistory[wf.currentUndo+1];
                wf.xmlData = nextUndo.xml;
                wf.clearAll();
                wf.tagSets=[];
                for(var i=0;i<nextUndo.tagSets.length;i++)                wf.tagSets.push(wf.project.getTagByID(nextUndo.tagSets[i]));
                wf.openXMLData();
                wf.updateChildrenFromNodes();
                wf.view.makeActive();
                wf.currentUndo++;
               if(wf.currentUndo==wf.undoHistory.length-1)$("#redo").addClass("disabled");
               $("#undo").removeClass("disabled");
                wf.undoEnabled=true;
            });
        }
    }
    
    updateChildrenFromNodes(){
        var linkedWF=[];
        for(var i=0;i<this.weeks.length;i++){
            for(var j=0;j<this.weeks[i].nodes.length;j++){
                var link = this.weeks[i].nodes[j].linkedWF;
                var wfc = this.project.getWFByID(link);
                if(wfc==null)this.weeks[i].nodes[j].linkedWF=null;
                else linkedWF.push(link);
            }
        }
        var childcopy = [...this.children];
        for(i=0;i<childcopy.length;i++){
            for(j=0;j<linkedWF.length;j++){
                
                if(childcopy[i].id==linkedWF[j]){childcopy.splice(i,1);linkedWF.splice(j,1);i--;j--;break;}
            }
        }
        for(i=0;i<childcopy.length;i++)this.removeChild(childcopy[i]);
        for(i=0;i<linkedWF.length;i++)this.addChild(this.project.getWFByID(linkedWF[i]));
    }
    
    requestPrint(){
        if(this.view)this.view.print();
    }
    
    weekDeleted(){
        this.updateWeekIndices();
        if(this.view)this.view.weekDeleted();
    }
    
    
    toggleSimple(isSimple){
        if(this.isSimple!=isSimple){
            this.isSimple = isSimple;
            for(var i=0;i<this.weeks.length;i++){
                if(this.weeks[i].view)this.weeks[i].view.simpleToggled();
            }
            if(isSimple){
                var baseweek = this.weeks[0];
                baseweek.setName(null);
                while(this.weeks.length>1){
                    var week = this.weeks[1];
                    while(week.nodes.length>0){
                        var node = week.nodes[0];
                        week.removeNode(node);
                        node.week = baseweek;
                        baseweek.addNodeSilent(node);
                    }
                    week.deleteSelf();
                }
            }else{
                this.updateWeekIndices();
            }
        }
    }
    
    
    populateMenu(menu){
        var layout = this;
        
        menu.addItem(LANGUAGE_TEXT.menus.expand[USER_LANGUAGE],'',function(){
            $("#expand").click();
        });
        menu.addItem(LANGUAGE_TEXT.menus.collapse[USER_LANGUAGE],'',function(){
            $("#collapse").click();
        });
        menu.addItem(LANGUAGE_TEXT.menus.legend[USER_LANGUAGE],'',function(){
            $("#showlegend").click();
        });
        menu.addItem(LANGUAGE_TEXT.menus.toggleoutcome[USER_LANGUAGE],'',function(){
            $("#outcomeview").click();
        });
        menu.addItem(LANGUAGE_TEXT.menus.exportwf[USER_LANGUAGE],'',function(){
            $("#export").click();
        });
        menu.addItem(LANGUAGE_TEXT.menus.duplicate[USER_LANGUAGE],'',function(){
            $("#duplicatewf").click();
        });
        menu.addItem(LANGUAGE_TEXT.workflowview.whatsthis[USER_LANGUAGE],iconpath+'info.svg',function(){
            
            if(layout instanceof Activityflow)layout.project.showHelp('activityhelp.html');
            else if(layout instanceof Courseflow)layout.project.showHelp('coursehelp.html');
            else if(layout instanceof Progamflow)layout.project.showHelp('programhelp.html');
            else layout.project.showHelp('help.html');
        });
    }
    
    
    showSettings(){
        var wf = this;
        wf.project.settingsDisplayed=true;
        var div = document.createElement('div');
        div.className = 'messagediv';
        var head = document.createElement('h4');
        head.innerHTML = LANGUAGE_TEXT.project.selectoptions[USER_LANGUAGE]+":";
        div.appendChild(head);
        
        var newsettings={};
        for(var prop in this.settings.settingsKey){
            newsettings[prop] = this.createSettingsOption(LANGUAGE_TEXT.workflow.settings[prop][USER_LANGUAGE], this.settings.settingsKey[prop]);
            var settingdiv = newsettings[prop].parentElement;
            div.appendChild(settingdiv);
            if(!settingdiv.setting.sub){
                newsettings[prop].onchange = function(){
                    if(this.type=="checkbox"){
                        var thisdiv = this.parentElement;
                        var nextdiv = thisdiv.nextSibling;
                        console.log(nextdiv);
                        while(nextdiv&&nextdiv.setting&&nextdiv.setting.sub){
                            console.log("changing class");
                            if(this.checked)nextdiv.classList.remove("disabled");
                            else(nextdiv.classList.add("disabled"));
                            nextdiv = nextdiv.nextSibling;
                        }
                    }
                }
            }else{
                var lastdiv = newsettings[prop].parentElement.previousSibling;
                while(lastdiv&&lastdiv.setting){
                    if(!lastdiv.setting.sub){if(lastdiv.setting.type=="checkbox"&&!lastdiv.setting.value)newsettings[prop].parentElement.classList.add("disabled");break;}
                    lastdiv = lastdiv.previousSibling;
                }
            }
        }
        
        
        
        /*
        var advancedoutcomes = this.createCheckboxOption("Advanced Outcomes");
        advancedoutcomes.checked=this.advancedOutcomes;
        div.appendChild(advancedoutcomes.parentElement);
        
        var linktagging = this.createCheckboxOption("Link Tagging Enabled");
        linktagging.checked = this.linkTagging;
        div.appendChild(linktagging.parentElement);
        
        var validation = this.createCheckboxOption("Validation");
        validation.checked = this.validation;
        div.appendChild(validation.parentElement);
        
        
        
        var reqtime = this.createNumberOption("Req Credits",this.reqtime);
        div.appendChild(reqtime.parentElement);
        var mintime = this.createNumberOption("Min Credits Per Term",this.mintime);
        div.appendChild(mintime.parentElement);
        var maxtime = this.createNumberOption("Max Credits Per Term",this.maxtime);
        div.appendChild(maxtime.parentElement);
        var maxterm = this.createNumberOption("Max Terms",this.maxtterm);
        div.appendChild(maxterm.parentElement);
        
        */
        
        
        var button = document.createElement('button');
        div.appendChild(button);
        button.innerHTML = "OK";
        button.onclick=function(){
            var newSettingsVals={};
            for(var prop in wf.settings.settingsKey){
                var newval;
                var type = wf.settings.settingsKey[prop].type;
                if(type=="number"){
                    if(newsettings[prop].value=="")newval=null;
                    else newval = int(newsettings[prop].value);
                }else if(type=="checkbox"){
                    newval = newsettings[prop].checked;
                }
                newSettingsVals[prop]=newval;
            }
            
            document.body.removeChild(div);
            wf.changeSettings(newSettingsVals);
            wf.project.settingsDisplayed=false;
        };
        document.body.appendChild(div);
    }
    
    createSettingsOption(string,setting){
        console.log(setting);
        var div = document.createElement('div');
        div.className="settingdiv";
        var input = document.createElement('input');
        input.type=setting.type;
        input.value=setting.value;
        if(setting.type=="checkbox"&&setting.value)input.checked=true;
        input.style.display = "inline-block";
        var label = document.createElement('div');
        label.innerHTML = string;
        if(setting.type!="checkbox")label.innerHTML+=":";
        label.style.display = "inline-block";
        div.appendChild(input);
        if(setting.sub)div.classList.add("subsetting");
        if(setting.type=="checkbox")div.appendChild(label);
        else div.insertBefore(label,input);
        div.setting = setting;
        return input;
    }
    
    
    changeSettings(newSettingsVals){
        var settingsChanged = false;
        for(var prop in this.settings.settingsKey){
            var setting = this.settings.settingsKey[prop];
            if(setting.value!=newSettingsVals[prop]){
                console.log(prop);
                console.log(setting.value);
                console.log(newSettingsVals[prop]);
                setting.value=newSettingsVals[prop];
                settingsChanged=true;
            }
        }
        if(settingsChanged&&this.view){this.view.settingsChanged();this.updated("settings",this);}
        
    }
    
    validate(showAlert=false){
        console.log("validating");
        if(this.validating||this.settings.settingsKey.validation.value!=true)return;
        this.validating = true;
        this.clearValidationErrors();
        this.errorlist=[];
        var errortext = "";
        var credits = [];
        for(var i=0;i<this.weeks.length;i++){
            var w = this.weeks[i];
            var weektime = 0;
            for(var j=0;j<w.nodes.length;j++){
                var n = w.nodes[j];
                //check prereqs
                for(var k=0;k<n.fixedLinksOut.length;k++){
                    var link = n.fixedLinksOut[k];
                    var target = link.targetNode;
                    if(!target)continue;
                    console.log(link.style);
                    if(link.style=="dashed"){
                        if(n.week.index>target.week.index){
                            var errorstring = target.name+LANGUAGE_TEXT.validation.appearsbeforecoreq[USER_LANGUAGE]+n.name;
                            this.errorlist.push(new WorkflowError(target,errorstring));
                            errortext+=errorstring+"\n";
                        }
                    }else if(n.week.index>=target.week.index){
                        var errorstring = target.name+LANGUAGE_TEXT.validation.appearsbeforeprereq[USER_LANGUAGE]+n.name
                        this.errorlist.push(new WorkflowError(target,errorstring));
                        errortext+=errorstring+"\n";
                    }
                }
                if(n.time.value)weektime+=int(n.time.value);
                
            }
            credits.push(weektime);
        }
        
        //check maxterms
        if(this.settings.settingsKey.maxterm.value){
            var maxterm = this.settings.settingsKey.maxterm.value;
            if(maxterm>this.weeks.length){
                var errorstring = LANGUAGE_TEXT.validation.maxterms[USER_LANGUAGE]+maxterm+LANGUAGE_TEXT.validation.maxterms2[USER_LANGUAGE]+this.weeks.length;
                this.errorlist.push(new WorkflowError(this.weeks[this.weeks.length-1],errorstring));
                errortext+=errorstring+"\n";
            }
        }
        var totalcredits =0;
        var mintime = this.settings.settingsKey.mintime.value;
        var maxtime = this.settings.settingsKey.maxtime.value;
        if(mintime||maxtime)for(var i=0;i<credits.length;i++){
            if(mintime&&credits[i]<mintime){
                var errorstring = this.weeks[i].getName()+LANGUAGE_TEXT.validation.has[USER_LANGUAGE]+credits[i]+LANGUAGE_TEXT.validation.lesscredits[USER_LANGUAGE]+mintime+")";
                this.errorlist.push(new WorkflowError(this.weeks[i],errorstring));
                errortext+=errorstring+"\n";
            }
            if(maxtime&&credits[i]>maxtime){
                var errorstring = this.weeks[i].getName()+LANGUAGE_TEXT.validation.has[USER_LANGUAGE]+credits[i]+LANGUAGE_TEXT.validation.morecredits[USER_LANGUAGE]+maxtime+")";
                this.errorlist.push(new WorkflowError(this.weeks[i],errorstring));
                errortext+=errorstring +"\n";
            }
            totalcredits+=credits[i];
        }
        var reqtime = this.settings.settingsKey.reqtime.value;
        if(reqtime&&totalcredits<=reqtime){
            var errorstring = LANGUAGE_TEXT.validation.total[USER_LANGUAGE]+totalcredits+LANGUAGE_TEXT.validation.lesscredits[USER_LANGUAGE]+reqtime+")";
            this.errorlist.push(new WorkflowError(this.weeks[this.weeks.length-1],errorstring));
            errortext+=errorstring;
        }
        if(errortext=="")errortext=LANGUAGE_TEXT.validation.noerrors[USER_LANGUAGE];
        if(showAlert)alert(LANGUAGE_TEXT.validation.errorstart[USER_LANGUAGE]+errortext);
        this.addValidationErrors();
        this.validating = false;
    }
    
    
    //Goes through our validation errors and if there are adequate views we add them
    addValidationErrors(){
        for(var i=0;i<this.errorlist.length;i++){
            var error = this.errorlist[i];
            try{
                if(error.node.view.addError){
                    error.node.view.addError(error);
                }
            }catch(err){
                console.log("error node not found");
            }
        }
    }
    
    clearValidationErrors(){
        console.log("CLEARED");
        if(this.errorlist==null)return;
        for(var i=0;i<this.errorlist.length;i++){
            var error = this.errorlist[i];
            try{
                error.node.view.removeError(error);
            }catch(err){
                console.log("error node not found");
            }
        }
    }

}

class Courseflow extends Workflow{
    
    createInitialColumns(){
        var columns = this.columns;
        columns.push(new Column(this,"HW"));
        columns.push(new Column(this,"AC"));
        columns.push(new Column(this,"SA"));
    }
    
    getPossibleColumns(){
        var columns = [];
        columns.push(new Column(this,"HW"));
        columns.push(new Column(this,"AC"));
        columns.push(new Column(this,"FA"));
        columns.push(new Column(this,"SA"));
        var highestCustom=0;
        for(var i=0;i<this.columns.length;i++){
            if(this.columns[i].name.substr(0,3)=="CUS"){
                columns.push(this.columns[i]);
                var num = int(this.columns[i].name.substr(3));
                if(num>highestCustom)highestCustom=num;
            }
        }
        columns.push(new Column(this,"CUS"+(highestCustom+1)));
        return columns;
    }
    
    getDefaultName(){return LANGUAGE_TEXT.workflow.newcourse[USER_LANGUAGE];}
    getDepth(){return 1;}
    
    getType(){return "course"};
    getButtonClass(){return "layoutcourse";}
    getIcon(){return "course";}
    
    typeToXML(){return makeXML("course","wftype");}
    
    getTagDepth(){return 1;}
}

class Activityflow extends Workflow{
    
    createInitialColumns(){
        var columns = this.columns;
        columns.push(new Column(this,"OOCI"));
        columns.push(new Column(this,"OOC"));
        columns.push(new Column(this,"ICI"));
        columns.push(new Column(this,"ICS"));
    }
    
    getPossibleColumns(){
        var columns = [];
        columns.push(new Column(this,"OOCI"));
        columns.push(new Column(this,"OOC"));
        columns.push(new Column(this,"ICI"));
        columns.push(new Column(this,"ICS"));
        var highestCustom=0;
        for(var i=0;i<this.columns.length;i++){
            if(this.columns[i].name.substr(0,3)=="CUS"){
                columns.push(this.columns[i]);
                var num = int(this.columns[i].name.substr(3));
                if(num>highestCustom)highestCustom=num;
            }
        }
        columns.push(new Column(this,"CUS"+(highestCustom+1)));
        return columns;
    }
    
    createBaseWeek(){
        var baseWeek = this.createWeek();
        baseWeek.index=0;
        this.weeks.push(baseWeek);
        if(this.view)this.view.weekAdded(baseWeek);
        this.updateWeekIndices();
    }
    
    createWeek(){
        var week = new WFArea(this);
        return week;
    }
    
    updateWeekIndices(){if(!this.isSimple)super.updateWeekIndices();}
    
    getType(){return "activity"};
    getButtonClass(){return "layoutactivity";}
    getIcon(){return "activity";}
    getBracketList(){return iconsList['strategy'];}
    
    typeToXML(){return makeXML("activity","wftype");}
    
    getDefaultName(){return LANGUAGE_TEXT.workflow.newactivity[USER_LANGUAGE];}
    getDepth(){return 2;}
    
    
    
    
}

class Programflow extends Workflow{
    
    createInitialColumns(){
        var columns = this.columns;
        columns.push(new Column(this,"CUS1"));
        columns.push(new Column(this,"CUS2"));
        columns.push(new Column(this,"CUS3"));
    }
    
    getPossibleColumns(){
        var columns = [];
        var highestCustom=0;
        for(var i=0;i<this.columns.length;i++){
            if(this.columns[i].name.substr(0,3)=="CUS"){
                columns.push(this.columns[i]);
                var num = int(this.columns[i].name.substr(3));
                if(num>highestCustom)highestCustom=num;
            }
        }
        columns.push(new Column(this,"CUS"+(highestCustom+1)));
        return columns;
    }
    
    createWeek(){
        var week = new Term(this);
        return week;
    }
    
    
    //Move node 1 to before or after node2
    moveNodeTo(node1,node2,isAfter=true){
        node1.week.removeNode(node1);
        node1.week = node2.week;
        if(node1.column!=node2.column)node2.week.addNode(node1);
        else node2.week.addNode(node1,0,node2.week.nodesByColumn[node2.column].indexOf(node2)+isAfter);
        if(this.view)this.view.nodeMovedTo(node1,node2,isAfter);
    }
    
    createBaseWeek(){
        var baseWeek = new Term(this);
        this.weeks.push(baseWeek);
        if(this.view)this.view.weekAdded(baseWeek);
        this.updateWeekIndices();
    }
    
    //updateWeekIndices(){};
    
    getType(){return "program";}
    getButtonClass(){return "layoutprogram";}
    getIcon(){return "program";}
    getTagDepth(){return 0;}
    
    typeToXML(){return makeXML("program","wftype");}
    
    getDefaultName(){return LANGUAGE_TEXT.workflow.newprogram[USER_LANGUAGE];}
    getDepth(){return 0;}
    
    
    
}

class WorkflowError{
    constructor(node,text){
        this.text = text;
        this.node=node;
    }
    
}