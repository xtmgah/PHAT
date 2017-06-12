import * as electron from "electron";
const ipc = electron.ipcRenderer;

import {GetKeyEvent,KeySubEvent} from "./req/ipcEvents";
import * as viewMgr from "./req/renderer/viewMgr";

import * as masterView from "./req/renderer/OutputRenderer/masterView";

import * as $ from "jquery";
(<any>window).$ = $;
require("./req/renderer/commonBehaviour");
$
(
    function()
    {
        masterView.addView(viewMgr.views,"view");
        viewMgr.changeView("masterView");


        viewMgr.render();
        ipc.on
        (
            "output",function(event,arg)
            {
                if(arg.action === "getKey" || arg.action === "keyChange")
                {
                    //if(arg.key == "fastqInputs" && arg.val !== undefined)
                     //   (<reportView.ReportView>viewMgr.getViewByName("report",(<masterView.MasterView>viewMgr.getViewByName("masterReportView")).views)).fastqInputs = arg.val;
                }
                viewMgr.render();
            }
        );

        ipc.send(
            "keySub",
            <KeySubEvent>{
                action : "keySub",
                channel : "input",
                key : "fastqInputs",
                replyChannel : "output"
            }
        );
        ipc.send(
            "keySub",
            <KeySubEvent>{
                action : "keySub",
                channel : "QC",
                key : "QCData",
                replyChannel : "output"
            }
        );


        ipc.send(
            "getKey",
            <KeySubEvent>{
                action : "keySub",
                channel : "input",
                key : "fastqInputs",
                replyChannel : "output"
            }
        );
        ipc.send(
            "getKey",
            <KeySubEvent>{
                action : "keySub",
                channel : "QC",
                key : "QCData",
                replyChannel : "output"
            }
        );
        viewMgr.render();
    }
);