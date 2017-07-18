/// <reference types="jquery" />
import * as electron from "electron";
const ipc = electron.ipcRenderer;

import * as viewMgr from "./../viewMgr";
import Fastq from "./../../fastq";
import {Fasta} from "./../../fasta";
import {AtomicOperationIPC} from "./../../atomicOperationsIPC";
export class ReportView extends viewMgr.View
{
    public fastqInputs : Array<Fastq>;
    public fastaInputs : Array<Fasta>;
    public selectedFastq1 : Fastq;
    public selectedFastq2 : Fastq;
    public selectedFasta : Fasta;
    public constructor(div : string)
    {
        super('report',div);
        this.fastqInputs = new Array<Fastq>();
        this.fastaInputs = new Array<Fasta>();
    }
    public onMount() : void{}
    public onUnMount() : void{}
    public dataChanged() : void{}
    public renderView() : string | undefined
    {
        return `
        <div class="outerCenteredDiv">
            <div class="innerCenteredDiv">
            <div id="reads" style="display:inline-block;width:45%;float:left;">
            ${(()=>{
                let res = "";
                res += `
                    <table style="width:100%">
                        <tr>
                            <th>Reads</th>
                        </tr>
                `;
                for(let i = 0; i != this.fastqInputs.length; ++i)
                {
                    if(!this.fastqInputs[i].checked)
                        continue;
                    res += `<tr>`;
                    if(this.selectedFastq1 && this.fastqInputs[i].uuid == this.selectedFastq1.uuid)
                    {
                        res += `<td class="activeHover selected" id="${this.fastqInputs[i].uuid}">${this.fastqInputs[i].alias} <b style="float:right;">1</b></td>`;
                    }
                    else if(this.selectedFastq2 && this.fastqInputs[i].uuid == this.selectedFastq2.uuid)
                    {
                        res += `<td class="activeHover selected" id="${this.fastqInputs[i].uuid}">${this.fastqInputs[i].alias} <b style="float:right;">2</b></td>`;
                    }
                    else
                        res += `<td class="activeHover" id="${this.fastqInputs[i].uuid}">${this.fastqInputs[i].alias}</td>`;
                    res += `</tr>`;
                }
                res += `</table>`;
                return res;
            })()}
            </div>
            <div id="refSeqs" style="display:inline-block;width:45%;">
            ${(()=>{
                let res = "";
                res += `
                    <table style="width:100%">
                        <tr>
                            <th>Ref Seqs</th>
                        </tr>
                `;
                for(let i = 0; i != this.fastaInputs.length; ++i)
                {
                    if(!this.fastaInputs[i].indexed || !this.fastaInputs[i].checked)
                        continue;
                    res += `<tr>`;
                    if(this.selectedFasta && this.fastaInputs[i].uuid == this.selectedFasta.uuid)
                    {
                        res += `<td class="activeHover selected" id="${this.fastaInputs[i].uuid}">${this.fastaInputs[i].alias} <b style="float:right;">*</b></td>`;
                    }
                    else
                        res += `<td class="activeHover" id="${this.fastaInputs[i].uuid}">${this.fastaInputs[i].alias}</td>`;
                    res += `</tr>`;
                }
                res += `</table>`;
                return res;
            })()}
            </div>
            <div>
                ${(()=>{
                    let res = "";
                    return res;
                })()}
            </div>
            </div>
        </div>
        `;
    }
    public postRender() : void
    {

    }
    public divClickEvents(event : JQueryEventObject) : void
    {
        if(this.selectedFastq1 && event.target.id == this.selectedFastq1.uuid)
        {
            this.selectedFastq1 = undefined;
            viewMgr.render();
            return;
        }
        else if(this.selectedFastq2 && event.target.id == this.selectedFastq2.uuid)
        {
            this.selectedFastq2 = undefined;
            viewMgr.render();
            return;
        }
        else if(this.selectedFasta && event.target.id == this.selectedFasta.uuid)
        {
            this.selectedFasta = undefined;
            viewMgr.render();
            return;
        }
        for(let i = 0; i != this.fastqInputs.length; ++i)
        {
            if(event.target.id == this.fastqInputs[i].uuid)
            {
                if(!this.selectedFastq1)
                {
                    this.selectedFastq1 = this.fastqInputs[i];
                    viewMgr.render();
                    return;
                }
                if(!this.selectedFastq2)
                {
                    this.selectedFastq2 = this.fastqInputs[i];
                    viewMgr.render();
                    return;
                }
                
            }
        }
        for(let i = 0; i != this.fastaInputs.length; ++i)
        {
            if(event.target.id == this.fastaInputs[i].uuid)
            {
                if(!this.selectedFasta)
                {
                    this.selectedFasta = this.fastaInputs[i];
                    viewMgr.render();
                    return;
                }
            }
        }
    }

}

export function addView(arr : Array<viewMgr.View>,div : string) : void
{
    arr.push(new ReportView(div));
}