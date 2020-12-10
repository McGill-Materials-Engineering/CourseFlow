//The visualization of a node to be instantiated in the Workflowview.

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

class Nodeview{
    constructor(graph,node){
        this.node=node;
        this.vertex;
        this.lefticonnode;
        this.righticonnode;
        this.namenode;
        this.textnode;
        this.dropNode;
        this.timeNode;
        this.graph=graph;
        if(this.node.autoLinkOut)this.node.autoLinkOut.view = new WFAutolinkview(graph,this.node.autoLinkOut);
        this.tagPreview;
        
        
    }
    
    
    createVertex(x,y){
        var width = defaultCellWidth;
        if(this.node.wf.weeks[0] instanceof Term)width=160;
        var h = minCellHeight+cellDropdownHeight+cellDropdownPadding;
        var textHeightOffset = 0;
        if(this.node.isDropped)textHeightOffset = this.getTextSize();
        h+=textHeightOffset;
        var vertexStyle = this.node.getVertexStyle();
        if(this.node.isDropped)vertexStyle = vertexStyle.replace("resizable=0","resizable=1");
        this.vertex=this.graph.insertVertex(this.graph.getDefaultParent(),null,'',x,y,width,h,vertexStyle);
        this.vertex.isNode=true;
        this.vertex.node=this.node;
        var left = 0;
        if(this.addRightIcon()){width-=this.righticonnode.w()+2*defaultIconPadding;}
        if(this.addLeftIcon()){left+=this.lefticonnode.w()+2*defaultIconPadding;width-=this.lefticonnode.w()+2*defaultIconPadding;}
        var name = LANGUAGE_TEXT.node.defaulttext[USER_LANGUAGE];
        if(this.node.name)name=this.node.name;
        this.namenode = this.graph.insertVertex(this.vertex,null,name,defaultNamePadding,10,this.vertex.w()-2*defaultNamePadding,minCellHeight,defaultNameStyle+"labelWidth="+width+";");
        this.graph.orderCells(true,[this.namenode]);
        var node = this.node;
        this.namenode.valueChanged = function(value){
            var value1 = node.setNameSilent(value);
            if(value1!=value)node.view.graph.getModel().setValue(node.view.namenode,value1);
            else mxCell.prototype.valueChanged.apply(this,arguments);
        }
        var text = '';
        if(this.node.text)text = this.node.text;
        h=1;
        if(this.node.isDropped)h+=this.node.textHeight;
        this.textnode = this.graph.insertVertex(this.vertex,null,text,defaultTextPadding,this.namenode.b()-10,this.vertex.w()-2*defaultTextPadding,h+10,defaultTextStyle);
        var dropDownStyle = defaultDropDownStyle;
        if(this.node.isDropped)dropDownStyle+="image="+iconpath+"droptriangleup.svg;fontColor=white;";
        else dropDownStyle+="image="+iconpath+"droptriangledown.svg;fontColor=black;";
        var dropText='';
        if(text!=null&&text.replace(/(<p\>|<\/p>|<br>|\n| |[^a-zA-Z0-9])/g,'')!='')dropText='...';
        this.dropNode = this.graph.insertVertex(this.vertex,null,dropText,defaultDropPadding,this.textnode.b()-11+cellDropdownPadding,this.vertex.w()-2*defaultDropPadding,cellDropdownHeight-defaultDropPadding,dropDownStyle);
        this.dropNode.isDrop = true;
        this.dropNode.node = this.node;
        var linkStyle = defaultLinkIconStyle;
        if(node.linkedWF!=null)linkStyle+="image="+iconpath+"wflink.svg;";
        this.linkIcon = this.graph.insertVertex(this.dropNode,null,'',this.dropNode.r()-24,2,16,16,linkStyle);
        var timeadj = 0;
        if(window.navigator.userAgent.match("Chrome"))timeadj=-2;
        this.timeNode = this.graph.insertVertex(this.vertex,null,this.node.getTimeString(),this.dropNode.x(),this.dropNode.y()+timeadj,this.dropNode.w()-28,this.dropNode.h(),defaultTimeStyle);
        this.timeNode.isDrop=true;
        this.timeNode.node = this.node;
        this.tagBoxDiv = document.createElement('div');
        this.tagBoxDiv.className = "tagboxdiv";
        this.node.wf.view.container.appendChild(this.tagBoxDiv);
        this.tagPreview = this.graph.insertVertex(this.vertex,null,'',tagBoxPadding+this.vertex.w(),0,tagHeight,tagHeight,defaultTagPreviewStyle+this.node.getColumnStyle());
        this.tagPreview.cellOverlays=[];
        this.tagPreview.isTagPreview=true;
        this.tagPreview.node=this.node;
        if(this.node.tags.length<1)this.graph.toggleCells(false,[this.tagPreview]);
        this.vertex.cellOverlays=[];
        this.addPlusOverlay();
        this.addDelOverlay();
        this.addCopyOverlay();
        this.vertex.setConnectable(true);
    }
    
    nameUpdated(){
        this.graph.cellLabelChanged(this.namenode,this.node.name);
    }

    textUpdated(){
        var text = this.node.text;
        this.graph.cellLabelChanged(this.textnode,text);
        if(text!=null&&text.replace(/(<p\>|<\/p>|<br>|\n| |[^a-zA-Z0-9])/g,'')!='')this.graph.cellLabelChanged(this.dropNode,'...');
        else this.graph.cellLabelChanged(this.dropNode,'');
        if(this.node.isDropped)this.updateSize();
    }
    
    addRightIcon(){
        if(this.node.getIconCategory("right")){
            var style = defaultIconStyle;
            if(this.node.righticon){
                style+="image="+iconpath+this.node.righticon+".svg;";
                this.node.wf.view.legendUpdate(this.node.getIconCategory("right"),this.node.righticon,null);
            }
            this.righticonnode = this.graph.insertVertex(this.vertex,null,'',this.vertex.w()-defaultIconWidth-defaultIconPadding,8,defaultIconWidth,minCellHeight,style);
            return true;
        }
        return false;
        
    }
    addLeftIcon(){
        if(this.node.getIconCategory("left")){
            var style = defaultIconStyle;
            if(this.node.lefticon){
                style+="image="+iconpath+this.node.lefticon+".svg;";
                this.node.wf.view.legendUpdate(this.node.getIconCategory("left"),this.node.lefticon,null);
            }
            this.lefticonnode = this.graph.insertVertex(this.vertex,null,'',defaultIconPadding,8,defaultIconWidth,minCellHeight,style);
            return true;
        }
        return false;
    }
    
    leftIconUpdated(oldvalue){
        var newvalue = this.node.lefticon;
        this.node.wf.view.legendUpdate(this.node.getIconCategory("left"),newvalue,oldvalue);
        if(newvalue!=null)this.graph.setCellStyles("image",iconpath+newvalue+".svg",[this.lefticonnode]);
        else this.graph.setCellStyles("image",null,[this.lefticonnode]);
    }
    
    rightIconUpdated(oldvalue){
        var newvalue = this.node.righticon;
        this.node.wf.view.legendUpdate(this.node.getIconCategory("right"),newvalue,oldvalue);
        if(newvalue!=null)this.graph.setCellStyles("image",iconpath+newvalue+".svg",[this.righticonnode]);
        else this.graph.setCellStyles("image",null,[this.righticonnode]);
    }

    linkedWFUpdated(value,oldvalue){
        if(value&&!oldvalue){
            this.graph.setCellStyles("image",iconpath+"wflink.svg",[this.linkIcon]);
        }
        else if(oldvalue&&!value){
            this.graph.setCellStyles("image",null,[this.linkIcon]);
        }
    }
    
    moveNode(dx,dy){
        this.graph.moveCells([this.vertex],dx,dy);
        for(var i=0;i<this.node.brackets.length;i++){this.node.brackets[i].view.updateVertical();}
        this.tagBoxDiv.style.display="none";
    }
    
    columnUpdated(){
        this.graph.moveCells([this.vertex],this.node.wf.view.getColPos(this.node.column)-this.vertex.w()/2-this.vertex.x(),0);
        this.styleForColumn();
        for(var i=0;i<this.node.tags.length;i++)this.node.tags[i].tag.view.updateDrops();
    }
    
    styleForColumn(){
        var colstyle = this.node.getColumnStyle();
        this.graph.setCellStyles("fillColor",colstyle,[this.vertex]);
        this.tagBoxDiv.style.border = "3px solid "+colstyle;
        this.graph.setCellStyles("strokeColor",colstyle,[this.tagPreview]);
    }
    
    makeFlushWithAbove(index,column=null){
        if(index==0) this.moveNode(0,this.node.week.view.vertex.y()+cellSpacing-this.vertex.y());
        else {
            var nodes;
            if(column==null)nodes = this.node.week.nodes;
            else nodes=this.node.week.nodesByColumn[column];
            this.moveNode(0,nodes[index-1].view.vertex.b()+cellSpacing-this.vertex.y());
        }
    }
    
    vertexResized(dy){
        this.resizeChild(this.textnode,dy);
        this.graph.moveCells([this.dropNode],0,dy);
        this.graph.moveCells([this.timeNode],0,dy);
        this.node.week.view.nodeResized(this.node,dy);
        for(var i=0;i<this.node.brackets.length;i++){this.node.brackets[i].view.updateVertical();}
        
    }
    
    resizeChild(box,dy){
        var rect = new mxRectangle(box.x(),box.y(),box.w(),box.h()+dy);
        this.graph.resizeCells([box],[rect]);
    }
    
    dropDownToggled(){
        this.updateSize(!this.node.isDropped);
        //this.graph.setCellStyles('resizable',1-this.node.isDropped,[this.vertex]);
        if(this.node.isDropped){
            this.graph.setCellStyles('image',iconpath+"droptriangledown.svg",[this.dropNode]);
            this.graph.setCellStyles('fontColor','black',[this.dropNode]);
        }else {
            this.graph.setCellStyles('image',iconpath+"droptriangleup.svg",[this.dropNode]);
            this.graph.setCellStyles('fontColor','white',[this.dropNode]);
        }
        
    }
    
    updateSize(isDropped=this.node.isDropped){
        var y = 0;
        if(isDropped)y=this.getTextSize();
        this.graph.resizeCell(this.vertex,new mxGeometry(this.vertex.x(),this.vertex.y(),this.vertex.w(),minCellHeight+cellDropdownHeight+cellDropdownPadding+y));
    }
    
    getTextSize(){
        var tempdiv = document.createElement('div');
        tempdiv.innerHTML = this.node.text;
        tempdiv.style.width=defaultCellWidth+"px";
        tempdiv.style.padding="5px";
        tempdiv.style.boxSizing="border-box";
        tempdiv.classList.add("tempdropdiv");
        $('body')[0].appendChild(tempdiv);
        var rect = tempdiv.getBoundingClientRect();
        tempdiv.parentElement.removeChild(tempdiv);
        var y = rect.height;
        console.log(tempdiv.innerHTML);
        this.node.textHeight = y;
        return y;
    }
    
    insertBelow(node){
        node.view = new this.constructor(this.graph,node);
        node.view.insertedBelow(this.node);
    }
    
    insertedBelow(node){
        this.createVertex(node.view.vertex.x(),node.view.vertex.y());
    }
    
    fillTags(){
        var node = this.node;
        for(var i=0;i<node.tags.length;i++){
            node.view.tagAdded(node.tags[i],false);
        }
    }
    
    deleted(){
        this.graph.removeCells([this.vertex]);
    }
    
    
    addPlusOverlay(){
        var n = this.node;
        var overlay = new mxCellOverlay(new mxImage(iconpath+'add.svg', 24, 24), LANGUAGE_TEXT.node.createbelow[USER_LANGUAGE]);
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.x = pt.x+n.view.vertex.w()/2 - bounds.width;
            return bounds;
        };
        var graph = this.graph;
        overlay.cursor = 'pointer';
        overlay.addListener(mxEvent.CLICK, function(sender, plusEvent){
            graph.clearSelection();
            n.insertBelow();
        });
        this.vertex.cellOverlays.push(overlay);
        //this.graph.addCellOverlay(this.vertex, overlay);
    }
    
    //Add the overlay to delete the node
    addDelOverlay(){
        var n = this.node;
        var overlay = new mxCellOverlay(new mxImage(iconpath+'delrect.svg', 24, 24), LANGUAGE_TEXT.node.delete[USER_LANGUAGE]);
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.y = pt.y-n.view.vertex.h()/2;
            bounds.x = pt.x-bounds.width+n.view.vertex.w()/2;
            return bounds;
        }
        var graph = this.graph;
        overlay.cursor = 'pointer';
        overlay.addListener(mxEvent.CLICK, function(sender, plusEvent){
            if(mxUtils.confirm(LANGUAGE_TEXT.confirm.deletenode[USER_LANGUAGE])){
                graph.clearSelection();
                n.deleteSelf();
                n.wf.updated("Delete Node",n);
            }
        });
        this.vertex.cellOverlays.push(overlay);
        //n.graph.addCellOverlay(n.vertex, overlay);
    }
    
    addCopyOverlay(){
        var n = this.node;
        var overlay = new mxCellOverlay(new mxImage(iconpath+'copy.svg', 24, 24), LANGUAGE_TEXT.node.duplicate[USER_LANGUAGE]);
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.x = pt.x-bounds.width+n.view.vertex.w()/2;
            bounds.y = pt.y-n.view.vertex.h()/2+24;
            return bounds;
        };
        var graph = this.graph;
        overlay.cursor = 'pointer';
        overlay.addListener(mxEvent.CLICK, function(sender, plusEvent){
            graph.clearSelection();
            n.duplicateNode();
        });
        this.vertex.cellOverlays.push(overlay);
        //this.graph.addCellOverlay(this.vertex, overlay);
    }
    
    
    
    
    tagAdded(nodeTag,show){
        this.graph.toggleCells(true,[this.tagPreview]);
        nodeTag.view = new NodeTagView(nodeTag);
        nodeTag.view.makeVertex(this.tagBoxDiv);
        if(show)nodeTag.view.positionSelf();
        this.graph.cellLabelChanged(this.tagPreview,""+this.node.tags.length);
        this.toggleTags(show);
    }
    
    tagRemoved(nodeTag){
        var tag = nodeTag.tag;
        if(nodeTag.view){nodeTag.view.removed();}
        if(tag.view)tag.view.removeNode(nodeTag);
        if(this.node.tags.length<1){this.graph.toggleCells(false,[this.tagPreview]);this.toggleTags(false);}
        this.graph.cellLabelChanged(this.tagPreview,this.node.tags.length);
    }
    
    toggleTags(show){
        this.graph.toggleCells(show,[this.tagBox]);
        if(show){
            this.tagBoxDiv.style.display = "inline-block";
            this.tagBoxDiv.style.left = this.vertex.r()-1+tagBoxPadding+"px";
            this.tagBoxDiv.style.top = this.vertex.y()-1+"px";
            this.sortTags();
        }else{
            this.tagBoxDiv.style.display = "none";
        }
    }
    
    sortTags(){
        console.log("Sorting");
        var allTags = [];
        for(var i=0;i<this.node.wf.tagSets.length;i++)allTags = this.node.wf.tagSets[i].getAllID(allTags);
        var nodeList = this.tagBoxDiv.childNodes;
        var arr = [].slice.call(nodeList);
        arr.sort(function(a,b){
            try{
                var tagA = a.button.layout.id;
                var tagB = b.button.layout.id;
                return allTags.indexOf(tagA)-allTags.indexOf(tagB);
                
            }catch(err){
                console.log("THERE WAS AN ERROR SORTING TAGS");
                return 0;
            }
            
        });
        for(var i=0;i<arr.length;i++){
            this.tagBoxDiv.appendChild(arr[i]);
        }
    }
    
    
    
    highlight(on){
        var gstate = this.graph.view.getState(this.vertex);
        if(gstate==null)return;
        var g = gstate.shape.node;
        if(g.firstChild!=null){
            if(on)g.firstChild.classList.add("highlighted");
            else g.firstChild.classList.remove("highlighted");
        }
    }
    
    mouseIn(){
        var node = this.node;
        this.graph.orderCells(false,[this.vertex]);
        for(var i=0;i<node.fixedLinksOut.length;i++){
            node.fixedLinksOut[i].view.highlight(true,"yellow");
        }
    }
    
    mouseOut(){
        var node = this.node;
        for(var i=0;i<node.fixedLinksOut.length;i++){
            node.fixedLinksOut[i].view.highlight(false,"yellow");
        }
    }
    
    selected(){
        var node = this.node;
        for(var i=0;i<node.fixedLinksOut.length;i++){
            node.fixedLinksOut[i].view.select(true);
        }
    }
    
    deselected(){
        var node = this.node;
        for(var i=0;i<node.fixedLinksOut.length;i++){
            node.fixedLinksOut[i].view.select(false);
        }
    }
    
    populateMenu(menu){
        var node=this.node;
        menu.addItem(LANGUAGE_TEXT.node.showhide[USER_LANGUAGE],iconpath+'view.svg',function(){node.toggleDropDown();});
        node.populateMenu(menu);
    }
    
    
    
    fixedLinkAdded(link,edge){
        link.view = new WFLinkview(this.graph,link);
        link.view.vertex=edge;
        if(edge==null)link.redraw();
        else{
            link.view.addValuesToVertex();
        }
        if(link.id)link.view.addDelOverlay();
    }
    
    startTitleEdit(){
        this.graph.startEditingAtCell(this.namenode);
    }
    
    timeUpdated(){
        this.graph.cellLabelChanged(this.timeNode,this.node.getTimeString());
    }
    
    addError(error){
        if(this.errorVertices==null)this.errorVertices=[];
        var vertex = this.graph.insertVertex(this.vertex,null,'',8,8,24,24,defaultWarningStyle+"image="+iconpath+"validationerror.svg;");
        this.errorVertices.push(vertex);
        vertex.getTooltip = function(){console.log("tooltip");return error.text;}
        error.vertex=vertex;
        
        var gstate = this.graph.view.getState(vertex);
        try{
            var g = gstate.shape.node;
            g.classList.add("warningquestionmark");
        }catch(err){}
    }
    
    removeError(error){
        if(error.vertex&&this.errorVertices.indexOf(error.vertex)>=0){
            this.graph.removeCells([error.vertex]);
            this.errorVertices.splice(this.errorVertices.indexOf(error.vertex),1);
            error.vertex=null;
        }
    }

    
}


class WFLinkview{
    constructor(graph,link){
        this.link=link;
        this.graph=graph;
        this.vertex;
        
        this.tagBoxDiv = document.createElement('div');
        this.tagBoxDiv.className = "tagboxdiv";
        this.tagBoxDiv.style.border = "3px solid black";
        this.link.wf.view.container.appendChild(this.tagBoxDiv);
    }
    
    getPortStyle(){
        if(this.vertex!=null){
            var portStyle = "";
            var styleString = this.vertex.style;
            var spi = styleString.indexOf("sourcePort");
            if(spi>=0)portStyle+=styleString.substring(spi,styleString.indexOf(";",spi)+1);
            var tpi = styleString.indexOf("targetPort");
            if(tpi>=0)portStyle+=styleString.substring(tpi,styleString.indexOf(";",tpi)+1);
            return portStyle;
        }
    }
    
    populateMenu(menu){
        var graph = this.graph;
        var p = this.link.node.wf.project;
        var link=this.link;
        menu.addItem('Edit label', iconpath+'text.svg', function(){
				graph.startEditingAtCell(link.view.vertex);
        });
        menu.addItem('Toggle Dashed',iconpath+'dashed.svg',function(){
            if(link.style!="dashed")link.changeStyle("dashed"); 
            else(link.changeStyle(null));
        });
        menu.addItem('Delete Link',iconpath+'delrect.svg',function(){
            if(mxUtils.confirm("Delete this link?")){
                graph.clearSelection();
                link.deleteSelf();
                link.node.wf.updated("Delete Link",link);
            }
        });
    }
    
    addValuesToVertex(){
        var link = this.link;
        this.vertex.isLink = true;
        this.vertex.link = link;
        
        this.vertex.valueChanged = function(value){
            var value1 = link.setTextSilent(value);
            if(value1!=value)link.view.graph.getModel().setValue(link.view.vertex,value1);
            else mxCell.prototype.valueChanged.apply(this,arguments);
        }
        
        //Adding the tag preview
        this.tagPreview = this.graph.insertVertex(this.vertex,null,this.link.tags.length+"",tagBoxPadding+this.vertex.w(),0,tagHeight,tagHeight,defaultTagPreviewStyle+"strokeColor=black;");
        
        this.tagPreview.cellOverlays=[];
        this.tagPreview.isTagPreview=true;
        this.tagPreview.node=this.link;
        this.graph.orderCells(false,[this.tagPreview]);
        this.graph.toggleCells(false,[this.tagPreview]);
        if(this.link.tags.length<1)this.graph.toggleCells(false,[this.tagPreview]);
    }
    
    redraw(){
        var link = this.link;
        if(this.vertex!=null){this.graph.removeCells([this.vertex]);}
        else(this.fillTags());
        if(link.id==null)return;
        var style = defaultEdgeStyle;
        switch(link.style){
            case "dashed":
                style+="dashed=1;";
                break;
        }
        style += link.getPortStyle();
        this.vertex = this.graph.insertEdge(this.graph.getDefaultParent(),null,link.text,link.node.view.vertex,link.targetNode.view.vertex,style);
        if(link.labelx!=null){
            this.vertex.geometry.y=0;
            this.vertex.geometry.x=link.labelx;
            this.vertex.valueChanged(link.text);
        }
        
        
        this.addValuesToVertex();
    }
    
    //Add the overlay to delete the node
    addDelOverlay(){
        var graph = this.graph;
        if(this.vertex.cellOverlays==null)this.vertex.cellOverlays=[];
        var n = this.link;
        var overlay = new mxCellOverlay(new mxImage(iconpath+'delrect.svg', 12, 12), 'Delete this link');
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var edgestate = graph.view.getState(n.view.vertex)
            var x = edgestate.absolutePoints[0].x-bounds.width/2;
            var y = edgestate.absolutePoints[0].y-bounds.height/2;
            var dirx = edgestate.absolutePoints[1].x - edgestate.absolutePoints[0].x;
            if(dirx>0)dirx=1;
            else if(dirx<0)dirx=-1;
            var diry = edgestate.absolutePoints[1].y - edgestate.absolutePoints[0].y;
            if(diry>0)diry=1;
            else if(diry<0)diry=-1;
            x = x+(bounds.width/2+2)*dirx;
            y = y+(bounds.height/2+2)*diry;
            
            bounds.y = y;
            bounds.x = x;
            return bounds;
        }
        overlay.cursor = 'pointer';
        overlay.addListener(mxEvent.CLICK, function(sender, plusEvent){
            graph.clearSelection();
            n.deleteSelf();
            n.node.wf.updated("Delete Link",n);
        });
        this.vertex.cellOverlays.push(overlay);
        //n.graph.addCellOverlay(n.vertex, overlay);
    }
    
    mouseIn(){
        if(this.link.wf.settings.settingsKey.linktagging.value && this.vertex&&this.tagPreview){
           // this.graph.orderCells(false,[this.vertex]);
            
            var edgestate = this.graph.view.getState(this.vertex);
            var point = this.findMidpoint(edgestate);
            point.y -= tagHeight/2
            var length = this.getLength(edgestate);
            var xoffset = -tagHeight/2;
            if(length<=20)xoffset=6;
            point.x+=xoffset;
            this.graph.moveCells([this.tagPreview],point.x-this.tagPreview.x(),point.y-this.tagPreview.y());
            this.tagBoxDiv.style.left=(point.x-1)+"px";
            this.tagBoxDiv.style.top=(point.y-1)+"px";
            if(this.link.tags.length>0)this.graph.toggleCells(true,[this.tagPreview]);
        }
    }
    
    findMidpoint(edgestate){
        if(edgestate==null)edgestate = this.graph.view.getState(this.vertex);
        var length = this.getLength(edgestate);
        var current = 0;
        var p1=edgestate.absolutePoints[0];
        for(var i=1;i<edgestate.absolutePoints.length;i++){
            var p2 = edgestate.absolutePoints[i];
            var seglength = this.getSegmentLength(p1,p2);
            if(current+seglength>=length/2){
                var remainder = (length/2-current)/seglength;
                var x = p1.x+remainder*(p2.x-p1.x);
                var y = p1.y+remainder*(p2.y-p1.y);
                return {x:x,y:y};
            }
            current+=seglength;
            p1=p2;
        }
        return {x:0,y:0};
    }
    
    getLength(edgestate){
        if(edgestate==null)edgestate = this.graph.view.getState(this.vertex);
        var length=0;
        for(var i=1;i<edgestate.absolutePoints.length;i++){
            length += this.getSegmentLength(edgestate.absolutePoints[i-1],edgestate.absolutePoints[i]);
        }
        return length;
    }
    
    getSegmentLength(p1,p2){
        return Math.abs(p1.x-p2.x)+Math.abs(p1.y-p2.y);
    }
    
    mouseOut(){
        this.graph.toggleCells(false,[this.tagPreview]);
        this.toggleTags(false);
        
    }
    
    deleted(){
        this.graph.removeCells([this.vertex]);
    }
    
    highlight(on,style=""){
        var gstate = this.graph.view.getState(this.vertex);
        if(gstate==null)return;
        var g = gstate.shape.node;
        if(g.firstChild!=null){
            for(var i=0;i<g.childNodes.length;i++){
                if(on)g.childNodes[i].classList.add("highlighted"+style);
                else g.childNodes[i].classList.remove("highlighted"+style);
            }
        }
    }
    
    pathHighlight(on,tag){
        var path = this.link.validateTag(tag);
        this.highlightPath(path,on);
    }
    
    highlightPath(path,on){
        console.log("HIGHLIGHTING THIS PATH");
        if(on){
            if(path.found){
                path.link.view.highlight(true,"green");
                for(var i=0;i<path.subPaths.length;i++){
                    if(path.subPaths[i].found)this.highlightPath(path.subPaths[i],on)
                }
            }else if(path.valid){
                path.link.view.highlight(true,"greendashed");
                for(var i=0;i<path.subPaths.length;i++){
                    if(path.subPaths[i].tagsfound.length>0){
                        path.subPaths[i].valid=true;
                        this.highlightPath(path.subPaths[i],on);
                    }
                }
            }else{
                if(path.tagsfound.length>0){
                    path.link.view.highlight(true,"yellowdashed");
                    for(var i=0;i<path.subPaths.length;i++){
                        if(path.subPaths[i].tagsfound.length>0){
                            this.highlightPath(path.subPaths[i],on);
                        }
                    }
                }else{
                    path.link.view.highlight(true,"red");
                }
            }
        }else{
            path.link.view.highlight(false,"green");
            path.link.view.highlight(false,"greendashed");
            path.link.view.highlight(false,"yellowdashed");
            path.link.view.highlight(false,"red");
            for(var i=0;i<path.subPaths.length;i++){
                this.highlightPath(path.subPaths[i],on);
            }
        }
    }
    
    
    select(on){
        var gstate = this.graph.view.getState(this.vertex);
        if(gstate==null)return;
        var g = gstate.shape.node;
        if(g.firstChild!=null){
            for(var i=0;i<g.childNodes.length;i++){
                if(on)g.childNodes[i].classList.add("selected");
                else g.childNodes[i].classList.remove("selected");
            }
        }
    }
    
    tagAdded(nodeTag,show){
        this.graph.toggleCells(true,[this.tagPreview]);
        nodeTag.view = new NodeTagView(nodeTag);
        nodeTag.view.makeVertex(this.tagBoxDiv);
        if(show)nodeTag.view.positionSelf();
        if(this.tagPreview)this.graph.cellLabelChanged(this.tagPreview,""+this.link.tags.length);
        this.toggleTags(show);
    }
    
    tagRemoved(nodeTag){
        var tag = nodeTag.tag;
        if(nodeTag.view){nodeTag.view.removed();}
        if(tag.view)tag.view.removeNode(this.link);
        if(this.link.tags.length<1){this.graph.toggleCells(false,[this.tagPreview]);this.toggleTags(false);}
        this.graph.cellLabelChanged(this.tagPreview,this.link.tags.length);
    }
    
    toggleTags(show){
        this.graph.toggleCells(show,[this.tagBox]);
        if(show&&this.tagPreview.visible){
            this.tagBoxDiv.style.display = "inline-block";
            this.sortTags();
        }else{
            this.tagBoxDiv.style.display = "none";
        }
    }
    
    sortTags(){
        console.log("Sorting");
        var allTags = [];
        for(var i=0;i<this.link.wf.tagSets.length;i++)allTags = this.link.wf.tagSets[i].getAllID(allTags);
        var nodeList = this.tagBoxDiv.childNodes;
        var arr = [].slice.call(nodeList);
        arr.sort(function(a,b){
            try{
                var tagA = a.button.layout.id;
                var tagB = b.button.layout.id;
                return allTags.indexOf(tagA)-allTags.indexOf(tagB);
                
            }catch(err){
                console.log("THERE WAS AN ERROR SORTING TAGS");
                return 0;
            }
            
        });
        for(var i=0;i<arr.length;i++){
            this.tagBoxDiv.appendChild(arr[i]);
        }
    }
    
    fillTags(){
        var link = this.link;
        for(var i=0;i<link.tags.length;i++){
            link.view.tagAdded(link.tags[i],false);
        }
    }
    
    
    
}

class WFAutolinkview extends WFLinkview{
    populateMenu(menu){
        var graph = this.graph;
        var p = this.link.node.wf.project;
        var link=this.link;
        menu.addItem('Delete Link',iconpath+'delrect.svg',function(){
            if(mxUtils.confirm("This is the automatically generated link for this node. If deleted, this will prevent the node from automatically linking to that below it. Do you want to proceed?")){
                graph.clearSelection();
                link.deleteSelf();
                link.node.wf.updated("Delete Link",link);
            }
        });
    }
    
    //Add the overlay to delete the node
    addDelOverlay(){
        if(this.vertex.cellOverlays==null)this.vertex.cellOverlays=[];
        var n = this.link;
        var overlay = new mxCellOverlay(new mxImage(iconpath+'delrect.svg', 24, 24), 'Delete this link');
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var edgestate = graph.view.getState(n.view.vertex)
            var x = edgestate.absolutePoints[0].x-bounds.width/2;
            var y = edgestate.absolutePoints[0].y-bounds.height/2;
            var dirx = edgestate.absolutePoints[1].x - edgestate.absolutePoints[0].x;
            if(dirx>0)dirx=1;
            else if(dirx<0)dirx=-1;
            var diry = edgestate.absolutePoints[1].y - edgestate.absolutePoints[0].y;
            if(diry>0)diry=1;
            else if(diry<0)diry=-1;
            x = x+(bounds.width/2+2)*dirx;
            y = y+(bounds.height/2+2)*diry;
            
            bounds.y = y;
            bounds.x = x;
            return bounds;
        }
        var graph = this.graph;
        overlay.cursor = 'pointer';
        overlay.addListener(mxEvent.CLICK, function(sender, plusEvent){
            if(mxUtils.confirm("This is the automatically generated link for this node. If deleted, this will prevent the node from automatically linking to that below it. Do you want to proceed?")){
                graph.clearSelection();
                n.deleteSelf();
                n.node.wf.updated("Delete Link",n);
            }
        });
        this.vertex.cellOverlays.push(overlay);
        //n.graph.addCellOverlay(n.vertex, overlay);
    }
}

class NodeTagView{
    constructor(nodeTag,vertex){
        this.nodeTag=nodeTag;
    }
    
    makeVertex(container){
        this.vertex = this.nodeTag.tag.view.addNode(this.nodeTag,container);
        this.updateVertex();
    }
    
    updateVertex(){
        var completeness = this.nodeTag.degree;
        var str = "";
        if(this.nodeTag.node.wf.settings.settingsKey.advancedoutcomes.value && (completeness & 1) == 0){
            this.vertex.csvtext="";
            if(completeness & 2){str+="<div class='firstoutcomelevel'>"+"I"+"</div>";}
            if(completeness & 4){str+="<div class='secondoutcomelevel'>"+"D"+"</div>";}
            if(completeness & 8){str+="<div class='thirdoutcomelevel'>"+"A"+"</div>";}
        }else{
            str="<img src='"+iconpath+"check.svg'>";
        }
        if(this.vertex){
            this.vertex.updateButton(str,completeness);
        }
    }
    
    removed(){
        if(this.vertex)this.vertex.bdiv.parentElement.removeChild(this.vertex.bdiv);
    }
    
    positionSelf(){
        var buttons = this.vertex.bdiv.parentElement.childNodes;
        if(buttons.length<2)return;
        var allTags = [];
        for(var i=0;i<this.nodeTag.node.wf.tagSets.length;i++){
            this.nodeTag.node.wf.tagSets[i].getAllID(allTags);
        }
        var myIndex = allTags.indexOf(this.nodeTag.tag.id);
        for(var i=0;i<buttons.length;i++){
            var button = buttons[i].button;
            var tagID;
            if(button)tagID = button.layout.id;
            var tagIndex = allTags.indexOf(tagID);
            if(tagIndex>myIndex){
                this.vertex.bdiv.parentElement.insertBefore(this.vertex.bdiv,button.bdiv);
                break;
            }
            
        }
    }
}
