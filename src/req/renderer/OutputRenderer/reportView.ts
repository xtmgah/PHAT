import * as viewMgr from "./../viewMgr";
import * as masterView from "./masterView";
import * as rightPanel from "./rightPanel";

import {getQCSummaryByNameOfReportByIndex} from "./../../QCData"

export function addView(arr : Array<viewMgr.View>,div : string)
{
    arr.push(new View(div));
}
export class View extends viewMgr.View
{
    public constructor(div : string)
    {
        super("reportView",div);
    }
    public onMount() : void{}
    public onUnMount() : void{}
    public renderView() : string
    {
        let masterView = <masterView.View>viewMgr.getViewByName("masterView");
        let rightPanel = <rightPanel.View>viewMgr.getViewByName("rightPanel",masterView.views);
        return `
            ${(()=>{
                let res = "";
                if(masterView.displayInfo == "QCInfo")
                {
                    res += `
                        <table style="width:100%">
                            <tr>
                                ${rightPanel.fastQInfoSelection.alias != false ? "<th>Alias</th>" : ""}
                                ${rightPanel.fastQInfoSelection.fullName != false ? "<th>Full Path</th>" : ""}
                                ${rightPanel.fastQInfoSelection.sizeInBytes != false ? "<th>Size In Bytes</th>" : ""}
                                ${rightPanel.fastQInfoSelection.formattedSize != false ? "<th>Formatted Size</th>" : ""}
                                ${rightPanel.fastQInfoSelection.numberOfSequences != false ? "<th>Number of Sequences</th>" : ""}
                                ${rightPanel.fastQInfoSelection.PBSQ != false ? "<th>Per Base Sequence Quality</th>" : ""}
                                ${rightPanel.fastQInfoSelection.PSQS != false ? "<th>Per Sequence Quality Score</th>" : ""}
                                ${rightPanel.fastQInfoSelection.PSGCC != false ? "<th>Per Sequence GC Content</th>" : ""}
                                ${rightPanel.fastQInfoSelection.SDL != false ? "<th>Sequence Duplication Levelsias</th>" : ""}
                                ${rightPanel.fastQInfoSelection.ORS != false ? "<th>Over Represented Sequences</th>" : ""}
                            </tr>

                    ${(()=>{
                            
                            for(let i = 0; i != masterView.fastqInputs.length; ++i)
                            {
                                if(masterView.fastqInputs[i].checked)
                                {
                                    res += "<tr>";
                                    if(rightPanel.fastQInfoSelection.alias)
                                        res += `<td>${masterView.fastqInputs[i].alias}</td>`;
                                    if(rightPanel.fastQInfoSelection.fullName)
                                        res += `<td>${masterView.fastqInputs[i].absPath}</td>`;
                                    if(rightPanel.fastQInfoSelection.sizeInBytes)
                                        res += `<td>${masterView.fastqInputs[i].size}</td>`;
                                    if(rightPanel.fastQInfoSelection.formattedSize)
                                        res += `<td>${masterView.fastqInputs[i].sizeString}</td>`;
                                    if(rightPanel.fastQInfoSelection.numberOfSequences)
                                        res += `<td>${masterView.fastqInputs[i].sequences}</td>`;
                                    if(rightPanel.fastQInfoSelection.PBSQ)
                                        res += `<td>${getQCSummaryByNameOfReportByIndex(masterView.fastqInputs,i,"Per base sequence quality")}</td>`;
                                    if(rightPanel.fastQInfoSelection.PSQS)
                                        res += `<td>${getQCSummaryByNameOfReportByIndex(masterView.fastqInputs,i,"Per sequence quality scores")}</td>`;
                                    if(rightPanel.fastQInfoSelection.PSGCC)
                                        res += `<td>${getQCSummaryByNameOfReportByIndex(masterView.fastqInputs,i,"Per sequence GC content")}</td>`;
                                    if(rightPanel.fastQInfoSelection.SDL)
                                        res += `<td>${getQCSummaryByNameOfReportByIndex(masterView.fastqInputs,i,"Sequence Duplication Levels")}</td>`;
                                    if(rightPanel.fastQInfoSelection.ORS)
                                        res += `<td>${getQCSummaryByNameOfReportByIndex(masterView.fastqInputs,i,"Overrepresented sequences")}</td>`;
                                    res += "</tr>";
                                }
                            }
                            return res;
                        })()}

                        </table>
                    `;
                }

                if(masterView.displayInfo == "AlignmentInfo")
                {
                    res += `
                        <table style="width:100%">
                            <tr>
                                ${rightPanel.alignmentInfoSelection.alias != false ? "<th>Alias</th>" : ""}
                                ${rightPanel.alignmentInfoSelection.sizeInBytes != false ? "<th>Size In Bytes</th>" : ""}
                                ${rightPanel.alignmentInfoSelection.formattedSize != false ? "<th>Formatted Size</th>" : ""}
                                ${rightPanel.alignmentInfoSelection.reads != false ? "<th>Reads</th>" : ""}
                                ${rightPanel.alignmentInfoSelection.mates != false ? "<th>Mates</th>" : ""}
                                ${rightPanel.alignmentInfoSelection.overallAlignmentRate != false ? "<th>Overall Alignment Rate %</th>" : ""}
                                ${rightPanel.alignmentInfoSelection.minimumCoverage != false ? "<th>Minimum Coverage</th>" : ""}
                                ${rightPanel.alignmentInfoSelection.minimumVariableFrequency != false ? "<th>Minimum Variable Frequency</th>" : ""}
                                ${rightPanel.alignmentInfoSelection.minimumAverageQuality != false ? "<th>Minimum Average Quality</th>" : ""}
                                ${rightPanel.alignmentInfoSelection.pValueThreshold != false ? "<th>P-Value Threshold</th>" : ""}
                                ${rightPanel.alignmentInfoSelection.SNPsPredicted != false ? "<th>SNPs Predicted</th>" : ""}
                                ${rightPanel.alignmentInfoSelection.indelsPredicted != false ? "<th>Indels Predicted</th>" : ""}
                                ${rightPanel.alignmentInfoSelection.dateRan != false ? "<th>Date Ran</th>" : ""}
                                ${rightPanel.alignmentInfoSelection.SNPPositions != false ? "<th>SNP Positions</th>" : ""}
                            </tr>

                        

                        </table>
                    `;
                }
                return res;
            })()}
        `;
    }
    public postRender() : void{}
    public dataChanged() : void{}
    public divClickEvents(event : JQueryEventObject) : void{}
}
