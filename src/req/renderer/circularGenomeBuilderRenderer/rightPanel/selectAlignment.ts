import * as viewMgr from "./../../viewMgr";
import * as masterView from "./../masterView";
import {GenomeView} from "./../genomeView";
import {RightPanel} from "./../rightPanel";
import alignData from "./../../../alignData";
import * as cf from "./../../circularFigure";

export class SelectAlignment extends viewMgr.View
{
    public genome : cf.CircularFigure;
    public alignData : Array<alignData>;
    public constructor(name : string,div : string)
    {
        super(name,div);
    }
    public onMount() : void{}
    public onUnMount() : void{}
    public renderView() : string
    {
        let masterView = <masterView.View>viewMgr.getViewByName("masterView");
        let genomeView = <GenomeView>viewMgr.getViewByName("genomeView",masterView.views);
        this.genome = genomeView.genome;
        return ` 
            <h1>Coverage Options</h1>
            ${(()=>{
                let res : string = `
                    <table style='width:100%'>
                        <tr>
                            <th>Use</th>
                            <th>Name</th>
                            <th>Reads</th>
                            <th>Mates</th>
                            <th>Overall Alignment Rate %</th>
                            <th>Date Ran</th>
                        </tr>
                `;
                if(this.alignData)
                {
                    for(let i : number = 0; i != this.alignData.length; ++i)
                    {
                        if(this.alignData[i].fasta.uuid == genomeView.genome.uuidFasta)
                        {
                            res += `
                                <tr>
                                    <td><input type="radio" id="${this.alignData[i].uuid}" /></td>
                                    <td>${this.alignData[i].alias}</td>
                                    <td>${this.alignData[i].summary.reads}</td>
                                    <td>${this.alignData[i].summary.mates}</td>
                                    <td>${this.alignData[i].summary.overallAlignmentRate}</td>
                                    <td>${this.alignData[i].dateStampString}</td>
                                </tr>
                            `;
                        }
                    }
                }
                res += `</table>`;
                return res;
            })()}
        `;
    }
    public postRender() : void
    {
        let masterView = <masterView.View>viewMgr.getViewByName("masterView");
        let rightPanel = <RightPanel>viewMgr.getViewByName("rightPanel",masterView.views);
        if(rightPanel.selectedAlignment)
        {
            (<HTMLInputElement>document.getElementById(rightPanel.selectedAlignment.uuid)).checked = true;
        }
    }
    public dataChanged() : void{}
    public divClickEvents(event : JQueryEventObject) : void
    {
        if(event.target.id)
        {
            for(let i : number = 0; i != this.alignData.length; ++i)
            {
                if(event.target.id == this.alignData[i].uuid)
                {
                    let masterView = <masterView.View>viewMgr.getViewByName("masterView");
                    let rightPanel = <RightPanel>viewMgr.getViewByName("rightPanel",masterView.views);
                    rightPanel.selectedAlignment = this.alignData[i];
                    viewMgr.render();
                }
            }
        }
    }
}
export function addView(arr : Array<viewMgr.View>,div : string)
{
    arr.push(new SelectAlignment("selectAlignment",div));
}