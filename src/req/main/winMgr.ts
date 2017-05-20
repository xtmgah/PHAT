/**
 * Shared window management objects and methods.
 * @module req/main/window
 */
const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;

import * as dataMgr from "./dataMgr";
import {GetKeyEvent,KeyChangeEvent} from "./../ipcEvents";


export class WindowRef
{
	public name : string;
	public window : Electron.BrowserWindow;
	public constructor(name : string, window : Electron.BrowserWindow)
	{
		this.name = name;
		this.window = window;
	}
}
export interface WindowCreator
{	
	Create : () => void;
}
let windows = new Array<WindowRef>();
export let windowCreators : {
	[index : string] : WindowCreator;
} = {};

export function pushWindow(refName : string,ref : Electron.BrowserWindow) : void
{
	windows.push(new WindowRef(refName,ref));
}

export function closeAllExcept(refName : string) : void
{
	for(let i : number = 0; i != windows.length; ++i)
	{
		if(windows[i].name != refName)
			windows[i].window.close();
	}
}

export function getWindowsByName(refName : string) : Array<Electron.BrowserWindow>
{
	let res : Array<Electron.BrowserWindow> = new Array<Electron.BrowserWindow>();
	for(let i : number = windows.length - 1; i >= 0; --i)
	{
		try
		{
			windows[i].window.isResizable();
		}
		catch(err)
		{
			windows.splice(i,1);
		}
	}
	for(let i = 0; i != windows.length; ++i)
	{
		if(windows[i].name == refName)
		{
			res.push(windows[i].window);
		}
	}
	return res;
}
export function pushKeyTo(
    channel : string,
    key : string,
    refName : string,
    sender : Electron.WebContents) : void
{
    if(dataMgr.getChannel(channel))
    {
        sender.send(
            refName,
            <GetKeyEvent>{
                replyChannel : refName,
                channel : channel,
                key : key,
                val : dataMgr.getKey(channel,key),
                action : "getKey"
            }
        );
    }
}

export function publishChangeForKey(channel : string,key : string) : void
{
    for(let i : number = 0; i != dataMgr.keySubs.length; ++i)
    {
        if(dataMgr.keySubs[i].channel == channel)
        {
            let windows = getWindowsByName(dataMgr.keySubs[i].replyChannel);
            for(let k : number = 0; k != windows.length; ++k)
            {
                windows[k].webContents.send(
                    dataMgr.keySubs[i].replyChannel,
                    <KeyChangeEvent>{
                        action : "keyChange",
                        channel : channel,
                        key : key,
                        val : dataMgr.getKey(channel,key)
                    }
                );
            }
        }
    }
}

/**
 * Creates a new renderer window with default events attached.
 * Also initializes a state channel with refName if it does not already exist.
 * If a state channel already exists with refName, then the new window will be initalized
 * with the saved windowOptions on that channel.
 * If a state channel does not already exist then the window's width, height,title and alwaysOnTop
 * attributes will be taken from the function's paramaters.
 * @param {string} title - Text to display on window border
 * @param {string} refName - State channel for this window to save it's bounds and position to / load from
 * @param {number} width - Width to initialize window with
 * @param {number} height - Height to initialize window with
 * @param {string} html - Path to HTML file to load into window
 * @param {boolean} debug - Turn on dev tools on window open
 * @param {boolean} alwaysOnTop - Window will always be ontop of all other windows
 * @param {number} minWidth - Minimum width for window
 * @param {number} minHeight - Minimum height for window
 * @returns {Electron.BrowserWindow} - Reference to created window object
 */
export function createWithDefault(
	title : string,
	refName : string,
	width : number,
	height : number,
	html : string,
	debug? : boolean,
	alwaysOnTop? : boolean,
	minWidth? : number,
	minHeight? : number
) : Electron.BrowserWindow
{
		
		let windowOptions = dataMgr.getKey(refName,"windowOptions");
		if(!windowOptions)
		{
			let display = electron.screen.getPrimaryDisplay();
			if(refName == "toolBar")
			{
				width = display.workArea.width/4;
				height = display.workArea.height/8;
			}
			let x = (display.workArea.width/2)-(width/2);
			let y = 0;
			windowOptions = 
			{
				x : x,
				y : y,
				width : width,
				height : height,
				useContentSize : false,
				center : true,
				minWidth: minWidth,
				minHeight: minHeight,
				resizable : true,
				movable : true,
				minimizable : true,
				maximizable : true,
				closable : true,
				alwaysOnTop : alwaysOnTop,
				fullscreen : false,
				title : title,
				icon : './../icon.png'
			};
			
			dataMgr.setKey(refName,"windowOptions",windowOptions);
		}
		
		
		let ref = new BrowserWindow(windowOptions);

		ref.loadURL(html);
		if(debug)
			ref.webContents.openDevTools();
	
		ref.on
		(
			'close',function()
			{
				saveBounds(ref,refName);
			}
		);
		ref.on
		(
			'move',function()
			{
				saveBounds(ref,refName);
			}
		);
		ref.on
		(
			'resize',function()
			{
				saveBounds(ref,refName);
			}
		);
		return ref;
}

/**
 * On any change to a windows dimensions or position, save the changes.
 * @param {Electron.BrowserWindow} ref - Reference to the window object whose bounds are to be saved
 * @param {string} refName - State channel to save onto
 */
export function saveBounds(ref : Electron.BrowserWindow,refName : string) : void
{
	let x : number;
	let y : number;
	let width : number;
	let height : number;
	let pos = ref.getPosition();
	let dimensions = ref.getSize();
	x = pos[0];
	y = pos[1];
	width = dimensions[0];
	height = dimensions[1];
	//Get old saved values.
	//let windowOptions = getState.getState(refName,"windowOptions");
	let windowOptions = dataMgr.getKey(refName,"windowOptions");
	if(!windowOptions)
	{
		return;
	}
	//Determine simple diff
	let change = false;
	if(windowOptions.x != x)
	{
		windowOptions.x = x;
		change = true;
	}
	if(windowOptions.y != y)
	{
		windowOptions.y = y;
		change = true;
	}
	if(windowOptions.width != width)
	{
		windowOptions.width = width;
		change = true;
	}
	if(windowOptions.height != height)
	{
		windowOptions.height = height;
		change = true;
	}
	if(change)
		dataMgr.setKey(refName,"windowOptions",windowOptions);
}
