//Definition of global variables and functions for ease of use.

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


//A few logistical functions to more quickly grab the dimensions and sides of a cell
mxCell.prototype.x = function(){return this.getGeometry().x;}
mxCell.prototype.y = function(){return this.getGeometry().y;}
mxCell.prototype.w = function(){return this.getGeometry().width;}
mxCell.prototype.h = function(){return this.getGeometry().height;}
mxCell.prototype.r = function(){return this.x()+this.w();}
mxCell.prototype.b = function(){return this.y()+this.h();}
mxCell.prototype.resize = function(graph,dx,dy){
    graph.resizeCells([this],[new mxRectangle(this.x(),this.y(),this.w()+dx,this.h()+dy)]);
}
//Makes a function activate the start load first, then run asynchronously. Useful for things that take a lot of time.
function makeLoad(toLoad){
    startLoad();
    setTimeout(function(){toLoad();endLoad();},20);
}
function startLoad(){
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '* {cursor:wait !important;}';
    style.id = "waitingStyle";
    document.getElementsByTagName("head")[0].appendChild(style);

}
function endLoad(){
    var style = document.getElementById("waitingStyle");
    if(style!=null)style.parentElement.removeChild(style);
}

//A function to map the weeks' vertices into an array
function mapWeekVertices(value,index,array){
    return value.vertex;
}
//casts to int, using a default base 10
int = function(x){return parseInt(x,10);}

//creates an xml line for the given name and value
makeXML = function(value,name,isHTML=false){
    if(value==null)value="undefined"
    value = purgeInvalidCharacters(""+value);
    if(isHTML||name.indexOf("HTML")>=0)value = cleanHTML(value);
    return "<"+name+">"+value+"</"+name+">\n";
}
getXMLVal = function(xml,name,isHTML=false){
    var isARRAY = (name.indexOf("ARRAY")>=0);
    if(!isHTML)isHTML = (name.indexOf("HTML")>=0);
    var tags = xml.getElementsByTagName(name)[0];
    if(tags==null)return null;
    if(tags.childNodes.length==0)if(isARRAY)return [];else return null;
    var value = tags.childNodes[0].nodeValue;
    if(isHTML)value = makeHTML(tags.innerHTML);
    if(value == "undefined"){return null;}
    else if(isARRAY){
        value = value.split(",");
        if(value.length==1&&value[0]=="")return [];
        else return value;
    }
    else return value;
}
cleanHTML = function(text){
    text = text.replace(/&/g,"&amp;");
    text = text.replace(/'/g,"&apos;");
    text = text.replace(/"/g,"&quot;");
    text = text.replace(/</g,"&lt;");
    text = text.replace(/>/g,"&gt;");
    return text;
}
makeHTML = function(text){
    text = text.replace(/&apos;/g,"\'");
    text = text.replace(/&quot;/g,"\"");
    text = text.replace(/&lt;/g,"<");
    text = text.replace(/&gt;/g,">");
    text = text.replace(/&amp;/g,"&");
    return text;
}


//constants declaration
const cellSpacing = 20;
const emptyWeekSize=50;
const colIconSize=100;
const defaultCellWidth=260;
const minCellHeight=40;
const cellDropdownHeight=20;
const cellDropdownPadding=0;
const wfStartX=cellSpacing;
const wfStartY=cellSpacing;
const defaultIconPadding=12;
const defaultTextPadding=1;
const defaultNamePadding=1;
const defaultDropPadding=1;
const defaultIconWidth=24;
const bracketWidth=10;
const bracketTabWidth=80;
const bracketTabHeight=80;
const bracketTriangleWidth=30;
const defaultCommentSize=36;
const exitPadding=cellSpacing;
const tagBoxPadding = 5;
const tagHeight = 20;
const tagWidth = 300;

//Colours
const SALTISEGREEN = '#369934';
const SALTISEBLUE = '#1976bc';
const SALTISERED = '#cc3c23';
const SALTISEORANGE = '#cc922d';
const SALTISELIGHTBLUE = '#1293b3';
// default values:
//const SALTISEGREEN = '#46c443';
//const SALTISEBLUE = '#1976bc';
//const SALTISERED = '#ed4528';
//const SALTISEORANGE = '#eba833';
//const SALTISELIGHTBLUE = '#54c0db';

//Styles
const defaultWeekStyle = 'fillColor=#e6e6e6;movable=0;resizable=0;strokeColor=none;verticalAlign=ALIGN_TOP;align=ALIGN_LEFT;fontSize=13;fontStyle=1;fontColor=black;spacingLeft=20;';
const defaultWFAreaStyle = 'editable=0;fillColor=#FFFFFF;movable=0;resizable=0;strokeColor=black;verticalAlign=ALIGN_TOP;align=ALIGN_LEFT;fontSize=14;fontStyle=1;fontColor=black;';
const defaultLegendStyle = 'shape=label;editable=0;fillColor=#FFFFFF;resizable=0;strokeColor='+SALTISEBLUE+';strokeWidth=4;verticalAlign=ALIGN_TOP;fontSize=14;fontStyle=1;fontColor='+SALTISEBLUE+';spacingTop=8';
const defaultLegendLineStyle = 'shape=label;editable=0;fillColor=#FFFFFF;resizable=0;strokeColor=none;fontSize=12;fontStyle=1;fontColor='+SALTISEBLUE+';constituent=1;imageAlign=left;imageWidth=24;imageHeight=24;overflow=hidden;';
const defaultHeadStyle = "shape=label;fillColor=none;strokeColor=none;imageVerticalAlign=top;verticalAlign=bottom;imageAlign=center;resizable=0;imageWidth="+(colIconSize-60)+";imageHeight="+(colIconSize-60)+";fontSize=16;fontStyle=5;fontColor=black;";
const defaultNameStyle="whiteSpace=wrap;constituent=1;resizable=0;strokeColor=white;strokeWidth=1;fontSize=12;fontColor=black;fillColor=white;overflow=hidden;editable=0;fontStyle=1;fontFamily=arial;verticalAlign=top;";
const defaultWFNodeStyle="whiteSpace=wrap;strokeColor=black;fillColor=white;strokeWidth=1;editable=0;fontColor=black;arcSize=10;absoluteArcSize=1;rounded=1;resizable=0;";
const defaultIconStyle="shape=image;constituent=1;resizable=0;editable=0;strokeColor=none;fillColor=none;";
const defaultTextStyle="whiteSpace=wrap;constituent=1;resizable=0;strokeColor=white;strokeWidth=1;fontSize=12;fontColor=black;fillColor=white;overflow=hidden;editable=0;align=left;verticalAlign=top;";
const defaultTitleStyle="whiteSpace=nowrap;resizable=0;movable=0;fontSize=22;fontStyle=1;fontColor=black;fillColor=none;strokeColor=none;align=left;";
const defaultTagBoxStyle="whiteSpace=wrap;constituent=1;resizable=0;strokeWidth=3;fontSize=12;fontColor=black;fillColor=white;overflow=hidden;editable=0;align=left;verticalAlign=top;rounded=1;arcSize=20;absoluteArcSize=1;spacingLeft=20;";
const defaultTagStyle="whiteSpace=wrap;constituent=1;resizable=0;strokeWidth=3;fontSize=12;fontColor=black;fillColor=white;overflow=hidden;editable=0;align=left;verticalAlign=top;rounded=1;arcSize=50;spacingLeft=20;";
const defaultTagPreviewStyle="whiteSpace=wrap;constituent=1;resizable=0;strokeWidth=3;fontSize=12;fontColor=black;fillColor=white;overflow=hidden;editable=0;align=center;verticalAlign=top;rounded=1;arcSize=50;";
const defaultDropDownStyle="constituent=1;resizable=0;spacingTop=-20;spacingLeft=10;editable=0;strokeColor=white;strokeWidth=1;rounded=1;arcSize=10;absoluteArcSize=1;fontSize=40;align=left;fillColor=#FFFFFF;shape=label;imageWidth=12;imageHeight=12;imageAlign=center;fontColor=black;";
const defaultTimeStyle="constituent=1;resizable=0;spacingTop=0;align=right;editable=0;strokeColor=none;fontSize=14;fillColor=none;fontColor=black;verticalAlign=middle;";
const defaultLinkIconStyle="constituent=1;resizable=0;spacingTop=0;align=right;spacingRight=10;editable=0;strokeColor=none;fontSize=16;fillColor=none;fontColor=black;verticalAlign=middle;shape=image;";
const defaultBracketStyle="editable=0;fillColor=none;strokeColor=none;";
const defaultBracketBarStyle="constituent=1;editable=0;fillColor=black;strokeColor=black;resizable=0;";
const invisibleStyle = "editable=0;movable=0;resizable=0;fillColor=none;strokeColor=none;constituent=1;"
const bracketTriangleStyle = "shape=triangle;editable=0;movable=0;resizable=0;fillColor=#ed4528;strokeColor=none;rotation=180;constituent=1;";
const bracketSquareStyle = "shape=label;editable=0;movable=0;resizable=0;imageAlign=right;fillColor=#ed4528;strokeColor=#ed4528;constituent=1;";
const bracketCircleStyle = "shape=ellipse;fillColor=white;strokeColor=#ed4528;editable=0;movable=0;resizable=0;constituent=1;";
const bracketIconStyle = "shape=label;fillColor=none;strokeColor=none;editable=0;movable=0;resizable=0;imageAlign=center;imageWidth=36;imageHeight=36;constituent=1;"
const defaultEdgeStyle = "editable=0;movable=0;resizable=0;bendable=0;edgeStyle=orthogonalEdgeStyle;strokeColor=black;rounded=1;fontColor=black;labelBackgroundColor=white;labelBorderColor=black;labelPadding=2;";
const defaultCommentStyle = "shape=label;imageAlign=center;padding=4;editable=0;resizable=0;whiteSpace=wrap;imageWidth=32;imageHeight=32;fillColor=#ffff88;strokeColor=black;image=resources/images_svg/comment.svg;";
const defaultWarningStyle = "shape=image;constituent=1;resizable=0;editable=0;strokeColor=none;fillColor=white;"

//Icons
const iconsList={
    strategy:[
        {text:{en:'Jigsaw',fr:"Stratégie croisée"},value:'jigsaw'},
        {text:{en:'Peer Instruction',fr:"Enseignement par les pairs"},value:'peer-instruction'},
        {text:{en:'Case Studies',fr:"Étude de cas"},value:'case-studies'},
        {text:{en:'Gallery Walk',fr:"Atelier-carrousel"},value:'gallery-walk'},
        {text:{en:'Reflective Writing',fr:"Écriture réflexive"},value:'reflective-writing'},
        {text:{en:'Two-Stage Exam',fr:"Test en deux phases"},value:'two-stage-exam'},
        {text:{en:'Toolkit',fr:"Boite à outils"},value:'toolkit'},
        {text:{en:'One Minute Paper',fr:"Papier-minute"},value:'one-minute-paper'},
        {text:{en:'Distributed Problem Solving',fr:"Résolution distribué de problèmes"},value:'distributed-problem-solving'},
        {text:{en:'Peer Assessment',fr:"Évaluation par les pairs"},value:'peer-assessment'}
    ],
    context:[
        {text:{en:'Individual Work',fr:"Travail individuel"},value:'solo'},
        {text:{en:'Work in Groups',fr:"Travail en groupe"},value:'group'},
        {text:{en:'Whole Class',fr:"Classe"},value:'class'}
    ],
    task:[{text:{en:'Gather Information',fr:"Collecter des informations"},value:'research'},
          {text:{en:'Discuss',fr:"Discuter"},value:'discuss'},
          {text:{en:'Problem Solve',fr:"Résolution de problèmes"},value:'problem'},
          {text:{en:'Analyze',fr:"Analyser"},value:'analyze'},
          {text:{en:'Assess/Review Peers',fr:"Examiner ses pairs"},value:'peerreview'},
          {text:{en:'Debate',fr:"Débat"},value:'debate'},
          {text:{en:'Game/Roleplay',fr:"Jeu/Jeu de rôle"},value:'play'},
          {text:{en:'Create/Design',fr:"Créer/Concevoir"},value:'create'},
          {text:{en:'Revise/Improve',fr:"Réviser/Améliorer"},value:'practice'},
          {text:{en:'Read',fr:"Lire"},value:'reading'},
          {text:{en:'Write',fr:"Écrire"},value:'write'},
          {text:{en:'Present',fr:"Présentation"},value:'present'},
          {text:{en:'Experiment/Inquiry',fr:"Expérience/Enquête"},value:'experiment'},
          {text:{en:'Quiz/Test',fr:"Quiz/Test"},value:'quiz'},
          {text:{en:'Instructor Resource Curation',fr:"Préparation des ressources (instructeur)"},value:'curation'},
          {text:{en:'Instructor Orchestration',fr:"Orchestration (instructeur)"},value:'orchestration'},
          {text:{en:'Instructor Evaluation',fr:"Évaluation (instructeur)"},value:'instrevaluate'},
          {text:{en:'Other',fr:"Autre"},value:'other'}
         ],
    assessment:[
        {text:{en:'Formative',fr:"Formatif"}, value:'exercise'},
        {text:{en:'Summative',fr:"Sommatif"},value:'test'},
        {text:{en:'Comprehensive',fr:"Exhaustif"},value:'exam'}
    ],
    column:[
        {text:{en:'Home',fr:"Hors classe"},value:'home'},
        {text:{en:'Instructor',fr:"Instructeur"},value:'instructor'},
        {text:{en:'Students',fr:"Étudiants"},value:'students'},
        {text:{en:'Activity',fr:"Activité"},value:'lesson'},
        {text:{en:'Assessment',fr:"Évaluation"},value:'assessment'},
        {text:{en:'Preparation',fr:"Préparation"},value:'homework'},
        {text:{en:'Artifact',fr:"Artefact"},value:'artifact'},
        {text:{en:'Individual',fr:"Individuel"},value:'solo'},
        {text:{en:'Group',fr:"Groupe"},value:'group'},
        {text:{en:'Class',fr:"Classe"},value:'class'},
        {text:{en:'Science',fr:"Science"},value:'science'},
        {text:{en:'General',fr:"Général"},value:'general'},
        {text:{en:'Chemistry',fr:"Chimie"},value:'chem'},
        {text:{en:'Specialized',fr:"Spécialisé"},value:'target'},
        {text:{en:'Puzzle',fr:"Puzzle"},value:'puzzle'},
        {text:{en:'Design',fr:"Conception"},value:'design'},
        {text:{en:'Gears',fr:'Engrenages'},value:'gears'},
        {text:{en:'Industry',fr:'Industrie'},value:'process'}
    ]
};

const iconpath='resources/images_svg/';


//Language
var USER_LANGUAGE = 'en';
const LANGUAGE_TEXT = {
    menus:{
        file:{en:'File',fr:'Fichier'},
        edit:{en:'Edit',fr:'Édition'},
        view:{en:'View',fr:'Affichage'},
        language:{en:"Language",fr:"Langue"},
        help:{en:'Help',fr:'Aide'},
        newproject:{en:'New Project',fr:'Nouveau projet'},
        saveproject:{en:'Save Project',fr:'Savegarder le projet'},
        openproject:{en:'Open Project',fr:'Ouvrir un projet'},
        exportwf:{en:'Export Current Workflow',fr:'Exporter le plan de travail courant'},
        exportoutcome:{en:'Export Current Outcome',fr:"Exporter l'acquis courant"},
        exportcsv:{en:'Export As CSV',fr:'Exporter en CSV'},
        exporthtml:{en:'Export Embeddable HTML',fr:'Exporter en HTML'},
        importwf:{en:'Import a CFlow file',fr:'Importer un fichier CFlow'},
        importcsv:{en:'Import Outcomes CSV',fr:"Importer un CSV d'acquis"},
        readonly:{en:'Save Read Only',fr:'Copie lecture seule'},
        undo: {en:'Undo',fr:'Annuler'},
        redo: {en:'Redo',fr:' Rétablir'},
        duplicate:{en:'Duplicate Current Workflow',fr:"Dupliquer le plan de travail courant"},
        settings:{en:'Workflow Settings',fr:'Paramètres du plan'},
        expand:{en:'Expand All',fr:"Afficher tout"},
        collapse:{en:'Collapse All',fr:"Cacher tout"},
        printerfriendly:{en:'Printer Friendly Version',fr:"Version imprimante"},
        legend:{en:'Show/Hide Legend',fr:"Afficher/Masquer la légende"},
        toggleoutcome:{en:'Toggle Outcome View',fr:"Basculer L’affichage d'acquis"},
        toggleoutcomeswitch:{en:'Outcome View:',fr:"Affichage d'acquis:"},
        terminology:{en:'Terminology',fr:"Terminologie"},
        terminologystandard:{en:'Standard',fr:"Standard"},
        terminologycegep:{en:'CEGEP',fr:"CÉGEP"},
        terminologyeng:{en:'Engineering',fr:'Ingénierie'},
        genhelp:{en:'General Help',fr:"Aide generale"},
        layouthelp:{en:'About the Layout',fr:"À propos de la mise en page"},
        privacypolicy:{en:'Privacy Policy',fr:"Politique de confidentialité"},
        validate:{en:"Validate",fr:"Valider"}
    },
    project:{
        projectoverview:{en:"Project Overview",fr:"Aperçu du projet"},
        copypaste:{en:"Copy/Paste This Text",fr:"Copiez ce texte"},
        selectoptions:{en:"Select Options",fr:"Sélectionnez les options"}
    },
    layoutnav:{
        returntooverview:{en:"Return to Overview",fr:"Retourez à l'aperçu"},
        goback:{en:"Back",fr:"Réaccéder"},
        navigator:{en:'Project Navigation',fr:'Navigateur'},
        project:{en:'Project',fr:"Projet"},
        projectreanmetitle:{en:"Rename Project",fr:"Renommer le projet"},
        projectrename:{en:'Enter a name for your project',fr:"Entrez un nom pour votre projet"},
        layout:{en:"Layout",fr:"Mise en page"},
        cancel:{en:'Cancel',fr:'Annuler'},
        addwf:{en:'Add Workflow',fr:"Adjouter un plan de travail"},
        outcomes:{en:'Outcome Sets',fr:'Les acquis'},
        createnew:{en:'Create New',fr:'Créer un nouveau'}
    },
    workflow:{
        settings:{
            advancedoutcomes:{en:"Advanced Outcomes",fr:"Acquis Avancés"},
            linktagging:{en:"Link Tagging Enabled",fr:"Étiquette de Liens"},
            validation:{en:"Validation",fr:"Validation"},
            reqtime:{en:"Required Credits",fr:"Crédits Requis"},
            mintime:{en:"Minimum Credits/Term",fr:"Crédits Minimum/Session"},
            maxtime:{en:"Maximum Credits/Term",fr:"Crédits Maximum/Session"},
            maxterm:{en:"Maximum Terms",fr:"Sessions Maximum"},
            unlinkoutcomes:{en:"Unlink Outcomes",fr:"Dissocier les Acquis"}
        },
        activity:{en:"Activity",fr:"Activité"},
        course:{en:"Course",fr:"Cours"},
        program:{en:"Program",fr:"Programme"},
        outcome:{en:"Outcome",fr:"Acquis"},
        plurals:{
            activity:{en:"Activities",fr:"Activités"},
            course:{en:"Courses",fr:"Cours"},
            program:{en:"Programs",fr:"Programmes"},
            outcome:{en:"Outcomes",fr:"Acquis"},
        },
        newactivity:{en:"New Activity",fr:"Nouvelle activité"},
        newcourse:{en:"New Course",fr:"Nouveau cours"},
        newprogram:{en:"New Program",fr:"Noveau programme"},
        inserttitle:{en:"Insert Title Here",fr:'Placer le titre ici'},
        insertauthor:{en:"Insert Author Here",fr:"Placer le nom de l'auteur ici"},
        insertdescription:{en:"Insert Description Here",fr:"Placer la description ici"},
        description:{en:'Description',fr:'Description'},
        rename:{en:"Rename",fr:"Renommer"},
        delete:{en:"Delete",fr:"Supprimer"},
        unassign:{en:"Unassign",fr:"Annuler l'attribution"},
        createchild:{en:"Create Child",fr:"Ajouter un enfant"}
    },
    editbar:{
        editnode:{en:'Edit Node',fr:'Modifier le noeud'},
        title:{en:'Title',fr:'Titre'},
        description:{en:'Description',fr:'Description'},
        righticon:{en:'Task Icon',fr:'Icône de tâche'},
        lefticon:{en:'Context Icon',fr:'Icône de contexte'},
        time:{en:'Time',fr:'Temps'},
        linkedwf:{en:'Linked Workflow',fr:'Plan de travail en lien'},
        tags:{en:'Outcomes',fr:'Acquis'},
        none:{en:'None',fr:'Aucun'},
        chooseone:{en:"Select a tag to add",fr:'Choisissez-en un à ajouter'},
        createnew:{en:"Create new ",fr:"Créer nouveau "},
        insertdescription:{en:"Insert a description here.",fr:"Insérer la description ici."},
        nameplaceholder:{en:"<Name>",fr:"<Nom>"}
    },
    workflowview:{
        nodeheader:{en:"Nodes",fr:"Noeuds"},
        jumpto:{en:"Jump To",fr:"Raccourcis"},
        strategiesheader:{en:"Strategies",fr:"Stratégies"},
        outcomesheader:{en:"Assigned Outcomes",fr:"Acquis attribués"},
        assignoutcome:{en:"Assign Outcome",fr:"Attribuer l'acquis"},
        nooutcomes:{en:"No outcomes have been added yet! Use the buttons below to add one.",fr:"Aucun acquis n'a été ajouté! Utilisez les boutons ci-dessous pour en ajouter un."},
        selectset:{en:"Select set to add",fr:'Choisissez-en un à ajouter'},
        addcomment:{en:"Add Comment",fr:"Ajouter un commentaire"},
        edittitle:{en:"Edit Title",fr:"Modifier le titre"},
        editauthor:{en:"Edit Author",fr:"Modifier l'auteur"},
        editdescription:{en:"Edit Description",fr:"Modifier la description"},
        whatsthis:{en:"What's This?",fr:"Aide"},
        draganddrop:{en:"\A Drag and drop to add",fr:"\A Glisser-déplacer pour ajouter"}
    },
    outcomeview:{
        total:{en:"Total",fr:"Totale"},
        grandtotal:{en:"Grand Total",fr:"Somme finale"},
        uncategorized:{en:"Uncategorized",fr:"Non-classé"},
        complete:{en:"Complete",fr:"Complet"},
        incomplete:{en:"Incomplete",fr:"Incomplet"},
        partial:{en:"Partial",fr:"Partiel"},
        introduce:{en:"Introduced",fr:"Introduit"},
        develop:{en:"Developed",fr:"Développé"},
        advance:{en:"Advanced",fr:"Avancé"},
        addnode:{en:"Add Node",fr:"Adjouter un noeud"},
        displayheader:{en:"Display",fr:"Affichage"},
        sortbyheader:{en:"Sort By",fr:"Trier par"},
        sortradio:{
            week:{en:"Week/Term",fr:"Semaine/Session"},
            icon:{en:"Context",fr:"Contexte"},
            column:{en:"Column",fr:"Colonne"}
        }
    },
    tag:{
        deletetext:{en:"Delete this learning outcome? Warning: this will delete all contents and remove them from all workflows!",fr:"Supprimer ce acquis? Attention: cela supprimera tous les contenus et les supprimera de tous les plans de travails!"},
        unassigntext:{en:"Unassign this learning outcome? Note: this will NOT delete the learning outcome, but WILL remove all references to it from the workflow.",fr:"Annuler l'attribution de ce acquis? Attention: cela ne supprimera PAS l'acquis, mais supprimera toutes les références à celui-ci du plan de travail."},
        standard:{
            depth0:{en:"Program Outcome",fr:"Acquis de programme"},
            depth1:{en:"Course Outcome",fr:"Acquis de cours"},
            depth2:{en:"Activity Outcome",fr:"Acquis d'activité"},
            depth3:{en:"Tag",fr:"Tag"}
        },
        cegep:{
            depth0:{en:"Competency",fr:"Compétence"},
            depth1:{en:"Element of Competency",fr:"Éléments de compétence"},
            depth2:{en:"Learning Outcome",fr:"Objectif d'apprentissage"},
            depth3:{en:"Tag",fr:"Tag"}
        },
        eng:{
            depth0:{en:"Graduate Attribute",fr:"Qualités requises des diplômés"},
            depth1:{en:"Attribute Indicator",fr:"Indicateurs de qualité"},
            depth2:{en:"Course Outcome",fr:"Acquis de cours"},
            depth3:{en:"Tag",fr:"Tag"}
        },
        new:{en:"New",fr:"Nouveau"},
        tagbuilder:{en:"<h3 class='hideforprint'>Learning Outcomes:</h3><p class='hideforprint'>This page allows you to create outcomes. For an explanation of the outcomes, click here:",fr:"<h3 class='hideforprint'>Objectifs d'apprentissage:</h3><p class='hideforprint'>Cette page vous permet de créer des acquis. Pour une explication des acquis, cliquez ici:"}
        
    
    },
    column:{
        HW:{
            text:{en:'Preparation',fr:'Preparation'},
            nodetext:{en:'Preparation',fr:'Preparation'}
        },
        AC:{
            text:{en:'Lessons',fr:'Leçons'},
            nodetext:{en:'Lesson',fr:'Leçon'}
        },
        SA:{
            text:{en:'Assessments',fr:'Évaluations'},
            nodetext:{en:'Assessment',fr:'Évaluation'}
        },
        FA:{
            text:{en:'Artifacts',fr:'Artefacts'},
            nodetext:{en:'Artifact',fr:'Artefact'}
        },
        OOC:{
            text:{en:'Out of Class (Students)',fr:'Hors classe (étudiants)'},
            nodetext:{en:'Home (Students)',fr:'Hors classe (étudiants)'}
        },
        ICI:{
            text:{en:'In Class (Instructor)',fr:'En classe (instructeur)'},
            nodetext:{en:'Instructor',fr:'Instructeur'}
        },
        OOCI:{
            text:{en:'Out of Class (Instructor)',fr:'Hors classe (instructeur)'},
            nodetext:{en:'Home (Instructor)',fr:'Hors classe (instructeur)'}
        },
        ICS:{
            text:{en:'In Class (Students)',fr:'En classe (étudiants)'},
            nodetext:{en:'Students',fr:'Étudiants'}
        },
        CO:{
            text:{en:'Courses',fr:'Cours'},
            nodetext:{en:'Course',fr:'Cour'}
        },
        CUS:{
            text:{en:'Custom Column',fr:'Colonne personnalisée'},
            nodetext:{en:'New Custom',fr:'Nouvelle colonne'}
        },
        CUSP:{
            text:{en:'Course Category',fr:'Catégorie de cours'},
            nodetext:{en:'New Category',fr:'Nouvelle catégorie'}
        },
        modifytext:{en:'Edit label',fr:"Modifier l'étiquette"},
        colourpicker:{en:'Colour',fr:"Couleur"},
        delete:{en:'Delete column',fr:"Supprimer la colonne"},
        deletelast:{en:"You can't delete the last column!",fr:"Vous ne pouvez pas supprimer la dernière colonne!"},
        icon:{en:"Icon",fr:"Icône"}
    },
    week:{
        week:{en:"Week",fr:"Semaine"},
        term:{en:"Term",fr:"Session"},
        part:{en:"Part",fr:"Partie"},
        modifytext:{en:'Edit label',fr:"Modifier l'étiquette"},
        duplicate:{
            week:{en:'Duplicate Week',fr:"Dupliquer cette semaine"},
            term:{en:'Duplicate Term',fr:"Dupliquer cette session"},
            part:{en:'Duplicate Part',fr:"Dupliquer cette partie"}
        },
        delete:{
            week:{en:'Delete Week',fr:"Supprimer cette semaine"},
            term:{en:'Delete Term',fr:"Supprimer cette session"},
            part:{en:'Delete Part',fr:"Supprimer cette partie"}
        },
        collapse:{
            week:{en:'Collapse Week',fr:"Réduire cette semaine"},
            term:{en:'Collapse Term',fr:"Réduire cette session"},
            part:{en:'Collapse Part',fr:"Réduire cette partie"}
        },
        createbelow:{
            week:{en:'Insert week below',fr:"Insérer une semaine"},
            term:{en:'Insert term below',fr:"Insérer une session"},
            part:{en:'Insert part below',fr:"Insérer une partie"}
        },
        move:{
            week:{en:'Move week',fr:"Déplacer la semaine"},
            term:{en:'Move term',fr:"Déplacer la session"},
            part:{en:'Move part',fr:"Déplacer la partie"}
        },
        options:{en:"Style",fr:"Style"},
        simple:{en:"Simple",fr:"Simple"},
        parts:{en:"Parts",fr:"En parties"}
    },
    node:{
        defaulttext:{en:"Click to edit",fr:"Cliquez pour modifier"},
        delete:{en:"Delete Node",fr:"Supprimer ce noeud"},
        duplicate:{en:"Duplicate Node",fr:"Dupliquer ce noeud"},
        createbelow:{en:'Insert node below',fr:"Insérer un noeud"},
        righticon:{en:'Task Icon',fr:'Icône de tâche'},
        lefticon:{en:'Context Icon',fr:'Icône de contexte'},
        modifytext:{en:'Edit label',fr:"Modifier l'étiquette"},
        showhide:{en:"Show/Hide Description",fr:"Afficher/Masquer la description"},
        setlinkedwf:{en:"Set Linked WF",fr:"Spécifier le plan de travail lié"}
    },
    bracket:{
        delete:{en:"Delete Bracket",fr:"Supprimer cette stratégie"}
    },
    comment:{
        addcomment:{en:"Add Comment",fr:"Ajouter un commentaire"},
        delete:{en:"Delete Comment",fr:"Supprimer ce commentaire"},
        show:{en:"Show",fr:"Afficher"}
    },
    confirm:{
        navigate:{en:'Are you sure you want to navigate away?',fr:"Êtes-vous sûr de vouloir quitter l'application?"},
        newproject:{en:"Are you sure you want to continue? You will lose any unsaved work.",fr:"Êtes-vous sûr de vouloir continuer? Vous perdrez tout le travail non enregistré."},
        deleteworkflow:{en:"Delete this workflow? Warning: this will delete all contents (but not any workflows used by it)!",fr:"Supprimer ce plan de travail? Ceci supprimera le contenu mais pas les plan de travail qu'il contient."},
        unassignworkflow:{en:"Unassign this workflow? Note: this will NOT delete the workflow, but WILL remove this reference to it from the parent workflow.",fr:"Annuler l'attribution de ce plan de travail? Cela ne supprimera PAS le plan de travail mais supprimera cette référence de la source."},
        deletecolumn:{en:"Delete this column?",fr:"Supprimer cette colonne?"},
        deleteweek:{
            week:{en:"Delete this week? Warning: this will delete any nodes still inside!",fr:"Supprimer cette semain? Attention: cela supprimera tous les noeuds encore à l'intérieur!"},
            term:{en:"Delete this term? Warning: this will delete any nodes still inside!",fr:"Supprimer cette session? Attention: cela supprimera tous les noeuds encore à l'intérieur!"},
            part:{en:"Delete this part? Warning: this will delete any nodes still inside!",fr:"Supprimer cette partie? Attention: cela supprimera tous les noeuds encore à l'intérieur!"}
        },
        linkwf:{en:"This node already has outcomes assigned to it. Do you want to assign these to the newly linked workflow?",fr:"Ce noeud a déjà des acquis qui lui sont attribuer. Voulez-vous les attribuer au plan de travail nouvellement lié?"},
        unlinkwf:{en:"You've unlinked a workflow from a node with outcomes. Do you want to clear the outcomes from the node?",fr:"Vous avez dissocié un plan de travail d'un noeud avec des acquis. Voulez-vous effacer les acquis du noeud?"},
        deletenode:{en:"Delete this node?",fr:"Supprimer ce noeud?"},
        deletecomment:{en:"Delete this comment?",fr:"Supprimer ce commentaire?"}
    },
    legend:{
        legend:{en:"Legend",fr:"Légende"},
        task:{en:"Task Icons",fr:"Icônes de tâche"},
        context:{en:"Context Icons",fr:"Icônes de contexte"},
        strategy:{en:"Strategy Icons",fr:"Icônes de stratégie"},
        assessment:{en:"Assessment Icons",fr:"Icônes d'évaluation"},
        column:{en:"Column Icons",fr:"Icônes de colonne"}
    },
    errors:{
        openoutcome:{en:"Oops! The outcome could not be opened.",fr:"Oups! L'acquis n'a pas pu être ouvert."},
        filesave:{en:"Oops! The file could not be saved.",fr:"Oups! Le fichier n'a pas pu être enregistré."},
        fileopen:{en:"Oops! The file could not be opened.",fr:"Oups! Impossible d'ouvrir le fichier."},
        undo:{en:"Oops! Something went wrong with the undo function.",fr:"Oups! Il y a eu un problème lors de l'annulation de l'action."},
        redo:{en:"Oops! Something went wrong with the redo function.",fr:"Oups! Il y a eu un problème lors du rétablissement de l'action."},
        wfopen:{en:"Oops! The workflow could not be opened.",fr:"Oups! Impossible d'ouvrir le plan de travail."},
        printchrome:{en:"Warning: based on your browser, you may need to change your paper size (to A4) from the default when printing. Failing to do so can result in a blank page.",fr:"Avertissement lié à votre navigateur: vous devez sélectionner le format A4 lors de l'impression. Si vous ne le faites pas, vous imprimerez une page blanche."},
        loadcsv:{en:"An error occurred parsing your csv file. Please ensure it is in the correct format.",fr:"Une erreur s'est produite lors de l'analyse de votre fichier csv. Veuillez vous assurer que le format est correct."}
        
    },
    timeunits:{
        s:{en:"s",fr:"s"},
        min:{en:"min",fr:"min"},
        hr:{en:"hr",fr:"hr"},
        day:{en:"d",fr:"j"},
        week:{en:"wk",fr:"sem"},
        month:{en:"mon",fr:"mois"},
        yr:{en:"yr",fr:"a"},
        cr:{en:"crd",fr:"crd"}
    },
    validation:{
        appearsbeforecoreq:{en:" appears before its corequisite: ",fr:" apparaît avant son co-requis: " },
        appearsbeforeprereq:{en:" appears before or in the same term as its pre-requisite: ",fr:" apparaît avant ou dans le même terme que son pré-requis: "},
        maxterms:{en: "The maximum recommended number of terms is ",fr:"La durée maximale recommandée est "},
        maxterms2:{en:", but you have scheduled ",fr:"terms, mais vous en avez"},
        has:{en:" has ",fr:" a "},
        lesscredits:{en:" credits, which is less than the recommended amount (",fr:" crédits, ce qui est moins que le montant recommandé ("},
        morecredits:{en:" credits, which is more than the recommended amount (",fr:" crédits, ce qui est plus que le montant recommandé ("},
        total:{en:"There are a total of ",fr:"Il y a un total de "},
        noerrors:{en:"There are no errors to report!",fr:"Il n'y a aucune erreur!"},
        errorstart:{en:"The validation process has found the following errors:\n\n",fr:"Le processus de validation a détecté les erreurs suivantes:\n\n"}
    }
}

const columnValues={
    HW:{image:"homework",colour:"#ad351d"},
    AC:{image:"lesson",colour:"#ed4a28"},
    SA:{image:"assessment",colour:"#f7ba2a"},
    FA:{image:"artifact",colour:"#ed8934"},
    OOC:{image:"home",colour:"#114cd4"},
    ICI:{image:"instruct",colour:"#11b3d4"},
    OOCI:{image:"ooci",colour:"#0b118a"},
    ICS:{image:"students",colour:"#04d07d"},
    CO:{image:"instruct",colour:"#08e08d"},
    CUS:{image:"instruct",colour:"#6738ff"},
    CUSP:{image:"other",colour:SALTISEGREEN}
}

function setMenuLanguage(){
    $("#file").html(LANGUAGE_TEXT.menus.file[USER_LANGUAGE]);
    $("#new").children().first().html(LANGUAGE_TEXT.menus.newproject[USER_LANGUAGE]);
    $("#open").children().first().html(LANGUAGE_TEXT.menus.openproject[USER_LANGUAGE]);
    $("#save").children().first().html(LANGUAGE_TEXT.menus.saveproject[USER_LANGUAGE]);
    $("#export").children().first().html(LANGUAGE_TEXT.menus.exportwf[USER_LANGUAGE]);
    $("#exportcsv").children().first().html(LANGUAGE_TEXT.menus.exportcsv[USER_LANGUAGE]);
    $("#exporthtml").children().first().html(LANGUAGE_TEXT.menus.exporthtml[USER_LANGUAGE]);
    $("#import").children().first().html(LANGUAGE_TEXT.menus.importwf[USER_LANGUAGE]);
    $("#importcsv").children().first().html(LANGUAGE_TEXT.menus.importcsv[USER_LANGUAGE]);
    $("#savereadonly").children().first().html(LANGUAGE_TEXT.menus.readonly[USER_LANGUAGE]);
    $("#edit").html(LANGUAGE_TEXT.menus.edit[USER_LANGUAGE]);
    $("#undo").children().first().html(LANGUAGE_TEXT.menus.undo[USER_LANGUAGE]);
    $("#redo").children().first().html(LANGUAGE_TEXT.menus.redo[USER_LANGUAGE]);
    $("#duplicatewf").children().first().html(LANGUAGE_TEXT.menus.duplicate[USER_LANGUAGE]);
    $("#settings").children().first().html(LANGUAGE_TEXT.menus.settings[USER_LANGUAGE]);
    $("#view").html(LANGUAGE_TEXT.menus.view[USER_LANGUAGE]);
    $("#expand").children().first().html(LANGUAGE_TEXT.menus.expand[USER_LANGUAGE]);
    $("#collapse").children().first().html(LANGUAGE_TEXT.menus.collapse[USER_LANGUAGE]);
    $("#print").children().first().html(LANGUAGE_TEXT.menus.printerfriendly[USER_LANGUAGE]);
    $("#showlegend").children().first().html(LANGUAGE_TEXT.menus.legend[USER_LANGUAGE]);
    $("#outcomeview").children().first().html(LANGUAGE_TEXT.menus.toggleoutcome[USER_LANGUAGE]);
    $(".outcomeviewtext").html(LANGUAGE_TEXT.menus.toggleoutcomeswitch[USER_LANGUAGE]);
    $("#gobackdivtext").html(LANGUAGE_TEXT.layoutnav.goback[USER_LANGUAGE]);
    $("#returndivtext").html(LANGUAGE_TEXT.layoutnav.returntooverview[USER_LANGUAGE]);
    $("#expandviewbar").attr("title",LANGUAGE_TEXT.menus.expand[USER_LANGUAGE]);
    $("#collapseviewbar").attr("title",LANGUAGE_TEXT.menus.collapse[USER_LANGUAGE]);
    $("#terminology").children().first().html(LANGUAGE_TEXT.menus.terminology[USER_LANGUAGE]);
    $("#terminologystandard").children().first().html(LANGUAGE_TEXT.menus.terminologystandard[USER_LANGUAGE]);
    $("#terminologycegep").children().first().html(LANGUAGE_TEXT.menus.terminologycegep[USER_LANGUAGE]);
    $("#terminologyeng").children().first().html(LANGUAGE_TEXT.menus.terminologyeng[USER_LANGUAGE]);
    $("#language").html(LANGUAGE_TEXT.menus.language[USER_LANGUAGE]);
    $("#help").html(LANGUAGE_TEXT.menus.help[USER_LANGUAGE]);
    $("#genhelp").children().first().html(LANGUAGE_TEXT.menus.genhelp[USER_LANGUAGE]);
    $("#layouthelp").children().first().html(LANGUAGE_TEXT.menus.layouthelp[USER_LANGUAGE]);
    $("#privacy").children().first().html(LANGUAGE_TEXT.menus.privacypolicy[USER_LANGUAGE]); $("#splashnewproject").html(LANGUAGE_TEXT.menus.newproject[USER_LANGUAGE]);
    $("#splashopenproject").html(LANGUAGE_TEXT.menus.openproject[USER_LANGUAGE]);
    $("#splashrenametext").html(LANGUAGE_TEXT.layoutnav.projectrename[USER_LANGUAGE]);
    $("#projectheader").html(LANGUAGE_TEXT.layoutnav.project[USER_LANGUAGE]+":");
    $("#cancelrename").html(LANGUAGE_TEXT.layoutnav.cancel[USER_LANGUAGE]);
    $("#prrename").html(LANGUAGE_TEXT.menus.newproject[USER_LANGUAGE]);
    $("#layoutheader").html(LANGUAGE_TEXT.layoutnav.layout[USER_LANGUAGE]+":");
    $("#outcomesheader").html(LANGUAGE_TEXT.layoutnav.outcomes[USER_LANGUAGE]+":");
    $("#addwfheader").html(LANGUAGE_TEXT.layoutnav.addwf[USER_LANGUAGE]+":");
    $("#newwfbutton").html(LANGUAGE_TEXT.layoutnav.createnew[USER_LANGUAGE]);
    $("#newcompbutton").html(LANGUAGE_TEXT.layoutnav.createnew[USER_LANGUAGE]);
    $("html").attr("lang",USER_LANGUAGE);
   
    
}

function purgeInvalidCharacters(input){
    input =  input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g,'');
    return input;
}


/*This function would usually be called inside the graph initialization function of Project. However, for reasons I cannot seem to understand, it simply does not work inside the scope of a class function. I therefore define the function out here and call it.*/
function initializeConnectionPointForGraph(graph){
    // Returns the actual point for a port by redirecting the constraint to the port
        graph.getConnectionPoint = function(vertex, constraint)
        {
            if (constraint.id != null && vertex != null && vertex.shape != null)
            {
                var port = vertex.shape.getPorts()[constraint.id];

                if (port != null)
                {
                    constraint = new mxConnectionConstraint(new mxPoint(port.x, port.y), port.perimeter);
                }
            }

            return mxGraph.prototype.getConnectionPoint.apply(this, arguments);
        }
        
        
}

//Overwrite Quill's default link sanitization to add http
var Link = Quill.import('formats/link');
var builtInFunc = Link.sanitize;
Link.sanitize = function customSanitizeLinkInput(linkValueInput) {
    var val = linkValueInput;

    // do nothing, since this implies user's already using a custom protocol
    if (/^\w+:/.test(val));
    else if (!/^https?:/.test(val))
        val = "http://" + val;

    return builtInFunc.call(this, val); // retain the built-in logic
};

// These should be defined only once, otherwise they end up iterating through themselves multiple times.
var insertEdgePrototype = mxConnectionHandler.prototype.insertEdge;
var edgeConnectPrototype = mxEdgeHandler.prototype.connect;
var drawPreviewPrototype = mxVertexHandler.prototype.drawPreview;


//Make a div resizable either to the left or right
function makeResizable(div,direction){
        
    var handle = document.createElement("div");
    handle.className="panelresizehandle";

    var getWidth = function(x,bound){return null;}
    var padding = int(getComputedStyle(div)["padding-left"])+int(getComputedStyle(div)["padding-right"]);
    switch(direction){
            case 'left':
                handle.style.width="5px";
                handle.style.height="100%";
                handle.style.top="0px";
                handle.style.left="0px";
                getWidth = function(x,bound){return bound.right-x;} 
                break;
            case 'right':
                handle.style.width="5px";
                handle.style.height="100%";
                handle.style.top="0px";
                handle.style.right="0px";
                getWidth = function(x,bound){return x-bound.left;} 
                break;

    }

    function resize(evt){
        var newWidth = getWidth(evt.clientX,div.getBoundingClientRect())-padding;
        if(newWidth<100)newWidth=100;
        if(newWidth>window.innerWidth-200)newWidth = window.innerWidth-200;
        div.style.width = newWidth+"px";
    }
    function stopResize(evt){
        window.removeEventListener("mousemove",resize);
    }



    handle.addEventListener("mousedown",function(e){
        e.preventDefault();
        window.addEventListener("mousemove",resize);
        window.addEventListener("mouseup",stopResize,true);
    });
    div.appendChild(handle);
}


/*Send an event to Google Analytics.
Categories: 
    Save/Open
    Workflow
    Outcome
    Node
    Bracket
    Column
    Week
    Comment
    Outcome
    View
*/
function gaEvent(category,action,label,value){
    gtag('event',action,{'event_category':category,'event_label':label/*,'event_value':value*/});
}

function gaError(source,err){
    var errormessage = err.name+": "+err.message;
    if(err.fileName)errormessage+=" file "+err.fileName;
    if(err.lineNumber)errormessage+=" line "+err.lineNumber;
    gtag('event',source,{'event_category':'Error','event_label':errormessage});
}



function parseCSV(str) {
    var arr = [];
    var quote = false;  // true means we're inside a quoted field

    // iterate over each character, keep track of current row and column (of the returned array)
    for (var row = 0, col = 0, c = 0; c < str.length; c++) {
        var cc = str[c], nc = str[c+1];        // current character, next character
        arr[row] = arr[row] || [];             // create a new row if necessary
        arr[row][col] = arr[row][col] || '';   // create a new column (start with empty string) if necessary

        // If the current character is a quotation mark, and we're inside a
        // quoted field, and the next character is also a quotation mark,
        // add a quotation mark to the current column and skip the next character
        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }  

        // If it's just one quotation mark, begin/end quoted field
        if (cc == '"') { quote = !quote; continue; }

        // If it's a comma and we're not in a quoted field, move on to the next column
        if (cc == ',' && !quote) { ++col; continue; }

        // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
        // and move on to the next row and move to column 0 of that new row
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

        // If it's a newline (LF or CR) and we're not in a quoted field,
        // move on to the next row and move to column 0 of that new row
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
    }
    return arr;
}



//Overwriting the functions that set bold text to use font-weight 600 instead
/**
 * Function: getAlternateContent
 * 
 * Returns the alternate content for the given foreignObject.
 */
mxSvgCanvas2D.prototype.createAlternateContent = function(fo, x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation)
{
	if (this.foAltText != null)
	{
		var s = this.state;
		var alt = this.createElement('text');
		alt.setAttribute('x', Math.round(w / 2));
		alt.setAttribute('y', Math.round((h + s.fontSize) / 2));
		alt.setAttribute('fill', s.fontColor || 'black');
		alt.setAttribute('text-anchor', 'middle');
		alt.setAttribute('font-size', s.fontSize + 'px');
		alt.setAttribute('font-family', s.fontFamily);
		
		if ((s.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD)
		{
			alt.setAttribute('font-weight', '600');
		}
		
		if ((s.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC)
		{
			alt.setAttribute('font-style', 'italic');
		}
		
		if ((s.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE)
		{
			alt.setAttribute('text-decoration', 'underline');
		}
		
		mxUtils.write(alt, this.foAltText);
		
		return alt;
	}
	else
	{
		return null;
	}
};

/**
 * Function: createDiv
 * 
 * Private helper function to create SVG elements
 */
mxSvgCanvas2D.prototype.createDiv = function(str, align, valign, style, overflow)
{
	var s = this.state;

	// Inline block for rendering HTML background over SVG in Safari
	var lh = (mxConstants.ABSOLUTE_LINE_HEIGHT) ? (s.fontSize * mxConstants.LINE_HEIGHT) + 'px' :
		(mxConstants.LINE_HEIGHT * this.lineHeightCorrection);
	
	style = 'display:inline-block;font-size:' + s.fontSize + 'px;font-family:' + s.fontFamily +
		';color:' + s.fontColor + ';line-height:' + lh + ';' + style;

	if ((s.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD)
	{
		style += 'font-weight:600;';
	}

	if ((s.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC)
	{
		style += 'font-style:italic;';
	}
	
	if ((s.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE)
	{
		style += 'text-decoration:underline;';
	}
	
	if (align == mxConstants.ALIGN_CENTER)
	{
		style += 'text-align:center;';
	}
	else if (align == mxConstants.ALIGN_RIGHT)
	{
		style += 'text-align:right;';
	}

	var css = '';
	
	if (s.fontBackgroundColor != null)
	{
		css += 'background-color:' + s.fontBackgroundColor + ';';
	}
	
	if (s.fontBorderColor != null)
	{
		css += 'border:1px solid ' + s.fontBorderColor + ';';
	}
	
	var val = str;
	
	if (!mxUtils.isNode(val))
	{
		val = this.convertHtml(val);
		
		if (overflow != 'fill' && overflow != 'width')
		{
			// Inner div always needed to measure wrapped text
			val = '<div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block;text-align:inherit;text-decoration:inherit;' + css + '">' + val + '</div>';
		}
		else
		{
			style += css;
		}
	}

	// Uses DOM API where available. This cannot be used in IE to avoid
	// an opening and two (!) closing TBODY tags being added to tables.
	if (!mxClient.IS_IE && document.createElementNS)
	{
		var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
		div.setAttribute('style', style);
		
		if (mxUtils.isNode(val))
		{
			// Creates a copy for export
			if (this.root.ownerDocument != document)
			{
				div.appendChild(val.cloneNode(true));
			}
			else
			{
				div.appendChild(val);
			}
		}
		else
		{
			div.innerHTML = val;
		}
		
		return div;
	}
	else
	{
		// Serializes for export
		if (mxUtils.isNode(val) && this.root.ownerDocument != document)
		{
			val = val.outerHTML;
		}

		// NOTE: FF 3.6 crashes if content CSS contains "height:100%"
		return mxUtils.parseXml('<div xmlns="http://www.w3.org/1999/xhtml" style="' + style + 
			'">' + val + '</div>').documentElement;
	}
};

/**
 * Function: updateFont
 * 
 * Updates the text properties for the given node. (NOTE: For this to work in
 * IE, the given node must be a text or tspan element.)
 */
mxSvgCanvas2D.prototype.updateFont = function(node)
{
	var s = this.state;

	node.setAttribute('fill', s.fontColor);
	
	if (!this.styleEnabled || s.fontFamily != mxConstants.DEFAULT_FONTFAMILY)
	{
		node.setAttribute('font-family', s.fontFamily);
	}

	if ((s.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD)
	{
		node.setAttribute('font-weight', '600');
	}

	if ((s.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC)
	{
		node.setAttribute('font-style', 'italic');
	}
	
	if ((s.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE)
	{
		node.setAttribute('text-decoration', 'underline');
	}
};

var mxMoveEdgeLabelPrototype = mxEdgeHandler.prototype.moveLabel;
mxEdgeHandler.prototype.moveLabel = function(edge, x, y){
    var pt = this.graph.getView().getClosestPoint(edge,x,y);
    x = pt.x;
    y = pt.y;
    
    
    mxMoveEdgeLabelPrototype.apply(this,arguments);
    if(edge.cell.isLink)edge.cell.link.labelx = edge.cell.x();
}


/**
 * Function: getRelativePoint
 *
 * Gets the relative point that describes the given, absolute label
 * position for the given edge state.
 * 
 * Parameters:
 * 
 * state - <mxCellState> that represents the state of the parent edge.
 * x - Specifies the x-coordinate of the absolute label location.
 * y - Specifies the y-coordinate of the absolute label location.
 */
mxGraphView.prototype.getClosestPoint = function(edgeState, x, y)
{
	var model = this.graph.getModel();
	var geometry = model.getGeometry(edgeState.cell);
	
	if (geometry != null)
	{
		var pointCount = edgeState.absolutePoints.length;
		
		if (geometry.relative && pointCount > 1)
		{
			var totalLength = edgeState.length;
			var segments = edgeState.segments;

			// Works which line segment the point of the label is closest to
			var p0 = edgeState.absolutePoints[0];
			var pe = edgeState.absolutePoints[1];
			var minDist = mxUtils.ptSegDistSq(p0.x, p0.y, pe.x, pe.y, x, y);

			var index = 0;
			var tmp = 0;
			var length = 0;
			
			for (var i = 2; i < pointCount; i++)
			{
				tmp += segments[i - 2];
				pe = edgeState.absolutePoints[i];
				var dist = mxUtils.ptSegDistSq(p0.x, p0.y, pe.x, pe.y, x, y);
				if (dist <= minDist)
				{
					minDist = dist;
					index = i - 1;
					length = tmp;
				}
				
				p0 = pe;
			}
			
			var seg = segments[index];
			p0 = edgeState.absolutePoints[index];
			pe = edgeState.absolutePoints[index + 1];
			
            
			var x2 = x-p0.x;
			var y2 = y-p0.y;
			
			var x1 = pe.x-p0.x;
			var y1 = pe.y-p0.y;
            
			var norm1sqr = x1**2+y1**2;
            var x;
            var y;
            if(x2>Math.max(x1,0)){x=Math.max(x1,0);}
            else if(x2<Math.min(x1,0)){x=Math.min(x1,0);}
            else x = x1*x2*x1/norm1sqr;
            if(y2>Math.max(y1,0)){y=Math.max(y1,0);}
            else if(y2<Math.min(y1,0)){y=Math.min(y1,0);}
            else y = y1*y2*y1/norm1sqr;
            
            
            

			// Constructs the relative point for the label
			return new mxPoint((x+p0.x)/this.scale,
						(y+p0.y)/this.scale);
		}
	}
	
	return new mxPoint();
};

