//The node and link classes, as well as the many extensions of each node. Each distinct node type is a separate extension of the base class, characterized by the ways in which it differs from default behaviours.

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

class CFNode {
    constructor(wf){
        this.lefticon;
        this.righticon;
        this.name;
        this.column;
        this.week;
        this.text;
        this.textHeight=100;
        this.isDropped=false;
        this.wf=wf;
        this.linkedWF;
        this.id = this.wf.project.genID();
        this.autoLinkOut = new WFAutolink(this);
        this.autoLinkOut.portStyle="sourcePort=HIDDENs;targetPort=INn;";
        this.fixedLinksOut=[];
        this.linksIn=[];
        this.brackets=[];
        this.tags=[];
        this.view;
        this.time={value:null,unit:"min"};
    }
    
    makeAutoLinks(){return false;}
    
    addFixedLinkOut(target,edge=null){
        var link = new WFLink(this,edge);
        link.setTarget(target);
        this.fixedLinksOut.push(link)
        if(this.view)this.view.fixedLinkAdded(link,edge);
    }
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.name,"name",true);
        xml+=makeXML(this.id,"id");
        xml+=makeXML(this.lefticon,"lefticon");
        xml+=makeXML(this.righticon,"righticon");
        xml+=makeXML(this.column,"column");
        xml+=makeXML(this.text,"textHTML",true);
        xml+=makeXML(this.linkedWF,"linkedwf");
        xml+=makeXML(this.textHeight,"textheight");
        if(this.time.value!=null){
            xml+=makeXML(this.time.value,"timevalue");
            xml+=makeXML(this.time.unit,"timeunit");
        }
        if(this.isDropped)xml+=makeXML("true","isdropped");
        if(this.autoLinkOut==null){xml+=makeXML("true","noautolink");}
        for(var i=0;i<this.fixedLinksOut.length;i++){
            if(this.fixedLinksOut[i].id!=null){
                xml+=this.fixedLinksOut[i].toXML();
            }
        }
        /*var linksOut =[];
        var linkOutPorts=[];
        for(var i=0;i<this.fixedLinksOut.length;i++){
            if(this.fixedLinksOut[i].id!=null){
                linksOut.push(this.fixedLinksOut[i].id);
                linkOutPorts.push(this.fixedLinksOut[i].getPortStyle());
            }
        }
        xml+=makeXML(linksOut,"fixedlinkARRAY");
        xml+=makeXML(linkOutPorts,"linkportARRAY");*/
        for(var i=0;i<this.tags.length;i++){
            xml+=this.tags[i].toXML();
        }
        
        /*var tagArray=[];
        for(i=0;i<this.tags.length;i++){
            tagArray.push(this.tags[i].id);
        }
        xml+=makeXML(tagArray.join(","),"tagARRAY");*/
        return makeXML(xml,"node");
    }
    
    toJSON(json){
        json.node.push({id:this.id,title:this.name,description:this.text,context_classification:this.lefticon,task_classification:this.righticon,colour:this.colour,workflow:this.wf.id,time_required:this.time.value,time_units:this.time.unit,linked_workflow:this.linkedWF,column:this.column});
        for(let i=0;i<this.fixedLinksOut.length;i++){
            this.fixedLinksOut[i].toJSON(json);
        }
        for(let i=0;i<this.tags.length;i++){
            this.tags[i].toJSON(json);
        }
        
    }
    
    fromXML(xml){
        this.setName(getXMLVal(xml,"name",true));
        this.id = getXMLVal(xml,"id");
        this.setColumn(getXMLVal(xml,"column"));
        this.setText(getXMLVal(xml,"textHTML",true));
        this.setLeftIcon(getXMLVal(xml,"lefticon"));
        this.setRightIcon(getXMLVal(xml,"righticon"));
        this.linkedWF = getXMLVal(xml,"linkedwf");
        var textHeight =getXMLVal(xml,"textheight");
        if(textHeight!=null)this.textHeight=int(textHeight);
        var isDropped = getXMLVal(xml,"isdropped");
        if(isDropped)this.isDropped=true;
        var noAutoLink = getXMLVal(xml,"noautolink");
        if(noAutoLink){this.autoLinkOut=null;}
        var timeval = getXMLVal(xml,"timevalue");
        if(timeval!=null)this.time.value=timeval;
        var timeunit = getXMLVal(xml,"timeunit");
        if(timeunit!=null)this.time.unit=timeunit;
        
        //Old linking style (deprecated)
        var linksOut = getXMLVal(xml,"fixedlinkARRAY");
        var linkOutPorts = getXMLVal(xml,"linkportARRAY");
        if(linksOut){
            console.log("Savefile has older node linking style, attempting to recover...");
            for(var i=0;i<linksOut.length;i++){
                var link = new WFLink(this);
                link.id=linksOut[i];
                if(linkOutPorts[i]!=null)link.portStyle=linkOutPorts[i];
                this.fixedLinksOut.push(link);
            }
        }
        //New linking style
        var xmlLinks = xml.getElementsByTagName("link");
        for(var i=0;i<xmlLinks.length;i++){
            var link = new WFLink(this);
            link.fromXML(xmlLinks[i]);
            this.fixedLinksOut.push(link);
        }
        //old tag style
        var tagArray = getXMLVal(xml,"tagARRAY");
        if(tagArray!=null){
            console.log("Savefile has older tagging style, attempting to recover...");
            for(i=0;i<tagArray.length;i++){
                this.addTag(this.wf.getTagByID(tagArray[i]),false);
            }
        }
        else{
            var xmlTags = xml.getElementsByTagName("nodetag");
            for(var i=0;i<xmlTags.length;i++){
                var nodeTag = new NodeTag(null,this);
                nodeTag.fromXML(xmlTags[i]);
                this.tags.push(nodeTag);
            }
        }
        if(this instanceof Programflow)this.refreshLinkedTags();
        
        
        
    }
    
    setColumn(col){
        this.wf.ensureColumn(col);
        if(this.column!=col){
            this.column=col;
            if(this.view)this.view.columnUpdated();
        }
    }
    
    
    setName(name){
        if(name!=null){
            name = this.setNameSilent(name);
            if(this.view)this.view.nameUpdated();
        }
    }
    
    setNameSilent(name){
        if(name!=null){
            //name = name.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
            this.name=name;
        }
        return this.name;
        
    }
    
    setText(text){
        this.text=text;
        if(this.view&&text!=null)this.view.textUpdated();
        
    }
    
    setTime(value){
        if(value!=""&&value!=null)this.time.value=""+value;
        else this.time.value=null;
        if(this.view)this.view.timeUpdated();
    }
    
    setTimeUnits(value){
        this.time.unit = value;
        if(this.view)this.view.timeUpdated();
    }
    
    getTimeString(){
        if(this.time.value==null)return '';
        return this.time.value+" "+LANGUAGE_TEXT.timeunits[this.time.unit][USER_LANGUAGE];
    }
    
    setLinkedWF(value){
        var autoswitch=false;
        if(value=="")value=null;
        else if(value!=null&&value.substr(0,3)=="NEW"){
            value = this.wf.project.addWorkflow(value.substr(value.indexOf("_")+1)).id;
            autoswitch=true;
        }
        var oldvalue = null;
        if(value!=this.linkedWF){
            if(this.linkedWF!=null){
                var oldwf = this.wf.project.getWFByID(this.linkedWF)
                oldvalue = oldwf.name;
                this.wf.removeChild(oldwf);
            }
            this.linkedWF = value;
            
            if(value!=null){
                var wfc = this.wf.project.getWFByID(value);
                this.wf.addChild(wfc);
                if(this.name==null||this.name==""||this.name==oldvalue)this.setName(wfc.name);
                var addTags=false;
                if(this.tags.length>0&&oldvalue==null&&/*temporarily disable attribution of tags this.wf instanceof Programflow*/false)addTags = mxUtils.confirm(LANGUAGE_TEXT.confirm.linkwf[USER_LANGUAGE]);
                if(this.view)this.view.linkedWFUpdated(value,oldvalue);
                if(this instanceof Programflow)this.refreshLinkedTags(addTags);
                
                
                if(autoswitch)wfc.project.changeActive(wfc);
            }else{
                if(this.view)this.view.linkedWFUpdated(value,oldvalue);
                if(this.tags.length>0){
                    if(mxUtils.confirm(LANGUAGE_TEXT.confirm.unlinkwf[USER_LANGUAGE]))while(this.tags.length>0)this.removeTag(this.tags[0].tag,false);
                }
            }
        }
        
    }
    
    setIcon(value,icon){
        if(icon=="left")this.setLeftIcon(value);
        if(icon=="right")this.setRightIcon(value);
    }
    
    setLeftIcon(value){
        var oldvalue = this.lefticon;
        if(value=="")value=null;
        this.lefticon=value;
        if(this.view)this.view.leftIconUpdated(oldvalue);
    }
    setRightIcon(value){
        var oldvalue = this.righticon;
        if(value=="")value=null;
        this.righticon=value;
        if(this.view)this.view.rightIconUpdated(oldvalue);
    }
    
    setWeek(week){
        this.week=week;
    }
    
    changeWeek(y){
        var weekIndex=this.wf.weeks.indexOf(this.week);
        this.week.removeNode(this,y);
        this.week=this.wf.weeks[weekIndex+y];
        this.week.addNode(this,y,0);
        
    }
    
    getLeftIconList(){return iconsList[this.getIconCategory('left')];}
    getRightIconList(){return iconsList[this.getIconCategory('right')];}
    getIconCategory(icon){return null;}
    
    
    
    resizeBy(dy){
        if(this.isDropped&&this.textHeight+dy>0)this.textHeight=this.textHeight+dy;
        if(this.view)this.view.vertexResized(dy);
    }
    
    openLinkedWF(){
        var p = this.wf.project;
        var linkedWF = this.linkedWF;
        if(linkedWF!=null)p.changeActive(p.getWFByID(linkedWF));
    }
    
    
    styleForColumn(){}
    
    toggleDropDown(){
        if(this.view)this.view.dropDownToggled();
        this.isDropped=(!this.isDropped);
    }
    
    
    deleteSelf(){
        this.setLinkedWF(null);
        this.setLeftIcon(null);
        this.setRightIcon(null);
        for(var i=0;i<this.brackets.length;i++)this.brackets[i].cellRemoved(this);
        for(var i=0;i<this.tags.length;i++){
            this.removeTag(this.tags[i].tag);
        }
        this.week.removeNode(this);
        if(this.autoLinkOut&&this.autoLinkOut.targetNode!=null)this.autoLinkOut.targetNode.makeAutoLinks();
        if(this.view)this.view.deleted();
    }
    
    insertBelow(){
        var node = this.wf.createNodeOfType(this.column);
        if(this.view){
            this.view.insertBelow(node);
        }
        if(this.wf.view)this.wf.view.bringCommentsToFront();
        node.setColumn(this.column);
        node.setWeek(this.week);
        this.week.addNode(node,0,this.week.nodes.indexOf(this)+1);
        this.wf.updated("Add Node",node);
        return node;
    }
    
    duplicateNode(){
        var node = this.wf.createNodeOfType(this.column);
        node.setWeek(this.week);
        node.fromXML((new DOMParser).parseFromString(this.wf.project.assignNewIDsToXML(this.toXML()),"text/xml"));
        if(node.linkedWF!=null)node.linkedWF=null;
        if(this.view){
            this.view.insertBelow(node);
            node.view.columnUpdated();
            if(node.view.fillTags)node.view.fillTags();
        }
        while(node.fixedLinksOut.length>0)node.fixedLinksOut[0].deleteSelf();
        this.week.addNode(node,0,this.week.nodes.indexOf(this)+1);
        this.wf.updated("Add Node",node);
        if(node.view.categoryChanged)node.view.categoryChanged();
    }
    
    getVertexStyle(){return '';}
    
    
    getLinkedWFList(){}

    getAcceptedWorkflowType(){return "";}
    
    autoLinkNodes(n1,n2){
        if(n1==null||n1.autoLinkOut==null)return;
        if(n2==null)n1.autoLinkOut.setTarget(null);
        else if(n1.autoLinkOut.id!=n2.id){
            n1.autoLinkOut.setTarget(n2);
        }
        n1.redrawLinks();
    }
    
    autoLinkSameType(){
        var next = this.wf.findNextNodeOfSameType(this,1);
        var last = this.wf.findNextNodeOfSameType(this,-1);
        
        this.autoLinkNodes(this,next);
        this.autoLinkNodes(last,this);
    }
    
    
    redrawLinks(){
        this.autoLinkOut.redraw();
        //for(var i=0;i<this.fixedLinksOut.length;i++){this.fixedLinksOut[i].redraw();}
    }
    
    addBracket(br){
        this.brackets.push(br);
    }
    
    removeBracket(br){
        this.brackets.splice(this.brackets.indexOf(br),1);
    }
    
    hasTag(tag){
        for(var i=0;i<this.tags.length;i++){
            if(this.tags[i].tag==tag)return true;
        }
        return false;
    }
    
    
    hasTagOrAncestor(tag){
        var tags = [tag];
        var pt = tag;
        while(pt.parentTag){
            tags.push(pt.parentTag);
            pt=pt.parentTag;
        }
        for(var i=0;i<this.tags.length;i++){
            if(tags.indexOf(this.tags[i].tag)>=0)return true;
        }
        return false;
    }
    
    getTagIndex(tag){
        for(var i=0;i<this.tags.length;i++){
            if(this.tags[i].tag==tag)return i;
        }
        return -1;
    }
    
    getTag(tag){
        for(var i=0;i<this.tags.length;i++){
            if(this.tags[i].tag==tag)return this.tags[i];
        }
        return null;
    }
    
    
    getTagDegree(tag){
        for(var i=0;i<this.tags.length;i++){
            if(this.tags[i].tag==tag)return this.tags[i].degree;
        }
        return 0;
    }
    
    addTag(tag,show=true,addToLinked=false,degree){
        //temporarily disable the attribution of tags to linked workflow. This has become an issue since the advanced outcome tagging messes with it
        addToLinked=false;
        if(this.hasTagOrAncestor(tag))return;
        var n = this;
        //Remove any children of the tag we are adding
        var allTags = tag.getAllTags([]);
        for(var i=0;i<this.tags.length;i++){
            if(allTags.indexOf(this.tags[i].tag)>=0){
                this.removeTag(this.tags[i].tag,false);
                i--;
            }
        }
        //Add the tag
        var nodeTag = new NodeTag(tag,this,degree);
        this.tags.push(nodeTag);
        if(this.view)this.view.tagAdded(nodeTag,show);
        if(addToLinked&this.linkedWF!=null){
            this.wf.project.getWFByID(this.linkedWF).addTagSet(tag,true);
            //this.refreshLinkedTags();
        }
        //Check to see if we have all children of the parent, if the parent exists. If advanced outcomes are active, they all have to have the same degree
        var parentTag = tag.parentTag;
        if(parentTag!=null){
            var children = parentTag.getAllTags([],parentTag.depth+1);
            children.splice(0,1);
            if(this.wf.settings.settingsKey.advancedoutcomes.value){
                var addParent=null;
                for(i=0;i<children.length;i++){
                    if(!this.hasTag(children[i])){
                        addParent=0;
                        break;
                    }else{
                        if(addParent==null)addParent=this.tags[this.getTagIndex(children[i])].degree;
                        else if(addParent!=this.tags[this.getTagIndex(children[i])].degree){
                            addParent=0;
                            break;
                        }
                    }
                }
                if(addParent)this.addTag(parentTag,false,false,addParent);
            }else{
                var addParent=true;
                for(i=0;i<children.length;i++){
                    if(!this.hasTag(children[i])){
                        addParent=false;
                        break;
                    }
                }
                if(addParent)this.addTag(parentTag);
            }
        }
    }
    
    removeTag(tag,removeFromLinked=false){
        //removed from linked temporarily disabled
        removeFromLinked=false;
        var removed = null;
        while(this.hasTag(tag)){
            removed = this.tags.splice(this.getTagIndex(tag),1)[0];
        }
        if(removed==null&&tag.parentTag!=null){
            var degreeToAdd;
            if(this.hasTag(tag.parentTag))degreeToAdd = this.tags[this.getTagIndex(tag.parentTag)].degree;
            if(this.removeTag(tag.parentTag,false))for(var i=0;i<tag.parentTag.children.length;i++){
                if(tag.parentTag.children[i]!=tag)this.addTag(tag.parentTag.children[i],false,false,degreeToAdd);
            }
        }
        if(removed && this.linkedWF!=null&&removeFromLinked){
             this.wf.project.getWFByID(this.linkedWF).removeTagSet(tag);
        }
        if(removed && this.view)this.view.tagRemoved(removed);
        return removed;
    }
    
    
    
    
    
    
    refreshLinkedTags(addToLinked=false){
        //temporarily disabled. 
        return;
        if(this.linkedWF!=null){
            var wf = this.wf.project.getWFByID(this.linkedWF);
            //Remove/add tags that aren't assigned to the linked workflow
            if(addToLinked)for(var i=0;i<this.tags.length;i++){
                if(wf.tagSets.indexOf(this.tags[i].tag)<0){
                    if(addToLinked){wf.addTagSet(this.tags[i].tag);}
                    else{this.removeTag(this.tags[i].tag,false);i--;}
                }
                
            }
            if(wf.tagSets.length==0)return;
            var allID=[];
            for(var i=0;i<this.wf.tagSets.length;i++){
                allID=this.wf.tagSets[i].getAllID(allID);
            }
            //Add tags that are present in the linked workflow but not in this one.
            for(var i=0;i<wf.tagSets.length;i++){
                if(allID.indexOf(wf.tagSets[i].id)>=0&&this.getTagIndex(wf.tagSets[i])<0)this.addTag(wf.tagSets[i],false,false);
            }
        }
    }
    
    populateMenu(menu){
        var node = this;
        var p = this.wf.project;
        
        
        menu.addItem(LANGUAGE_TEXT.node.modifytext[USER_LANGUAGE], iconpath+'text.svg', function(){
            if(node.view)node.view.startTitleEdit();
        });
        
        this.populateIconMenu(menu,node.getLeftIconList(),"Left");
        this.populateIconMenu(menu,node.getRightIconList(),"Right");
        
        if(node.linkedWF!=null)menu.addItem('Go To Linked Workflow',iconpath+'enterlinked.svg',function(){
            var linkedWF = node.linkedWF;
            if(linkedWF!=null)p.changeActive(p.getWFByID(linkedWF));
        });
        this.populateLinkedWFMenu(menu,node.getLinkedWFList());
        menu.addItem(LANGUAGE_TEXT.node.duplicate[USER_LANGUAGE],iconpath+'copy.svg',function(){
           node.duplicateNode(); 
        });
        menu.addItem(LANGUAGE_TEXT.node.delete[USER_LANGUAGE],iconpath+'delrect.svg',function(){
            if(mxUtils.confirm(LANGUAGE_TEXT.confirm.deletenode[USER_LANGUAGE])){
                node.deleteSelf();
                node.wf.updated("Delete Node",node);
            }
        });
        
        menu.addItem(LANGUAGE_TEXT.workflowview.whatsthis[USER_LANGUAGE],iconpath+'info.svg',function(){
            p.showHelp('nodehelp.html');
        });
    }
    
    populateIconMenu(menu,iconArray,icon){
        var node = this;
        var text;
        if(icon=="Left")text = LANGUAGE_TEXT.node.lefticon[USER_LANGUAGE];
        else if(icon=="Right")text = LANGUAGE_TEXT.node.righticon[USER_LANGUAGE];
        if(iconArray==null||iconArray.length==0)return;
        var sub = menu.addItem(text,iconpath+icon.toLowerCase()+'icon.svg');
        for(var i=0;i<iconArray.length;i++){
            var tempfunc = function(value){
                menu.addItem(value.text[USER_LANGUAGE],iconpath+value.value+'.svg',function(){
                    node.setIcon(value.value,icon.toLowerCase());
                },sub);
            }
            tempfunc(iconArray[i]);
        }
    }
    
    populateLinkedWFMenu(menu,WFArray){
        var node = this;
        if(WFArray==null)return;
        var sub = menu.addItem(LANGUAGE_TEXT.node.setlinkedwf[USER_LANGUAGE],iconpath+'plusblack.svg');
        menu.addItem("None",'',function(){node.setLinkedWF("");},sub)
        for(var i=0;i<WFArray.length;i++){
            var tempfunc = function(value){
                menu.addItem(value[0],'',function(){
                    node.setLinkedWF(value[1]);
                },sub);
            }
            tempfunc(WFArray[i]);
        }
        menu.addItem(LANGUAGE_TEXT.editbar.createnew[USER_LANGUAGE]+" "+node.getAcceptedWorkflowType(),'',function(){
            node.setLinkedWF("NEW_"+node.getAcceptedWorkflowType());
        },sub);
    }
    
}

class ACNode extends CFNode {
    
    
    getIconCategory(icon){
        if(icon=="left")return "assessment"; 
        if(icon=="right")return "strategy";
        else return null;
    }
    
    
    getLinkedWFList(){
        var wfs = this.wf.project.workflows[this.getAcceptedWorkflowType()];
        var list=[];
        for(var i=0;i<wfs.length;i++){
            list.push([wfs[i].name,wfs[i].id]);
        }
        return list;
    }
    
    getAcceptedWorkflowType(){return "activity";}
    
    makeAutoLinks(){
        //this.autoLinkSameType();
        //return true;
        return false;
    }
    
    getColumnStyle(){
        return this.wf.columns[this.wf.getColIndex(this.column)].colour;
    }
    
    getVertexStyle(){
        return defaultWFNodeStyle;
    }
    
    
}

class CONode extends CFNode {
    
    
    
    
    getLinkedWFList(){
        var wfs = this.wf.project.workflows[this.getAcceptedWorkflowType()];
        var list=[];
        for(var i=0;i<wfs.length;i++){
            list.push([wfs[i].name,wfs[i].id]);
        }
        return list;
    }
    
    
    
    getIconCategory(icon){
        return null;
    }
    
    
    getAcceptedWorkflowType(){return "course";}
    
    makeAutoLinks(){
        //this.autoLinkSameType();
        //return true;
        return false;
    }
    
    getColumnStyle(){
        return this.wf.columns[this.wf.getColIndex(this.column)].colour;
    }
    
    getVertexStyle(){
        return defaultWFNodeStyle;
    }
    
    
}

class WFNode extends CFNode {     
    
    getIconCategory(icon){
        if(icon=="left")return "context";
        if(icon=="right")return "task";
    }
    
    getColumnStyle(){
        return this.wf.columns[this.wf.getColIndex(this.column)].colour;
    }
    
    getVertexStyle(){
        return defaultWFNodeStyle;
    }
    
    makeAutoLinks(){
        this.autoLinkSameType();
        return true;
    }
    
}

class CUSNode extends CFNode {
    
    
    
    getLinkedWFList(){
        if(this.wf instanceof Activityflow)return null;
        var wfs = this.wf.project.workflows[this.getAcceptedWorkflowType()];
        var list=[];
        for(var i=0;i<wfs.length;i++){
            list.push([wfs[i].name,wfs[i].id]);
        }
        return list;
            
    }
    
    
    getAcceptedWorkflowType(){
        if(this.wf instanceof Courseflow)return "activity";
        if(this.wf instanceof Programflow)return "course";
    }
    
    getIconCategory(icon){
        if(icon=="left"){
            if(this.wf instanceof Activityflow) return "context";
            else if(this.wf instanceof Programflow) return null;
            else return "strategy";
        }
        if(icon=="right"){
            if(this.wf instanceof Activityflow) return "task";
            else if(this.wf instanceof Programflow) return null;
            else return null;
        }
    }
    
    getColumnStyle(){
        return this.wf.columns[this.wf.getColIndex(this.column)].colour;
    }
    
    getVertexStyle(){
        return defaultWFNodeStyle;
    }
    
}

class WFLink{
    constructor(node){
        this.wf = node.wf;
        this.node=node;
        this.id;
        this.portStyle=null;
        this.targetNode;
        this.text;
        this.style;
        this.view;
        this.labelx;
        this.tags=[];
    }
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.id,"targetid");
        xml+=makeXML(this.getPortStyle(),"portstyle");
        if(this.text)xml+=makeXML(this.text,"linktext",true);
        if(this.style)xml+=makeXML(this.style,"linkstyle");
        if(this.labelx!=null)xml+=makeXML(this.labelx,"linklabelx");
        
        for(var i=0;i<this.tags.length;i++){
            xml+=this.tags[i].toXML();
        }
        return makeXML(xml,"link");
    }
    
    toJSON(json){
        json.nodelink.push({source:this.node.id,target:this.id,title:this.text,style:this.style});
    }
    
    fromXML(xml){
        var targetid = getXMLVal(xml,"targetid");
        var portStyle = getXMLVal(xml,"portstyle");
        var text = getXMLVal(xml,"linktext",true);
        var style = getXMLVal(xml,"linkstyle");
        var labelx = getXMLVal(xml,"linklabelx");
        this.id = targetid;
        this.targetNode = null;
        if(text)this.text = text;
        if(portStyle)this.portStyle=portStyle;
        if(style)this.style=style;
        if(labelx!=null)this.labelx=parseFloat(labelx);
        
        var xmlTags = xml.getElementsByTagName("linktag");
        for(var i=0;i<xmlTags.length;i++){
            var nodeTag = new NodeTag(null,this);
            nodeTag.fromXML(xmlTags[i]);
            this.tags.push(nodeTag);
        }
    }
    
    setTextSilent(value){
        if(value!=null){
            //value = value.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
            this.text=value;
        }
        return this.text;
        
    }
    
    setTarget(node){
        if(this.targetNode!=null&&this.targetNode.linksIn.indexOf(this)>=0)this.targetNode.linksIn.splice(this.targetNode.linksIn.indexOf(this),1);
        this.targetNode = node;
        if(node==null)this.id=null;
        else {this.id = node.id;node.linksIn.push(this);console.log("linked");}
    }
    
    getPortStyle(){
        if(this.portStyle==null&&this.view)this.portStyle = this.view.getPortStyle();
        if(this.portStyle!=null)return this.portStyle;
        return "";
    }
    
    redraw(){
        if(this.id!=null&&this.targetNode==null) {
            this.setTarget(this.node.wf.findNodeById(this.id));
            //if the node is still null after this the connection is probably garbage (for example a connection to a node that has been destroyed).
            if(this.targetNode==null){this.id=null;return;}
        }
        if(this.view)this.view.redraw();
    }
    
    changeStyle(style){
        this.style=style;
        if(this.view)this.view.redraw();
    }
    
    
    
    
    deleteSelf(){
        if(this.view)this.view.deleted();
        this.node.fixedLinksOut.splice(this.node.fixedLinksOut.indexOf(this),1);
    }
    
    
    hasTag(tag){
        for(var i=0;i<this.tags.length;i++){
            if(this.tags[i].tag==tag)return true;
        }
        return false;
    }
    
    hasTagOrAncestor(tag){
        var tags = [tag];
        var pt = tag;
        while(pt.parentTag){
            tags.push(pt.parentTag);
            pt=pt.parentTag;
        }
        for(var i=0;i<this.tags.length;i++){
            if(tags.indexOf(this.tags[i].tag)>=0)return true;
        }
        return false;
    }
    
    getTag(tag){
        for(var i=0;i<this.tags.length;i++){
            if(this.tags[i].tag==tag)return this.tags[i];
        }
        return null;
    }
    
    
    getTagDegree(tag){
        for(var i=0;i<this.tags.length;i++){
            if(this.tags[i].tag==tag)return this.tags[i].degree;
        }
        return 0;
    }
    
    getTagIndex(tag){
        for(var i=0;i<this.tags.length;i++){
            if(this.tags[i].tag==tag)return i;
        }
        return -1;
    }
    
    addTag(tag,show=true,addToLinked=false,degree){
        //temporarily disable the attribution of tags to linked workflow. This has become an issue since the advanced outcome tagging messes with it
        addToLinked=false;
        if(this.hasTagOrAncestor(tag))return;
        var n = this;
        //Remove any children of the tag we are adding
        var allTags = tag.getAllTags([]);
        for(var i=0;i<this.tags.length;i++){
            if(allTags.indexOf(this.tags[i].tag)>=0){
                this.removeTag(this.tags[i].tag,false);
                i--;
            }
        }
        //Add the tag
        var nodeTag = new NodeTag(tag,this,degree);
        this.tags.push(nodeTag);
        if(this.view)this.view.tagAdded(nodeTag,show);
        //Check to see if we have all children of the parent, if the parent exists. If advanced outcomes are active, they all have to have the same degree
        var parentTag = tag.parentTag;
        if(parentTag!=null){
            var children = parentTag.getAllTags([],parentTag.depth+1);
            children.splice(0,1);
            if(this.wf.settings.settingsKey.advancedoutcomes.value){
                var addParent=null;
                for(i=0;i<children.length;i++){
                    if(!this.hasTag(children[i])){
                        addParent=0;
                        break;
                    }else{
                        if(addParent==null)addParent=this.tags[this.getTagIndex(children[i])].degree;
                        else if(addParent!=this.tags[this.getTagIndex(children[i])].degree){
                            addParent=0;
                            break;
                        }
                    }
                }
                if(addParent)this.addTag(parentTag,false,false,addParent);
            }else{
                var addParent=true;
                for(i=0;i<children.length;i++){
                    if(!this.hasTag(children[i])){
                        addParent=false;
                        break;
                    }
                }
                if(addParent)this.addTag(parentTag);
            }
        }
    }
    
    removeTag(tag,removeFromLinked=false){
        //removed from linked temporarily disabled
        removeFromLinked=false;
        var removed = null;
        while(this.hasTag(tag)){
            removed = this.tags.splice(this.getTagIndex(tag),1)[0];
        }
        if(removed==null&&tag.parentTag!=null){
            var degreeToAdd;
            if(this.hasTag(tag.parentTag))degreeToAdd = this.tags[this.getTagIndex(tag.parentTag)].degree;
            if(this.removeTag(tag.parentTag,false))for(var i=0;i<tag.parentTag.children.length;i++){
                if(tag.parentTag.children[i]!=tag)this.addTag(tag.parentTag.children[i],false,false,degreeToAdd);
            }
        }
        if(removed && this.view)this.view.tagRemoved(removed);
        return removed;
    }
    
    //Check whether the prerequisite path for this tag is okay.
    validateTag(tag){
        var searchtags = [];
        var degree;
        if(this.wf.settings.settingsKey.advancedoutcomes.value){
            var ts = tag;
            while(this.getTagIndex(ts)<0&&ts.parentTag!=null)ts = ts.parentTag;
            var index = this.getTagIndex(ts);
            if(index<0)return;
            degree = this.tags[index].degree;
            console.log(degree);
        }
        searchtags = tag.getAllTags(searchtags);
        var path = new WFLinkPath(this,searchtags,null,[],degree);
        if(!path.found)path.validateSelf(tag);
        return path;
        
    }
    
    
}

class WFAutolink extends WFLink{
    deleteSelf(){
        if(this.view)this.view.deleted();
        this.node.autoLinkOut = null;
    }
}

//The instance of a tag on a node
class NodeTag{
    constructor(tag,node,degree=1){
        this.tag=tag;
        this.node = node;
        this.degree=degree;
    }
    
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.tag.id,"nodetagid");
        if(this.degree>1)xml+=makeXML(this.degree,"nodetagdegree");
        if(this.node instanceof WFLink)return makeXML(xml,"linktag");
        else return makeXML(xml,"nodetag");
    }
    
    toJSON(json){
        json.outcomenode.push({node:this.node.id,outcome:this.tag.id,degree:this.degree});
    }
    
    fromXML(xml){
        var tagid = getXMLVal(xml,"nodetagid");
        this.tag = this.node.wf.project.getTagByID(tagid);
        var nodetagdegree = getXMLVal(xml,"nodetagdegree");
        if(nodetagdegree)this.degree=int(nodetagdegree);
        
    }
    
    /*setDegree(degree){
        this.degree=degree;
        if(this.node.view)this.node.view.degreeChanged();
    }*/
    
}

class WFLinkPath{
    constructor(startlink,searchtags,parent,linkschecked,degree){
        this.degree=degree;
        this.searchtags=searchtags;
        this.tagParents=[];
        var tag = this.searchtags[0];
        while(tag.parentTag !=null){tag=tag.parentTag;this.tagParents.push(tag);}
        this.parent=parent;
        this.link=startlink;
        this.subPaths=[];
        this.tagsfound = [];
        this.linkschecked = [];
        for(var i=0;i<linkschecked.length;i++){
            this.linkschecked.push(linkschecked[i]);
        }
        this.found=false;
        var node = startlink.node;
        this.checkNode(node);
        if(this.found)return;
        for(var i=0;i<node.linksIn.length;i++){
            //might want to do this differently. Not just checking for loops, this will also block finding alternate paths
            if(this.linkschecked.indexOf(node.linksIn[i])>=0)continue;
            this.linkschecked.push(node.linksIn[i]);
            this.subPaths.push(new WFLinkPath(node.linksIn[i],searchtags,this,this.linkschecked,this.degree));
            if(this.subPaths[i].found)this.found=true;
            else for(var j=0;j<this.subPaths[i].tagsfound.length;j++)this.tagsfound.push(this.subPaths[i].tagsfound[j]);
        }
        
        
    }
    
    checkNode(node){
        console.log(this.degree);
        for(var i=0;i<this.tagParents.length;i++){
            if(node.hasTag(this.tagParents[i])){
                if(this.degree!=null){
                    var deg = node.getTagDegree(this.tagParents[i]);
                    if(deg == 1 || (deg & this.degree) >0){this.found=true;return;}
                }else {this.found=true;return;}
            }
        }
        if(node.hasTag(this.searchtags[0])){
            if(this.degree!=null){
                var deg = node.getTagDegree(this.searchtags[0]);
                console.log(deg);
                console.log(this.degree);
                console.log(deg & this.degree);
                if(deg == 1 || (deg & this.degree) > 0){this.found=true;return;}
            }else {this.found=true;return;}
        }
        for(var i=0;i<this.searchtags.length;i++){
            if(node.hasTag(this.searchtags[i])){
                if(this.degree!=null){
                    var deg = node.getTagDegree(this.searchtags[i]);
                    if(deg == 1 || (deg & this.degree) >0){this.tagsfound.push(this.searchtags[i]);}
                }else {this.tagsfound.push(this.searchtags[i]);}
            }
        }
    }
    
    validateSelf(tag){
        this.valid = this.checkTag(tag);
        console.log(this.valid);
    }
    
    //To be used when the tag has not been explicitly found, to check all the children    
    checkTag(tag){
        console.log(this.tagsfound);
        if(this.tagsfound.indexOf(tag)>=0)return true;
        if(tag.children.length==0)return false;
        for(var i=0;i<tag.children.length;i++){
            var haschild = this.checkTag(tag.children[i]);
            if(haschild==false)return false;
        }
        return true;
    }
    
    
    
}