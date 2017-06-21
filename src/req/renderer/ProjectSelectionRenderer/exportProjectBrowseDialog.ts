import * as fse from "fs-extra";

import * as electron from "electron";
const dialog = electron.remote.dialog;

import {ProjectManifest,getTarBallPath} from "./../../projectManifest";

export function exportProjectBrowseDialog(proj : ProjectManifest) : Promise<undefined>
{
    return new Promise((resolve,reject) => {
        dialog.showSaveDialog(
            {
                filters : [
                    {
                        name : "PHAT Project",
                        extensions : ["phat"]
                    }
                ]
            },
            function(fileName : string)
            {
                if(fileName === undefined)
                    return;
            
                fse.copy(
                    getTarBallPath(proj),fileName,(err : Error) => {
                        if(err)
                            reject(err);
                        else
                        {
                            resolve();
                        }
                    }
                );
            }
        );
    });
}