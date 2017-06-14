import * as fs from "fs";

import {getReadableAndWritable} from "./../../getAppPath";
import * as viewMgr from "./../viewMgr";
import * as masterView from "./masterView";
import * as rightPanel from "./rightPanel";

import {getQCSummaryByNameOfReportByIndex} from "./../../QCData"
import {VCF2JSONRow} from "./../../varScanMPileup2SNPVCF2JSON";

import {renderQCReportTable} from "./reportView/renderQCReportTable";
import {renderAlignmentReportTable} from "./reportView/renderAlignmentReportTable";
import {renderSNPPositionsTable} from "./reportView/renderSNPPositionsTable";

export function addView(arr : Array<viewMgr.View>,div : string)
{
    arr.push(new View(div));
}
export class View extends viewMgr.View
{
    public inspectingUUID : string;
    public vcfRows : Array<VCF2JSONRow>;
    public constructor(div : string)
    {
        super("reportView",div);
        this.inspectingUUID = "";
        this.vcfRows = new Array<VCF2JSONRow>();
    }
    public onMount() : void{}
    public onUnMount() : void{}
    public renderView() : string
    {
        let masterView = <masterView.View>viewMgr.getViewByName("masterView");
        let rightPanel = <rightPanel.View>viewMgr.getViewByName("rightPanel",masterView.views);

        

        //if we're looking at SNP position, refresh table information if the alignment being inspected has changed
        if(masterView.displayInfo == "SNPPositions")
        {
            if(this.inspectingUUID != masterView.inspectingUUID)
            {
                this.vcfRows = JSON.parse(
                            fs.readFileSync(getReadableAndWritable(`rt/AlignmentArtifacts/${masterView.inspectingUUID}/snps.json`)
                    ).toString()
                );
                this.inspectingUUID = masterView.inspectingUUID;
            }
        }
        else
            this.vcfRows = new Array<VCF2JSONRow>();

        return `
            ${renderQCReportTable()}
            ${renderAlignmentReportTable()}
            ${renderSNPPositionsTable(this.vcfRows)}

        `;
    }
    public postRender() : void{}
    public dataChanged() : void{}
    public divClickEvents(event : JQueryEventObject) : void
    {
        if(!event.target.id)
            return;
        let masterView = <masterView.View>viewMgr.getViewByName("masterView");
        for(let i = 0; i != masterView.alignData.length; ++i)
        {
            if(event.target.id == masterView.alignData[i].uuid)
            {
                masterView.inspectingUUID = masterView.alignData[i].uuid;
                masterView.displayInfo = "SNPPositions";
                viewMgr.render();
                return;
            }
        }
    }
}
