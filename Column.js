//Defines columns and their headings

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

class Column {
    constructor(wf,name){
        this.name=name;
        this.text;
        this.nodetext;
        this.image;
        this.colour;
        this.wf=wf;
        this.view;
        this.outcomeVisibility;
        if(name!=null)this.setDefaultValues(name);
        
    }
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.name,"columnname");
        if(this.name.substr(0,3)=="CUS"||this.image!=columnValues[this.name].image)xml+=makeXML(this.image,"columnimage");
         if(this.name.substr(0,3)=="CUS"||this.colour!=columnValues[this.name].colour)xml+=makeXML(this.colour,"columncolour");
        if(this.name.substr(0,3)=="CUS"||this.text!=LANGUAGE_TEXT.column[this.name].text[USER_LANGUAGE])xml+=makeXML(this.text,"columntext",true);
        if(this.name.substr(0,3)=="CUS"||this.nodetext!=LANGUAGE_TEXT.column[this.name].nodetext[USER_LANGUAGE])xml+=makeXML(this.nodetext,"columnnodetext",true);
        if((this.name=="SA"||(name.substr(0,3)=="CUS"&&this.wf instanceof Programflow))!=this.outcomeVisibility)xml+=makeXML(""+this.outcomeVisibility,"columnoutcomevisibility");
        return makeXML(xml,"column");
    }
    
    toJSON(json){
        json.column.push({id:this.name,workflow:this.wf.id,title:this.nodetext,icon:this.image,colour:this.colour});
    }
    
    fromXML(xml){
        var name = getXMLVal(xml,"columnname");
        this.setName(name);
        this.setDefaultValues(name);
        var text = getXMLVal(xml,"columntext",true);
        var nodetext = getXMLVal(xml,"columntext",true);
        var colour = getXMLVal(xml,"columncolour");
        var outcomeVisibility = getXMLVal(xml,"columnoutcomevisibility");
        if(outcomeVisibility=="false")this.outcomeVisibility=false;
        else if(outcomeVisibility=="true")this.outcomeVisibility=true;
        if(text)this.text=text;
        if(nodetext)this.nodetext=nodetext;
        if(colour)this.colour=colour;
        var image = getXMLVal(xml,"columnimage");
        if(image)this.image=image;
        
    }
    
    setDefaultValues(name){
        if(name=="SA"||(name.substr(0,3)=="CUS"&&this.wf instanceof Programflow))this.outcomeVisibility=true;
        if(name.substr(0,3)!="CUS"){
            this.text=LANGUAGE_TEXT.column[name].text[USER_LANGUAGE];
            this.nodetext=LANGUAGE_TEXT.column[name].nodetext[USER_LANGUAGE];
            this.image=columnValues[name].image;
            this.colour=columnValues[name].colour;
        }else{
            if(this.wf instanceof Programflow){
                this.text = LANGUAGE_TEXT.column['CUSP'].text[USER_LANGUAGE]+" "+name.substr(3);
                this.nodetext = LANGUAGE_TEXT.column['CUSP'].nodetext[USER_LANGUAGE];
                this.image=columnValues['CUSP'].image;
                this.colour=columnValues['CUSP'].colour;
            }else{
                this.text =  LANGUAGE_TEXT.column['CUS'].text[USER_LANGUAGE]+" "+name.substr(3);
                this.nodetext = LANGUAGE_TEXT.column['CUS'].nodetext[USER_LANGUAGE];
                this.image=columnValues['CUS'].image;
                this.colour=columnValues['CUS'].colour;
            }
        }
        
    }
    
    setName(name){
        this.name=name;
    }
    
    setImage(img){
        this.image = img;
        if(this.view)this.view.imageUpdated();
    }
    
    setTextSilent(text){
        if(text!=null && text!=""){
            text = text.replace(/\n\n/g,"\n").replace(/\n$/g,"").replace(/^\n/g,"");
            this.text=text;
            if(this.name.substr(0,3)=='CUS'){this.setNodeText(text);}
            return text;
        }else{
            return this.text;
        }
        
    }
    
    setText(text){
        text = this.setTextSilent(text);
        if(this.view)this.view.textChanged();
    }
    
    setNodeText(nodetext){
        this.nodetext=nodetext;
        if(this.view)this.view.nodeTextChanged();
    }
    
    setColour(colour){
        this.colour=colour;
        if(this.view)this.view.colourUpdated();
    }
    
    
    deleteSelf(){
        this.wf.removeColumn(this);
        if(this.view)this.view.deleted();
    }
    
    setVisible(isVisible){
        this.outcomeVisibility=isVisible;
        if(this.view)this.view.visibilityChanged();
    }
    
    populateMenu(menu){
        var col = this;
        if(col.name.substr(0,3)=='CUS')this.populateIconMenu(menu,iconsList['column']);
        menu.addItem(LANGUAGE_TEXT.column.delete[USER_LANGUAGE],iconpath+'delrect.svg',function(){
            if(col.wf.columns.length==1)alert(LANGUAGE_TEXT.column.deletelast[USER_LANGUAGE]);
            else if(mxUtils.confirm(LANGUAGE_TEXT.confirm.deletecolumn[USER_LANGUAGE])){
                col.deleteSelf();
                col.wf.updated("Delete Column",col);
            }
        });
        if(col.name.substr(0,3)=='CUS')menu.addItem(LANGUAGE_TEXT.column.colourpicker[USER_LANGUAGE],iconpath+'spectrum.svg', function(){
            var input = document.createElement('input');
            input.className = "jscolor";
            input.type="color";
            input.value = col.colour;
            input.addEventListener('change',function(){
                col.setColour(input.value);
            });
            input.click();
        });
        
        menu.addItem(LANGUAGE_TEXT.workflowview.whatsthis[USER_LANGUAGE],iconpath+'info.svg',function(){
            p.showHelp('columnhelp.html');
        });
    }
    
    
    populateIconMenu(menu,iconArray){
        var col = this;
        if(iconArray==null||iconArray.length==0)return;
        var sub = menu.addItem(LANGUAGE_TEXT.column.icon[USER_LANGUAGE],iconpath+'lefticon.svg');
        for(var i=0;i<iconArray.length;i++){
            var tempfunc = function(value){
                menu.addItem(value.text[USER_LANGUAGE],iconpath+value.value+'.svg',function(){
                    col.setImage(value.value);
                },sub);
            }
            tempfunc(iconArray[i]);
        }
    }
    
}

