import * as fs from "fs";

let GitHubReleases = require("github-releases");
const tarfs = require("tar-fs");
const tarStream = require("tar-stream");
const gunzip = require("gunzip-maybe");

import {AtomicOperationForkEvent,AtomicOperationIPC,CompletionFlags} from "./req/atomicOperationsIPC";

let flags : CompletionFlags = new CompletionFlags();

let asset : any;
let token : string;
process.on
(
    "message",function(ev : AtomicOperationForkEvent)
    {
        if(ev.setData == true)
        {
            asset = ev.data.asset;
            token = ev.data.token;
            process.send(<AtomicOperationForkEvent>{finishedSettingData : true});
            return;
        }
        if(ev.run == true)
        {
            let ghr = new GitHubReleases({user : "chgibb",repo : "PHAT",token : token});
            ghr.downloadAsset(asset,(error : string,istream : fs.ReadStream) => {
                if(error)
                    throw new Error(error);
                let progress = 0;
                istream.on("data",(chunk : Buffer) => {
                    progress += chunk.length;
                    process.send(
                        <AtomicOperationForkEvent>{
                            update : true,
                            data : {downloadProgress:progress},
                            flags : flags
                        }
                    );
                });
                const ostream = fs.createWriteStream("phat.update");
                istream.pipe(ostream);
                istream.on("error",(error : string) => {throw new Error(error);});
                ostream.on("error",(error : string) => {throw new Error(error);});
                ostream.on("close",() => {


                    let totalFiles = 0;
                    let countedFiles = 0;
                    let unPackedFiles = 0;

                    let countFiles = tarStream.extract();
                    countFiles.on(
                        "entry",(header : any,stream : any,next : () => void) => {
                            if(header)
                            {
                                totalFiles++;
                            }
                            stream.on("end",() => {
                                next();
                            });
                            stream.resume();
                        }
                    );
                    countFiles.on("finish",() => {
                        process.send(
                            <AtomicOperationForkEvent>{
                                update : true,
                                data : {totalFiles:totalFiles},
                                flags : flags
                            }
                        );
                        if(process.platform == "linux")
                        {
                            fs.unlinkSync("phat");
                        }
                        let extract = tarfs.extract("./../phat-linux-x64",{
                            ignore : (name : string) => {
                                unPackedFiles++;
                                process.send(
                                    <AtomicOperationForkEvent>{
                                        update : true,
                                        data : {unPackedFiles:unPackedFiles},
                                        flags : flags
                                    }
                                );
                                
                                return false;
                            }
                        });
                        extract.on("finish",() => {
                            flags.done = true;
                            flags.success = true;
                            flags.failure = false;
                            process.send(
                                <AtomicOperationForkEvent>{
                                    update : true,
                                    flags : flags,
                                }
                            );
                            process.exit(0);
                        });
                        let unPackStream = fs.createReadStream("phat.update").pipe(gunzip()).pipe(extract);
                    });
                    fs.createReadStream("phat.update").pipe(gunzip()).pipe(countFiles);
                });
            });
        }
    }
);
process.on("uncaughtException",function(err : string){
    console.log("ERROR "+err);
    flags.done = true;
    flags.failure = true;
    flags.success = false;
    process.send(
        <AtomicOperationForkEvent>{
            update : true,
            flags : flags,
            data : err
        }
    );
    process.exit(1);
});
process.on("unhandledRejection",function(err : string){
    console.log("ERROR "+err);
    flags.done = true;
    flags.failure = true;
    flags.success = false;
    process.send(
        <AtomicOperationForkEvent>{
            update : true,
            flags : flags,
            data : err
        }
    );
    process.exit(1);
});