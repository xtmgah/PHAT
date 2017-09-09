/// <reference types="jquery" />

import * as electron from "electron";
const ipc = electron.ipcRenderer;

const Dialogs = require("dialogs");
const dialogs = Dialogs();

import {SaveKeyEvent} from "./../../ipcEvents";
import {AtomicOperationIPC} from "./../../atomicOperationsIPC";
import * as viewMgr from "./../viewMgr";
import {CircularFigure} from "./../circularFigure";
import {reCacheBaseFigure} from "./reCacheBaseFigure";
import {Fasta} from "./../../fasta";
import {AlignData} from "./../../alignData";

import * as GenomeView from "./genomeView";
import * as tc from "./templateCache";

import {writeAlignsModal} from "./writeAlignsModal";
import {writeAvailableTracksModal} from "./writeAvailableTracksModal";
import {writeContigEditorModal} from "./writeContigEditorModal";
import {writeContigCreatorModal} from "./writeContigCreatorModal";
import {writeLoadingModal} from "./writeLoadingModal";


const $ = require("jquery");
(<any>window).$ = $;
(<any>window).jQuery = $;
(<any>window).Tether = require("tether");
require("bootstrap");
export function addView(arr : Array<viewMgr.View>,div : string)
{
    arr.push(new View(div));
}
export class View extends viewMgr.View
{
    public views : Array<viewMgr.View>;
    public circularFigures : Array<CircularFigure>;
    public alignData : Array<AlignData>;
    public fastaInputs : Array<Fasta>;
    public alignsModalOpen : boolean;
    public availableTracksModalOpen : boolean;
    public contigEditorModalOpen : boolean;
    public contigCreatorModalOpen : boolean;
    public loadingModal : boolean;
    public constructor(div : string)
    {
        super("masterView",div);
        this.views = new Array<viewMgr.View>();
        this.circularFigures = new Array<CircularFigure>();
        this.fastaInputs = new Array<Fasta>();
        this.alignsModalOpen = false;
        this.availableTracksModalOpen = false;
        this.contigEditorModalOpen = false;
        this.contigCreatorModalOpen = false;
        this.loadingModal = false;
    }
    public getAlignsForOpenGenome() : Array<AlignData> | undefined
    {
        let res : Array<AlignData> = new Array<AlignData>();
        let genomeView = <GenomeView.GenomeView>viewMgr.getViewByName("genomeView",this.views);
        if(!this.alignData || !genomeView.genome)
            return undefined;
        for(let i = 0; i != this.alignData.length; ++i)
        {
            if(this.alignData[i].fasta && this.alignData[i].fasta.uuid == genomeView.genome.uuidFasta)
            {
                res.push(this.alignData[i]);
            }
        }
        if(res.length == 0)
            return undefined;
        return res;
    }
    public showModal() : void
    {
        try
        {
            (<any>$(".modal")).modal("show");
            document.getElementsByClassName("modal-backdrop")[0].classList.remove("modal-backdrop");
        }
        catch(err){}
    }
    public dismissModal() : void
    {
        (<any>$(".modal")).modal("hide");
    }
    public resetModalStates() : void
    {
        this.alignsModalOpen = false;
        this.availableTracksModalOpen = false;
        this.contigCreatorModalOpen = false;
        this.contigEditorModalOpen = false;
    }
    public setSelectedFigureInDropDown() : void
    {
        let genomeView = <GenomeView.GenomeView>viewMgr.getViewByName("genomeView",this.views);
        if(!genomeView.genome)
            return;
        for(let i = 0; i != this.circularFigures.length; ++i)
        {
            if(genomeView.genome.uuid == this.circularFigures[i].uuid)
            {
                try
                {
                    document.getElementById(`${this.circularFigures[i].uuid}Open`).classList.add("selectedFigureInDropDown");
                }
                catch(err){}
            }
        }
    }
    public setFigureRadiusInInput() : void
    {
        let genomeView = <GenomeView.GenomeView>viewMgr.getViewByName("genomeView",this.views);
        let el = (<HTMLInputElement>document.getElementById("figureRadiusInput"));
        if(!genomeView.genome)
            el.value = "";
        else
            el.value = genomeView.genome.radius.toString();
    }
    public setFigureBPIntervalInput() : void
    {
        let genomeView = <GenomeView.GenomeView>viewMgr.getViewByName("genomeView",this.views);
        let el = (<HTMLInputElement>document.getElementById("figureBPIntervalInput"));
        if(!genomeView.genome)
            el.value = "";
        else
            el.value = genomeView.genome.circularFigureBPTrackOptions.interval.toString();
    }
    public setShowBPIntervalCheckBox() : void
    {
        let genomeView = <GenomeView.GenomeView>viewMgr.getViewByName("genomeView",this.views);
        if(!genomeView.genome)
            return;
        let checkbox = (<HTMLInputElement>document.getElementById("showBPIntervalCheckBox"));
        if(genomeView.genome.circularFigureBPTrackOptions.showLabels == 0)
            checkbox.checked = false;
        else if(genomeView.genome.circularFigureBPTrackOptions.showLabels == 1)
            checkbox.checked = true;
    }
    public onMount() : void
    {
        GenomeView.addView(this.views,"genomeView");
        for(let i = 0; i != this.views.length; ++i)
        {
            this.views[i].onMount();
        }
        let genomeView = <GenomeView.GenomeView>viewMgr.getViewByName("genomeView",this.views);
        let self = this;
        window.onbeforeunload = function(e){
            self.dataChanged();
        }
        document.getElementById("figures").onclick = function(this : HTMLElement,ev : MouseEvent){
            for(let i = 0; i != self.fastaInputs.length; ++i)
            {
                if((<any>ev.target).id == `${self.fastaInputs[i].uuid}NewFigure`)
                {
                    self.circularFigures.push(new CircularFigure(
                        "New Figure",
                        self.fastaInputs[i].uuid,
                        self.fastaInputs[i].contigs
                    ));
                    self.dataChanged();
                    genomeView.genome = self.circularFigures[self.circularFigures.length - 1];
                    genomeView.firstRender = true;
                    viewMgr.render();
                    self.setSelectedFigureInDropDown();
                    return;
                }
            }
            for(let i = 0; i != self.circularFigures.length; ++i)
            {
                if((<any>ev.target).id == `${self.circularFigures[i].uuid}Open`)
                {
                    genomeView.genome = self.circularFigures[i];
                    genomeView.firstRender = true;
                    viewMgr.render();
                    self.setSelectedFigureInDropDown();
                    return;
                }
            }
        }
        document.getElementById("figureOptions").onclick = function(this : HTMLElement,ev : MouseEvent){
            if((<any>event.target).id == `${genomeView.genome.uuid}ToggleInteractivity`)
            {
                genomeView.genome.isInteractive = !genomeView.genome.isInteractive;
                reCacheBaseFigure(genomeView.genome);
                tc.resetCaches();
                self.dataChanged();
                genomeView.firstRender = true;
                viewMgr.render();
            }
            if((<any>event.target).id == `${genomeView.genome.uuid}ToggleContigNames`)
            {
                genomeView.genome.showContigNames = !genomeView.genome.showContigNames;
                reCacheBaseFigure(genomeView.genome);
                tc.resetCaches();
                self.dataChanged();
                genomeView.firstRender = true;
                viewMgr.render();
            }
        }

        document.getElementById("showBPIntervalCheckBox").onclick = function(this : HTMLElement,ev : MouseEvent){
            document.getElementById("updateNavBarButton").click();
        }

        document.getElementById("openModalAligns").onclick = function(this : HTMLElement,ev : MouseEvent){
            self.alignsModalOpen = true;
            writeAlignsModal();
            self.showModal();
        }

        document.getElementById("openContigCreator").onclick = function(this : HTMLElement,ev : MouseEvent){
            self.contigCreatorModalOpen = true;
            writeContigCreatorModal();
            self.showModal();
        }

        document.getElementById("exportToSVG").onclick = function(this : HTMLElement,ev : MouseEvent){
            if(!genomeView.genome)
            {
                dialogs.alert("You must open a figure before you can export it");
                return;
            }
            genomeView.exportSVG();
        }

        document.getElementById("copyFigure").onclick = function(this : HTMLElement,ev : MouseEvent){
            if(!genomeView.genome)
            {
                dialogs.alert("You must open a figure before you can copy it");
                return;
            }
            ipc.send(
                "runOperation",
                <AtomicOperationIPC>{
                    opName : "copyCircularFigure",
                    figureuuid : genomeView.genome.uuid
                }
            );
        }

        document.getElementById("deleteFigure").onclick = function(this : HTMLElement,ev : MouseEvent){
            if(!genomeView.genome)
            {
                dialogs.alert("You must open a figure before you can delete it");
                return;
            }
            ipc.send(
                "runOperation",
                <AtomicOperationIPC>{
                    opName : "deleteCircularFigure",
                    figureuuid : genomeView.genome.uuid
                }
            );
        }

        document.getElementById("updateNavBarButton").onclick = function(this : HTMLElement,ev : MouseEvent){
            let radiusHasChanged = false;
            if(!genomeView.genome)
                    return;
            let radius = parseInt((<HTMLInputElement>document.getElementById("figureRadiusInput")).value);
            if(radius)
            {
                if(radius != genomeView.genome.radius)
                    radiusHasChanged = true;
                genomeView.genome.radius = radius;
            }

            let trackInterval = parseInt((<HTMLInputElement>document.getElementById("figureBPIntervalInput")).value);
            if(trackInterval)
                genomeView.genome.circularFigureBPTrackOptions.interval = trackInterval;

            let showInterval = ((<HTMLInputElement>document.getElementById("showBPIntervalCheckBox")).checked);
            if(showInterval !== undefined)
            {
                if(showInterval === true)
                    genomeView.genome.circularFigureBPTrackOptions.showLabels = 1;
                else
                    genomeView.genome.circularFigureBPTrackOptions.showLabels = 0;
            }
            if(radiusHasChanged)
            {
                if(!genomeView.genome.isInteractive)
                {
                    reCacheBaseFigure(genomeView.genome);
                }
                tc.triggerReCompileForWholeFigure(genomeView.genome);
            }
            genomeView.updateScope();
            self.dataChanged();
            viewMgr.render();
        }

        //on modal dismissal
        $("#modal").on('hidden.bs.modal',function(){
            self.resetModalStates();
        });
    }
    public onUnMount() : void
    {
        for(let i = 0; i != this.views.length; ++i)
        {
            this.views[i].onUnMount();
        }
    }
    public renderView() : string
    {
        let genomeView = <GenomeView.GenomeView>viewMgr.getViewByName("genomeView",this.views);
        let res = "";
        for(let i = 0; i != this.fastaInputs.length; ++i)
        {
            if(this.fastaInputs[i].checked && this.fastaInputs[i].indexedForVisualization)
            {
                res += `
                    <li><b>${this.fastaInputs[i].alias}</b></li>
                    <li role="separator" class="divider"></li>
                    <li><i><a id="${this.fastaInputs[i].uuid}NewFigure" href="#">New Figure</a></i></li>
                    <li role="separator" class="divider"></li>
                `;
                for(let j = 0; j != this.circularFigures.length; ++j)
                {
                    if(this.fastaInputs[i].checked && this.circularFigures[j].uuidFasta == this.fastaInputs[i].uuid)
                    {
                        res += `
                            <li><a id="${this.circularFigures[j].uuid}Open"href="#">${this.circularFigures[j].name}</a></li>
                        `;
                    }
                }
                res += `<li role="separator" class="divider"></li>`;
            }
        }
        document.getElementById("figures").innerHTML = res;

        res = ""
        if(genomeView.genome)
        {
            res += `<li><a href="#" id="${genomeView.genome.uuid}ToggleInteractivity">${genomeView.genome.isInteractive ? "Disable Interactivity" : "Enable Interactivity"}</a></li>`;
            res += `<li><a href="#" id="${genomeView.genome.uuid}ToggleContigNames">${genomeView.genome.showContigNames ? "Don't Show Contig Names" : "Show Contig Names"}</a></li>`;
        }
        document.getElementById("figureOptions").innerHTML = res;

        for(let i = 0; i != this.views.length; ++i)
        {
            this.views[i].render();
        }
        if(this.alignsModalOpen)
            writeAlignsModal();
        if(this.availableTracksModalOpen)
            writeAvailableTracksModal();
        if(this.contigEditorModalOpen)
            writeContigEditorModal();
        if(this.contigCreatorModalOpen)
            writeContigCreatorModal();

        if(this.loadingModal)
            writeLoadingModal();
        //viewMgr will not call postRender for a view that does no rendering so we'll do it explicitly
        this.postRender();
        return undefined;
    }
    public postRender() : void
    {
        for(let i = 0; i != this.views.length; ++i)
        {
            this.views[i].postRender();
        }
        this.setSelectedFigureInDropDown();
        this.setFigureRadiusInInput();
        this.setFigureBPIntervalInput();
        this.setShowBPIntervalCheckBox();
    }
    public dataChanged() : void
    {
        ipc.send(
            "saveKey",
            <SaveKeyEvent>{
                action : "saveKey",
                channel : "circularGenomeBuilder",
                key : "circularFigures",
                val : this.circularFigures
            }
        );
    }
    public divClickEvents(event : JQueryEventObject) : void
    {
        let genomeView = <GenomeView.GenomeView>viewMgr.getViewByName("genomeView",this.views);        
    }
}