//The tag class. This defines a tag, which is actually a tree-like structure. The root tag is stored at the top level of the project, and represents the tree itself (you probably shouldn't be able to tag anything with this top level one). Tags will also have a list of nodes, which is populated when a workflow is loaded and added to as tags are added, that correspond to those that have been tagged with the tag.

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

class Tag {
    constructor(project,parentTag){
        this.project = project;
        if(parentTag==null)this.depth=0;
        else(this.depth = parentTag.depth+1);
        this.name=this.getDefaultName();
        this.id = project.genID();
        this.children=[];
        this.buttons=[];
        this.parentTag=parentTag;
        this.depth;
        this.isActive=false;
        this.view;
        this.collapsed=true;
    }
    
    setName(name){
        if(name!=null && name!=""){
            //name = name.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
            this.name=name;
            for(var i=0;i<this.buttons.length;i++){
                this.buttons[i].updateButton();
            }
            if(this.view)this.view.nameUpdated();
        }
    }

    makeActive(view){
        try{
            this.isActive=true;
            this.view = view;
            for(var i=0;i<this.buttons.length;i++){
                this.buttons[i].makeActive();
            }
            this.view.makeActive();
            if(!this.project.readOnly)$("#duplicatewf").removeClass("disabled");
            $("#export").removeClass("disabled");
            $("#exportcsv").removeClass("disabled");
            $("#export").get()[0].innerHTML = LANGUAGE_TEXT.menus.exportoutcome[USER_LANGUAGE];
        }catch(err){
            alert(LANGUAGE_TEXT.errors.openoutcome[USER_LANGUAGE]);
            gaError("Outcome",err);
        }
    }
    
    makeInactive(){
        for(var i=0;i<this.buttons.length;i++){
            this.buttons[i].makeInactive();
        } 
        $("#duplicatewf").addClass("disabled");
        $("#export").addClass("disabled");
        $("#exportcsv").addClass("disabled");
        $("#export").get()[0].innerHTML = LANGUAGE_TEXT.menus.exportwf[USER_LANGUAGE];
        this.view.makeInactive();
        this.view = null;
    }
    
    removeChild(child){
        if(this.children.indexOf(child)>=0){
            this.children.splice(this.children.indexOf(child),1);
        }
    }
    
    moveChild(layout1,layout2,isAfter=false){
        layout1.parentTag.children.splice(layout1.parentTag.children.indexOf(layout1),1);
        this.children.splice(this.children.indexOf(layout2)+isAfter,0,layout1);
        layout1.parentTag = this;
    }
    
    getDefaultName(term){
        return LANGUAGE_TEXT.tag.new[USER_LANGUAGE]+" "+this.getNameType(term);
    }
    
    getDepth(){
        return this.depth;
    }
    
    getParentWithDepth(depth){
        var parent = this;
        while(true){
            if(parent.depth==depth||parent.parentTag==null)break;
            parent = parent.parentTag;
        }
        return parent;
    }
    
    getLastDescendant(){
        if(this.children.length==0)return this;
        else return this.children[this.children.length-1].getLastDescendant();
    }
        
    addButton(container,recurse=true){
        var button = new Layoutbutton(this,container);
        button.makeEditable(true,true,false);
        button.makeMovable();
        this.buttons.push(button);
        if(recurse)for(var i=0;i<this.children.length;i++){
            this.children[i].addButton(button.childdiv);
        }
        return button;
    }
    
    removeButton(button){
        this.buttons.splice(this.buttons.indexOf(button),1);
        button.removeSelf();
    }
    
    getButtonClass(){return "layoutactivity";}
    
    getChildren(){return this.children;}
    
    getNumberOfDescendants(des){
        var children = this.children;
        for(var i=0;i<children.length;i++){
            var wfc = children[i];
            if(des[wfc.getNameType()]==null)des[wfc.getNameType()]=1;
            else des[wfc.getNameType()]=des[wfc.getNameType()]+1;
            des = wfc.getNumberOfDescendants(des);
            
        }
        return des;
    }
    
    getDeleteText(){
            return LANGUAGE_TEXT.tag.deletetext[USER_LANGUAGE];
    }
    
    getUnassignText(){
        return LANGUAGE_TEXT.tag.unassigntext[USER_LANGUAGE];
    }
    
    deleteSelf(button){
        if(this.depth==0)this.project.deleteWF(this);
        else{
            this.parentTag.removeChild(this);
            if(button!=null)button.removeSelf();
            for(var prop in this.project.workflows){
                for(var i=0;i<this.project.workflows[prop].length;i++){
                    if(this.project.workflows[prop][i].purgeTag)this.project.workflows[prop][i].purgeTag(this);
                }
            }
            
        }
    }
    
    unassignFrom(parent){
        if(parent instanceof Workflow){
            parent.removeTagSet(this);
            parent.updated("Tagset Removed",parent);
            
        }else if(parent instanceof CFNode||parent instanceof WFLink){
            parent.removeTag(this,parent.wf instanceof Programflow);
            parent.wf.updated("Tag Removed",parent);
            if(parent.wf.view){
                var eb = parent.wf.view.editbar;
                if(eb.node==parent){
                    eb.populateTags();
                }
            }
        }else{
            console.log("I don't know what to do with this");
        }
    }
    
    clickButton(){
        this.project.changeActive(this,false);
    }
    
    getType(){
        return "outcome";
    }
    
    getNameType(term){
        if(!term)term = this.project.terminologySet;
        var depth = this.depth;
        if(depth>3)depth=3;
        return LANGUAGE_TEXT.tag[term]["depth"+depth][USER_LANGUAGE];
    }
    
    getIcon(term){
        if(!term)term = this.project.terminologySet;
        if(term == "standard")switch(this.depth){
            case 0: return "program";
            case 1: return "course";
            case 2: return "activity";
            default: return "";
        }else if(term == "cegep")switch(this.depth){
            case 0: return "competency";
            case 1: return "elementofcompetency";
            case 2: return "learningobjective";
            default: return "";
        }else if(term == "eng")switch(this.depth){
            case 0: return "graduateattribute";
            case 1: return "attributeindicator";
            case 2: return "course";
            default: return "";
        }
    }
    
    terminologyUpdated(oldterm){
        if(this.name==this.getDefaultName(oldterm))this.setName(this.getDefaultName());
        for(var i=0;i<this.buttons.length;i++)this.buttons[i].updateButton();
        if(this.view)this.view.terminologyUpdated();
        for(var i=0;i<this.children.length;i++){
            this.children[i].terminologyUpdated(oldterm);
        }
    }
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.name,"tagname",true);
        xml+=makeXML(this.id,"tagid");
        xml+=makeXML(""+this.collapsed,"iscollapsed");
        for(var i=0;i<this.children.length;i++){
            xml+=this.children[i].toXML();
        }
        return makeXML(xml,"tag");
    }
    
    
    fromXML(xml){
        this.setName(getXMLVal(xml,"tagname",true));
        this.id=getXMLVal(xml,"tagid");
        var isCollapsed = getXMLVal(xml,"iscollapsed");
        if(isCollapsed=="true")this.collapsed=true;
        else this.collapsed=false;
        for(var i = 0;i<xml.childNodes.length;i++){
            if(xml.childNodes[i].nodeName=="tag"){
                var newtag = new Tag(this.project,this);
                newtag.fromXML(xml.childNodes[i]);
                this.children.push(newtag);
            }
        }
    }
    
    toJSON(json){
        console.log(json.outcome);
        json.outcome.push({title:this.name,id:this.id,children:this.children.map((child)=>child.id)});
        for(let i=0;i<this.children.length;i++){
            this.children[i].toJSON(json);
        }
        console.log(json);
    }
    
    
    
    getTagByID(id){
        if(this.id==id)return this;
        var tag;
        for(var i=0;i<this.children.length;i++){
            tag = this.children[i].getTagByID(id);
            if(tag!=null)return tag;
        }
        return null;
    }
    
    getAllID(list,maxdepth=-1){
        list.push(this.id);
        if(this.depth!=maxdepth)for(var i=0;i<this.children.length;i++){
            list = this.children[i].getAllID(list,maxdepth);
        }
        return list;
    }
    
    getAllTags(list,maxdepth=-1,ignorelist=null){
        if(ignorelist!=null&&ignorelist.indexOf(this.id)>=0)return list;
        list.push(this);
        if(this.depth!=maxdepth)for(var i=0;i<this.children.length;i++){
            list = this.children[i].getAllTags(list,maxdepth,ignorelist);
        }
        return list;
    }
    
    
    
    
    
    //swap the two usedsubtags (used to rearrange the layout)
    swapChildren(c1,c2){
        var i1 = this.children.indexOf(c1);
        var i2 = this.children.indexOf(c2);
        [this.children[i1],this.children[i2]]=[this.children[i2],this.children[i1]];
        
    }
    
    
    
    requestPrint(){
        if(this.view)this.view.print();
    }
    
    expandAllNodes(expand){
        if(this.view)this.view.expandAllNodes(expand);
    }
    
    populateMenu(menu){
        var layout = this;
        
        menu.addItem(LANGUAGE_TEXT.menus.expand[USER_LANGUAGE],'',function(){
            $("#expand").click();
        });
        menu.addItem(LANGUAGE_TEXT.menus.collapse[USER_LANGUAGE],'',function(){
            $("#collapse").click();
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
            layout.project.showHelp("outcomehelp.html");
        });
    }
    
    toCSV(){
        var csv = "";
        csv += "\""+this.name+"\"";
        if(this.children.length==0)csv+="\n";
        else for(var i=0;i<this.children.length;i++){
            if(i>0)csv += (",").repeat(this.depth);
            csv += ","+this.children[i].toCSV();
        }
        return csv;
    }
    
    fromCSV(array,row=0,col=0){
        console.log(array[row][col]);
        this.setName(array[row][col]);
        var currentrow = row;
        if(array[row].length-1>col){
            while(currentrow<array.length){
                var childTag = new Tag(this.project,this);
                this.children.push(childTag);
                currentrow = childTag.fromCSV(array,currentrow,col+1);
                if(currentrow+1<array.length&&array[currentrow+1][col]!=""&&array[currentrow+1][col]!=null)break;
                currentrow++;
            }
        }
        return currentrow;
    }
    
    
}

