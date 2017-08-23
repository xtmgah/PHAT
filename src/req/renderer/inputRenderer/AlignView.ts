import * as viewMgr from "./../viewMgr";
import {getReadable} from "./../../getAppPath";
import {AlignData} from "./../../alignData";
export class View extends viewMgr.View
{
    public aligns : Array<AlignData>;
    public constructor(div : string)
    {
        super("alignView",div);
        this.aligns = new Array<AlignData>();
    }
    public onMount() : void{}
    public onUnMount() : void{}
    public renderView() : string
    {
        return `
        <img class="topButton activeHover activeHoverButton" id="browseAlignFiles" src="${getReadable("img/browseButton.png")}"><br />
        <div id="alignTableDiv" style="width:100%;">
        <table style="width:100%;">
            <tr>
                <th>File Name</th>
                <th>Path</th>
                <th>Size</th>
                <th>Ref Seq</th>
            </tr>
            ${(()=>{
                let res = "";

                return res;
            })()}
        </table>
    </div>
        `;
    }
    public postRender() : void{}
    public divClickEvents(event : JQueryEventObject) : void{}
    public dataChanged() : void{}
}
export function addView(arr : Array<viewMgr.View>,div : string) : void
{
    arr.push(new View(div));
}