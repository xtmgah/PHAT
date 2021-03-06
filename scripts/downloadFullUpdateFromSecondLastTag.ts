import * as fs from "fs";

const GitHubAPI = require("github-api");
const GitHubReleases = require("github-releases");

let isRightOS : RegExp;
if(process.platform == "linux")
    isRightOS = new RegExp("(linux)","i");
else if(process.platform == "win32")
    isRightOS = new RegExp("(win32)","i");

let isRightArch : RegExp = new RegExp("(x64)","i");

let isUpdateFull : RegExp = new RegExp("(update-full)","i");

let args = process.argv.slice(2);

let user = args[0];
let repo = args[1];
let branch = args[2];

function getSecondLastTag(user : string,repo : string,branch : string) : Promise<string>
{
    //copied almost verbatim from https://github.com/chgibb/PHATDocs/blob/master/scripts/getLastTag.js
    return new Promise<string>((resolve,reject) => {
        const ghapi = new GitHubAPI();
        let tag;
        //find last release for either beta/stable
        ghapi.getRepo(user,repo).listReleases().then((tagsRes : {data : Array<any>}) => {
            if(branch == "beta")
            {
                for(let i = 1; i != tagsRes.data.length; ++i)
                {
                    if(/beta/.test(tagsRes.data[i].tag_name))
                    {
                        resolve(tagsRes.data[i].tag_name);
                    }
                }
            }
            else if(branch != "beta")
            {
                for(let i = 1; i != tagsRes.data.length; ++i)
                {
                    if(!/beta/.test(tagsRes.data[i].tag_name))
                    {
                        resolve(tagsRes.data[i].tag_name);
                    }
                }
            }
            reject();
        });
    });
}

function downloadFullUpdateFromTag(user : string,repo : string,tag : string) : Promise<void>
{
    return new Promise<void>(async (resolve,reject) => {
        let asset : any = await new Promise<any>(async (resolve,reject) => {
            let ghapi = new GitHubAPI();
            ghapi.getRepo(user,repo).listReleases().then((tagsRes : {data : Array<any>}) => {
                for(let i = 0; i != tagsRes.data.length; ++i)
                {
                    if(tagsRes.data[i].tag_name == tag)
                    {
                        for(let k = 0; k != tagsRes.data[i].assets.length; ++k)
                        {
                            if(
                                isUpdateFull.test(tagsRes.data[i].assets[k].name) &&
                                isRightOS.test(tagsRes.data[i].assets[k].name) &&
                                isRightArch.test(tagsRes.data[i].assets[k].name)
                            )
                            {
                                console.log(tagsRes.data[i].assets[k]);
                                return resolve(tagsRes.data[i].assets[k]);
                            }
                        }
                    }
                }
                return reject(`Failed to find full update package for ${process.platform} ${tag} `);
            });
        });
        let ghr : any;
        if(process.env.APPVEYOR)
        {
            console.log("detected Appveyor");
            if(!process.env.GH_TOKEN_APPVEYOR)
            {
                console.log("Environment variable GH_TOKEN_APPVEYOR must be set to valid Github token to download releases");
                reject();
            }
            ghr = new GitHubReleases({user : user,repo : repo,token : process.env.GH_TOKEN_APPVEYOR});
        }
        else
        ghr = new GitHubReleases({user : user,repo : repo});
        const ostream = fs.createWriteStream("phat-update-full.tar.gz");
        ghr.downloadAsset(asset,async (error : string,istream : fs.ReadStream) => {
            if(error)
                return reject(error);
            istream.pipe(ostream);
            istream.on("error",(error : string) => {throw new Error(error);});
            ostream.on("error",(error : string) => {throw new Error(error);});
        });
    });
}

(async function(){
    let tag = await getSecondLastTag(user,repo,branch);
    console.log(`Downloading full update package for ${tag}`);
    await downloadFullUpdateFromTag(user,repo,tag);
})();