/// <reference types="jquery" />

import * as electron from "electron";
const ipc = electron.ipcRenderer;

import {SaveKeyEvent} from "./../../ipcEvents";
import * as viewMgr from "./../viewMgr";
import {CircularFigure,} from "./../circularFigure";
import {Fasta} from "./../../fasta";

import * as GenomeView from "./genomeView";

import * as $ from "jquery";
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
    public firstRender : boolean;
    public leftPanelOpen : boolean;
    public rightPanelOpen : boolean;
    public circularFigures : Array<CircularFigure>;
    public fastaInputs : Array<Fasta>;
    public constructor(div : string)
    {
        super("masterView",div);
        this.views = new Array<viewMgr.View>();
        this.firstRender = true;
        this.leftPanelOpen = false;
        this.rightPanelOpen = false;
        this.circularFigures = new Array<CircularFigure>();
        this.fastaInputs = new Array<Fasta>();
    }
    public onMount() : void
    {
        GenomeView.addView(this.views,"genomeView");
        for(let i = 0; i != this.views.length; ++i)
        {
            this.views[i].onMount();
        }
        let self = this;
        window.onbeforeunload = function(e){
            self.dataChanged();
        }
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
        let res = "";
        for(let i = 0; i != this.fastaInputs.length; ++i)
        {
            if(this.fastaInputs[i].checked && this.fastaInputs[i].indexed)
            {
                res += `
                    <li role="separator" class="divider"></li>
                    <li><b>${this.fastaInputs[i].alias}</b></li>
                    <li role="separator" class="divider"></li>
                    <li><i><a href="#">New Figure</a></i></li>
                `;
                for(let j = 0; j != this.circularFigures.length; ++j)
                {
                    if(this.circularFigures[j].uuidFasta == this.fastaInputs[i].uuid)
                    {
                        res += `
                            <li><a href="#">${this.circularFigures[j].name}</a></li>
                        `;
                    }
                }
            }
        }
        document.getElementById("figures").innerHTML = res;
        if(this.firstRender)
        {
            this.leftPanelOpen = false;
            this.rightPanelOpen = false;
            this.firstRender = false;
            return `
                    
                `;
            }
            for(let i = 0; i != this.views.length; ++i)
            {
                this.views[i].render();
            }
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