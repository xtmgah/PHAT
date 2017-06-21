import * as fs from "fs";

import * as rimraf from "rimraf";
const tarfs = require("tar-fs");
const tarStream = require("tar-stream");
const gunzip = require("gunzip-maybe");

import {getReadableAndWritable} from "./getAppPath";
import {ProjectManifest,getTarBallPath} from "./projectManifest";
import {rebuildRTDirectory} from "./main/rebuildRTDirectory"
import * as dataMgr from "./main/dataMgr";

export function openProject(proj : ProjectManifest,cb : (toUnpack : number,unPacked : number) => void) : Promise<{}>
{
    return new Promise((resolve,reject) => {
        dataMgr.clearData();
        rimraf.sync(getReadableAndWritable("rt"));
        let projectTarBall = getTarBallPath(proj);
        try
        {
            fs.accessSync(projectTarBall)
            let totalFiles = 0;
            let unPackedFiles = 0;

            let countFiles = tarStream.extract();
            countFiles.on(
                "entry",(header : any,stream : any,next : () => void) => {
                    if(header)
                    {
                        totalFiles++;
                        cb(totalFiles,unPackedFiles);
                    }
                    stream.on("end",() => {
                        next();
                    });
                    stream.resume();
            });
            countFiles.on("finish",() => {
                let extract = tarfs.extract(getReadableAndWritable("rt"),{
                    ignore : (name : string) => {
                        unPackedFiles++;
                        cb(totalFiles,unPackedFiles);
                        return false;
                    }
                });
                extract.on("finish",() => {
                    resolve();
                });
                let unPackStream = fs.createReadStream(projectTarBall).pipe(gunzip()).pipe(extract);
            });
            fs.createReadStream(projectTarBall).pipe(gunzip()).pipe(countFiles);
        }
        catch(err)
        {
            rebuildRTDirectory();
            resolve();
        }
    });
}