import {getReadable} from "./../../getAppPath";
import {alignData,getUnSortedBam,getSortedBam} from "./../../alignData";
import {SpawnRequestParams} from "./../../JobIPC";
import {Job,JobCallBackObject} from "./../../main/Job";

export function samToolsSort(alignData : alignData) : Promise<{}>
{
    return new Promise((resolve,reject) => {
        let samToolsExe = getReadable('samtools');

        let jobCallBack : JobCallBackObject = {
            send(channel : string,params : SpawnRequestParams)
            {
                if(params.processName == samToolsExe && params.args[0] == "sort")
                {
                    if(params.done && params.retCode !== undefined)
                    {
                        if(params.retCode == 0)
                        {
                            resolve();
                        }
                        else
                        {
                            return reject(`Failed to sort bam for ${alignData.alias}`);
                        }
                    }
                }
            }
        }
        let input : string = getUnSortedBam(alignData);
        let output : string;
        output = getSortedBam(alignData);

        let args : Array<string> = new Array<string>();
        args = <Array<string>>[
            "sort",
            input,
            "-o",
            output
        ];
        let samToolsSortJob = new Job(samToolsExe,args,"",true,jobCallBack,{});
        try
        {
            samToolsSortJob.Run();
        }
        catch(err)
        {
            return reject(err);
        }
    });
}