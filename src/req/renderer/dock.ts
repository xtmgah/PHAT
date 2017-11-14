import * as electron from "electron";
const screen = electron.screen;
const ipc = electron.ipcRenderer;

import {AtomicOperationIPC} from "./../atomicOperationsIPC";
import {getReadable} from "./../getAppPath";
import { AtomicOperation } from "../operations/atomicOperations";

let electronTabs : any = undefined;
let tabGroup : any = undefined;
let dragula : any = undefined;
let drake : any = undefined;
function ensureTabGroupInit() : void
{
    if(tabGroup)
        return;

    document.body.insertAdjacentHTML("beforeend",`
    <div id="dock"
        <div class="etabs-tabgroup">
            <div class="etabs-tabs"></div>
            <div class="etabs-buttons"></div>
        </div>
        <div class="etabs-views"></div>
    </div>
    `);

    electronTabs = require("@chgibb/electron-tabs");
    dragula = require("dragula");

    tabGroup = new electronTabs({
        ready : function(tabGroup : any){
            drake = dragula([tabGroup.tabContainer],{
                direction : "horizontal"
            });
            drake.on("dragend",function(el : any,container : any,source : any){
                let clientBounds = electron.remote.getCurrentWindow().getBounds();
                let cursorPos = screen.getCursorScreenPoint();
                if(cursorPos.x < clientBounds.x)
                    unDockActiveTab();
                else if(cursorPos.y < clientBounds.y)
                    unDockActiveTab();
                else if(cursorPos.x > clientBounds.x + clientBounds.width)
                    unDockActiveTab();
                else if(cursorPos.y > clientBounds.y + clientBounds.height)
                    unDockActiveTab();
            });
        }
    });
    
    tabGroup.on("tab-added",function(tab : any,tabGroup : any){
        let tabs = document.getElementsByClassName("etabs-tab");
        for(let i = 0; i != tabs.length; ++i)
        {
            if(!tabs[i].classList.contains("activeHover"))
                tabs[i].classList.add("activeHover");
        }
    });

    refNameToTab["input"] = <Tab>{
        filePath : "Input.html",
        title : "Input",
        visible : true,
        active : true
    };
    
    refNameToTab["QC"] = <Tab>{
        filePath : "QC.html",
        title : "QC",
        visible : true,
        active : true
    };

    refNameToTab["align"] = <Tab>{
        filePath : "Align.html",
        title : "Align",
        visible : true,
        active : true
    };

    refNameToTab["output"] = <Tab>{
        filePath : "Output.html",
        title : "Output",
        visible : true,
        active : true
    };
    
    refNameToTab["circularGenomeBuilder"] = <Tab>{
        filePath : "circularGenomeBuilder.html",
        title : "Genome Builder",
        visible : true,
        active : true
    };
}

export interface DockIpc
{
    refName : "circularGenomeBuilder";
}

export interface Tab
{
    filePath : string;
    title : string;
    visible : boolean;
    active : boolean;
}

let refNameToTab : {[key : string] : Tab;} = {};

function getRefNameFromTitle(title : string) : string | undefined
{
    for(let i in refNameToTab)
    {
        if(refNameToTab[i].title == title)
        {
            return i;
        }
    }
    return undefined;
}

export function initializeWindowDock() : void
{
    ipc.on("dockWindow",function(event : Electron.IpcMessageEvent,arg : DockIpc){
        ensureTabGroupInit();
        let tab = refNameToTab[arg.refName];
        let newTab = tabGroup.addTab({
            title : tab.title,
            src : `file://${getReadable(tab.filePath)}`,
            visible : tab.visible,
            active : tab.active,
            webviewAttributes : {nodeintegration : true}
        });
        newTab.webview.addEventListener("destroyed",function(e : any){
            newTab.close();
        });
    });
}

let refNameToDock = "";
export function makeWindowDockable(refName : string) : void
{
    refNameToDock = refName;
}

export function dockThisWindow(target = "toolBar") : void
{
    if(!refNameToDock)
        return;
    dockWindow(refNameToDock,target);
}

export function dockWindow(refName : string,target : string) : void
{
    ipc.send(
        "runOperation",
        <AtomicOperationIPC>{
            opName : "dockWindow",
            toDock : refName,
            dockTarget : target
        }
    );
}

export function unDockActiveTab() : void
{
    ipc.send(
        "runOperation",
        <AtomicOperationIPC>{
            opName : "unDockWindow",
            refName : getRefNameFromTitle(tabGroup.getActiveTab().title),
            guestinstance : tabGroup.getActiveTab().webview.guestinstance
        }
    );
}