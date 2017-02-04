var viewMgr = require('./../viewMgr');
var QCClass = require("./../QC");

module.exports.addView = function(arr,div,models)
{
    arr.push
    (
        new class extends viewMgr.View
        {
            constructor()
            {
                super("report",div,models);
                this.alias = false;
                this.fullName = false;
                this.sizeInBytes = false;
                this.formattedSize = false;
                this.numberOfSequences = false;
                this.PBSQ = false;
                this.PSQS = false;
                this.PSGCC = false;
                this.SDL = false;
                this.ORS = false;

                this.fastqInputs = new Array();
                this.QC = new QCClass
                (
                    "output",
                    {
                        postStateHandle : function(channel,args){},
                        spawnHandle : function(channel,arg){},
                        fsAccess : function(str){}
                    }
                );
            }
            onMount(){}
            onUnMount(){}
            renderView()
            {
                return `
                    <table style='width:100%'>
                    <tr>
                        ${this.alias != false ? "<th>Alias</th>" : ""}
                        ${this.fullName != false ? "<th>Full Path</th>" : ""}
                        ${this.sizeInBytes != false ? "<th>Size In Bytes</th>" : ""}
                        ${this.formattedSize != false ? "<th>Formatted Size</th>" : ""}
                        ${this.numberOfSequences != false ? "<th>Number of Sequences</th>" : ""}
                        ${this.PBSQ != false ? "<th>Per Base Sequence Quality</th>" : ""}
                        ${this.PSQS != false ? "<th>Per Sequence Quality Score</th>" : ""}
                        ${this.PSGCC != false ? "<th>Per Sequence GC Content</th>" : ""}
                        ${this.SDL != false ? "<th>Sequence Duplication Levels</th>" : ""}
                        ${this.ORS != false ? "<th>Over Represented Sequences</th>" : ""}
                    </tr>
                    ${(()=>{
                            let res = "";
                            for(let i = 0; i != this.fastqInputs.length; ++i)
                            {
                                if(this.fastqInputs[i].checked)
                                {
                                    let QCDataIndex;
                                    for(let k = 0; k != this.QC.QCData.length; ++k)
                                    {
                                        if(this.QC.QCData[k].name == this.fastqInputs[i].name)
                                        {
                                            QCDataIndex = k;
                                            break;
                                        }
                                    }
                                    res += "<tr>";
                                    if(this.alias)
                                        res += `<td>${this.fastqInputs[i].alias}</td>`;
                                    if(this.fullName)
                                        res += `<td>${this.fastqInputs[i].name}</td>`;
                                    if(this.sizeInBytes)
                                        res += `<td>${parseInt(this.fastqInputs[i].size)}</td>`;
                                    if(this.formattedSize)
                                        res += `<td>${this.fastqInputs[i].sizeString}</td>`;
                                    if(this.numberOfSequences)
                                        res += `<td>${this.fastqInputs[i].sequences}</td>`;
                                    if(this.PBSQ)
                                        res += `<td>${this.QC.getQCSummaryByNameOfReportByIndex(QCDataIndex,"Per base sequence quality")}</td>`;
                                    if(this.PSQS)
                                        res += `<td>${this.QC.getQCSummaryByNameOfReportByIndex(QCDataIndex,"Per sequence quality scores")}</td>`;
                                    if(this.PSGCC)
                                        res += `<td>${this.QC.getQCSummaryByNameOfReportByIndex(QCDataIndex,"Per sequence GC content")}</td>`;
                                    if(this.SDL)
                                        res += `<td>${this.QC.getQCSummaryByNameOfReportByIndex(QCDataIndex,"Sequence Duplication Levels")}</td>`;
                                    if(this.ORS)
                                        res += `<td>${this.QC.getQCSummaryByNameOfReportByIndex(QCDataIndex,"Overrepresented sequences")}</td>`;
                                    res += "</tr>";
                                }
                            }
                            return res;
                        })()}
                    </table>
                `;
            }
            postRender(){}
            dataChanged(){}
            divClickEvents(event){}
        }
    );
}