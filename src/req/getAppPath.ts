/// <reference types="electron" />

//import * as electron from "electron";
let app : Electron.App = null;

import {getEdition,setEditionSource} from "./getEdition";
let readableBasePath = ""
let writableBasePath = "";
let readableAndWritableBasePath = "";
export function isRenderer() : boolean
{
    return (process && process.type == "renderer");
}

function getElectronApp() : boolean
{
    let electron = undefined;
    try
    {
        electron = require("electron");
        if(app)
            return true;
        //electron.app is undefined in renderer
        if(isRenderer())
        {
            app = electron.remote.app;
            return true;
        }
        else
        {
            app = electron.app;
            return true;
        }
    }
    //require("electron") throws module not found in Node
    catch(err)
    {
        return false;
    }
    
}

export function setReadableBasePath(path : string)
{
    readableBasePath = path;
} 
export function setWritableBasePath(path : string)
{
    writableBasePath = path;
}
export function setReadableAndWritableBasePath(path : string)
{
    readableAndWritableBasePath = path;
}

export function getReadable(relativePath : string) : string
{
    if(!readableBasePath)
    {
        if(!getElectronApp())
            throw new Error("No readable base path set");
        else
            setReadableBasePath(app.getAppPath());
    }
    return readableBasePath+"/"+relativePath;
}

export function getWritable(relativePath : string) : string
{
    if(!writableBasePath)
    {
        if(!getElectronApp())
            throw new Error("No readable base path set");
        else
            setWritableBasePath(app.getPath("userData"));
    }
    return writableBasePath+"/"+relativePath;
    /*
    getElectronApp();
    if(getEdition() == "portable")
        return getReadable(relativePath);
    return app.getPath("userData")+"/"+relativePath;*/
}

export function getReadableAndWritable(relativePath : string) : string
{
    if(!readableAndWritableBasePath)
    {
        if(!getElectronApp())
            throw new Error("No readable/writable base path set");
        else
            setReadableAndWritableBasePath(app.getPath("userData"));
    }
    return readableAndWritableBasePath+"/"+relativePath;
    /*
    getElectronApp();
    return getWritable(relativePath);*/
}
/*
setEditionSource(getReadable("edition"));
*/