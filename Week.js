//Definition of the week class, which includes both actual weeks in the course level and just a container for nodes at the activity level.

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

class Week {
    constructor(wf){
        this.nodes=[];
        this.name;
        this.index;
        this.wf=wf;
        this.id = this.wf.project.genID();
        this.view;
        this.collapsed=false;
    }
    
    getName(){
        if(this.name)return this.name;
        return this.getDefaultName();
    }
    
    setNameSilent(name){
        if(name!=null && name!=""){
            //name = name.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
            this.name=name;
            return name;
        }else{
            this.name=null;
            return this.getDefaultName();
        }
    }
    
    setName(name){
        if(name!=null && name!=""){
            this.setNameSilent(name);
        }else{
            this.name = null;
        }
        if(this.view)this.view.nameUpdated();
        
    }  
    
    getDefaultName(){
        return LANGUAGE_TEXT.week.week[USER_LANGUAGE]+" "+(this.wf.weeks.indexOf(this)+1);
    }
    
    
    getType(){return "week";}
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.id,"weekid");
        if(this.name!=null)xml+=makeXML(this.name,"weekname",true);
        if(this.collapsed)xml+=makeXML("true","weekcollapsed");
        for(var i=0;i<this.nodes.length;i++){
            xml+=this.nodes[i].toXML();
        }
        return makeXML(xml,"week");
    }
    
    toJSON(json){
        json.week.push({id:this.id,title:this.name,nodes:this.nodes.map((node)=>node.id)});
        for(let i=0;i<this.nodes.length;i++){
            this.nodes[i].toJSON(json);
        }
    }
    
    fromXML(xmlData){
        var wf = this.wf;
        this.id = getXMLVal(xmlData,"weekid");
        var name = getXMLVal(xmlData,"weekname",true);
        if(name!=null)this.setName(name);
        var collapsed = getXMLVal(xmlData,"weekcollapsed");
        if(collapsed)this.collapsed=collapsed;
        var xmlnodes = xmlData.getElementsByTagName("node");
        for(var i=0;i<xmlnodes.length;i++){
            var xmlnode = xmlnodes[i];
            var column = getXMLVal(xmlnode,"column");
            var node = wf.createNodeOfType(column);
            node.week = this;
            node.fromXML(xmlnode);
            this.addNodeSilent(node);
        }
    }
    
    
    
    //Adds a node. If we are just switching the node, we don't need to push weeks.
    addNode(node,origin=0,index=-1){
        if(this.collapsed)this.toggleCollapse();
        if(index<0||origin<0||index>this.nodes.length-1){this.nodes.push(node);}
        else if(origin > 0) {this.nodes.splice(0,0,node);}
        else this.nodes.splice(index,0,node);
        index=this.nodes.indexOf(node);
        if(this.view)this.view.nodeAdded(node,origin,index);
        node.makeAutoLinks();
    }
    
    //Adds a node without pushing anything
    addNodeSilent(node,origin=0,index=-1){
        if(index<0||origin<0||index>this.nodes.length-1){this.nodes.push(node);}
        else if(origin > 0) {this.nodes.splice(0,0,node);}
        else this.nodes.splice(index,0,node);
        index=this.nodes.indexOf(node);
        if(this.view)this.view.nodeAddedSilently(node,origin,index);
    }
    
    //Removes a node. If we are just switching the node, we don't need to push weeks.
    removeNode(node,origin=0){
        if(this.collapsed)this.toggleCollapse();
        var index=this.nodes.indexOf(node);
        this.nodes.splice(index,1);
        if(this.view)this.view.nodeRemoved(node,origin,index);
    }
    
    
    getIndexOf(node){
        return this.nodes.indexOf(node);
    }
    
    
    
    shiftNode(initIndex,finalIndex){
        if(initIndex==finalIndex)return;
        var prevNode = this.wf.findNextNodeOfSameType(this.nodes[initIndex],-1)
        this.nodes.splice(finalIndex,0,this.nodes.splice(initIndex,1)[0]);
        if(this.view)this.view.nodeShifted(initIndex,finalIndex);
        //Make the autolinks if needed
        if(this.nodes[finalIndex].makeAutoLinks()){
            if(prevNode!=null)prevNode.makeAutoLinks();
        }
        
    }
    
    //Causes the week to delete itself and all its contents
    deleteSelf(){
        while(this.nodes.length>0){
            this.nodes[this.nodes.length-1].deleteSelf();
        }
        this.wf.weeks.splice(this.wf.weeks.indexOf(this),1);
        this.wf.weekDeleted();
        //if we deleted all the weeks, better make a fresh one!
        if(this.wf.weeks.length==0)this.wf.createBaseWeek();
        if(this.view)this.view.deleted();
    }
    
    //Insert a new week below
    insertBelow(){
        var newWeek = new this.constructor(this.wf);
        this.wf.weeks.splice(this.index+1,0,newWeek);
        if(this.view){
            newWeek.view = new this.view.constructor(this.view.graph,newWeek);
            newWeek.view.insertedBelow(this);
        }
        this.wf.updateWeekIndices();
        if(this.wf.view)this.wf.view.weekAdded(newWeek);
        
    }
    
    
    //Duplicate the week and insert the copy below
    duplicateWeek(){
        var newWeek = this.wf.createWeek();
        this.wf.weeks.splice(this.index+1,0,newWeek);
        newWeek.fromXML((new DOMParser).parseFromString(this.wf.project.assignNewIDsToXML(this.toXML()),"text/xml"));
        for(var i=0;i<newWeek.nodes.length;i++){
            if(newWeek.nodes[i].linkedWF!=null)newWeek.nodes[i].linkedWF=null;
            while(newWeek.nodes[i].fixedLinksOut.length>0)newWeek.nodes[i].fixedLinksOut[0].deleteSelf();
        }
        if(this.view){
            newWeek.view = new this.view.constructor(this.view.graph,newWeek);
            newWeek.view.insertedBelow(this);
        }
        this.wf.updateWeekIndices();
        if(this.view)newWeek.view.fillNodes();
        if(this.wf.view)this.wf.view.weekAdded(newWeek);
    }
    
    
    columnUpdated(){return null;}
    
    toggleCollapse(){
        if(this.view)this.view.collapseToggled();
        this.collapsed=(!this.collapsed);
        if(this.view)this.wf.view.weekIndexUpdated(this);
        this.wf.addUndo("Week Collapsed",this);
    }
    
    populateMenu(menu){
        var week = this;
        
        menu.addItem(LANGUAGE_TEXT.week.createbelow[week.getType()][USER_LANGUAGE],iconpath+'add.svg',function(){
            week.insertBelow(); 
        });
        menu.addItem(LANGUAGE_TEXT.week.duplicate[week.getType()][USER_LANGUAGE],iconpath+'copy.svg',function(){
            week.duplicateWeek(); 
        });
        menu.addItem(LANGUAGE_TEXT.week.delete[week.getType()][USER_LANGUAGE],iconpath+'delrect.svg',function(){
            if(mxUtils.confirm(LANGUAGE_TEXT.confirm.deleteweek[week.getType()][USER_LANGUAGE])){
                week.deleteSelf();
                week.wf.updated("Delete Week",week);
            }
        });
        
        menu.addItem(LANGUAGE_TEXT.workflowview.whatsthis[USER_LANGUAGE],iconpath+'info.svg',function(){
            p.showHelp('weekhelp.html');
        });
        
        
    }
    
    
    
}

class WFArea extends Week{
    getType(){return "part";}
    
    getDefaultName(){
        if(this.wf.isSimple)return null;
        else return LANGUAGE_TEXT.week.part[USER_LANGUAGE]+" "+(this.wf.weeks.indexOf(this)+1);
    }
    
    populateMenu(menu){
        var week = this;
        var p = this.wf.project;
        
        var sub = menu.addItem(LANGUAGE_TEXT.week.options[USER_LANGUAGE],iconpath+'weekstyle.svg');
        menu.addItem(LANGUAGE_TEXT.week.simple[USER_LANGUAGE],iconpath+'weekstylesimple.svg',function(){
            week.wf.toggleSimple(true);
        },sub);
        menu.addItem(LANGUAGE_TEXT.week.parts[USER_LANGUAGE],iconpath+'weekstyleparts.svg',function(){
            week.wf.toggleSimple(false);
        },sub);
        
        if(!week.wf.isSimple){
            super.populateMenu(menu);
        } else {
            menu.addItem(LANGUAGE_TEXT.workflowview.whatsthis[USER_LANGUAGE],iconpath+'info.svg',function(){
            p.showHelp('weekhelp.html');
        });
        }
        
        
        
    }
    
}



class Term extends Week{
    
    constructor (wf){
        super(wf);
        this.nodesByColumn={};
    }
    
    getDefaultName(){
        return LANGUAGE_TEXT.week.term[USER_LANGUAGE]+" "+(this.wf.weeks.indexOf(this)+1);
    }
    
    getType(){return "term";}
    
    //Adds a node. If we are just switching the node, we don't need to push weeks.
    addNode(node,origin=0,index=-1){
        if(this.collapsed)this.toggleCollapse();
        var col = node.column;
        if(this.nodesByColumn[col]==null)this.nodesByColumn[col]=[];
        
        if(index<0||origin<0||index>this.nodesByColumn[col].length-1){this.nodesByColumn[col].push(node);}
        else if(origin>0){this.nodesByColumn[col].splice(0,0,node);}
        else this.nodesByColumn[col].splice(index,0,node);
        
        this.nodes.push(node);
        if(this.view)this.view.nodeAdded(node,origin,index);
        node.makeAutoLinks();
    }
    
    
    
    //Adds a node without pushing anything
    addNodeSilent(node,origin=0,index=-1){
        var col = node.column;
        if(this.nodesByColumn[col]==null)this.nodesByColumn[col]=[];
        
        if(index<0||origin<0||index>this.nodesByColumn[col].length-1){this.nodesByColumn[col].push(node);}
        else if(origin>0){this.nodesByColumn[col].splice(0,0,node);}
        else this.nodesByColumn[col].splice(index,0,node);
        
        this.nodes.push(node);
        if(this.view)this.view.nodeAddedSilently(node,origin,index);
        node.makeAutoLinks();
    }
    
    
    //Removes a node. If we are just switching the node, we don't need to push weeks.
    removeNode(node,origin=0){
        if(this.collapsed)this.toggleCollapse();
        var index=this.nodes.indexOf(node);
        this.nodes.splice(index,1);
        index=this.nodesByColumn[node.column].indexOf(node);
        this.nodesByColumn[node.column].splice(index,1);
        
        if(this.view)this.view.nodeRemoved(node,origin,index);
        
       
        
    }
    
    
    
    
    getIndexOf(node){
        return this.nodesByColumn[node.column].indexOf(node);
    }
    
    
    
    //The autolinking in this is likely broken, but it shouldn't matter because we won't be autolinking in terms. If need be it can be fixed by writing a new findNextNodeOfSameType() function for programflow, or by causing the original function to act differently based on whether or not the weeks are instances of term.
    shiftNode(initIndex,finalIndex,column){
        if(this.nodesByColumn[column]==null)this.nodesByColumn[column]=[];
        var nodes = this.nodesByColumn[column];
        if(initIndex==finalIndex)return;
        //var prevNode = this.wf.findNextNodeOfSameType(nodes[initIndex],-1);
        nodes.splice(finalIndex,0,nodes.splice(initIndex,1)[0]);
        if(this.view)this.view.nodeShifted(initIndex,finalIndex,column);
        //Make the autolinks if needed
        /*if(this.nodes[finalIndex].makeAutoLinks()){
            if(prevNode!=null)prevNode.makeAutoLinks();
        }*/
        
    }
    
    
    /*moveWeek(dy){
        var cells=[this.view.vertex];
        for(var prop in this.nodesByColumn){
            var nodes = this.nodesByColumn[prop];
            for(var i=0;i<nodes.length;i++){
                cells.push(nodes[i].view.vertex);
            }
        }
        this.graph.moveCells(cells,0,dy);
    }*/
    
    //the node's column has been changed. We need to move it from one column to another. A simple way to do so is just to remove it from its previous column and add it to the next.
    columnUpdated(node,prevcol){
        var index = this.nodesByColumn[prevcol].indexOf(node);
        var col = node.column;
        node.column=prevcol;
        this.removeNode(node);
        node.column= col;
        this.addNode(node,0,index);
    }
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.id,"weekid");
        if(this.name!=null)xml+=makeXML(this.name,"weekname");
        if(this.collapsed)xml+=makeXML("true","weekcollapsed")
        for(var prop in this.nodesByColumn){
            var nodes = this.nodesByColumn[prop];
            for(var i=0;i<nodes.length;i++){
                xml+=nodes[i].toXML();
            }
        }
        return makeXML(xml,"week");
    }
    
}