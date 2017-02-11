/**
 * Shared window management objects and methods.
 * @module req/main/window
 */
const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;

var getState = require('./getState');
var postState = require('./postState');



module.exports.windows = new Array;
module.exports.windowCreators = {};

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
module.exports.createWithDefault = function(title,refName,width,height,html,debug,alwaysOnTop, minWidth, minHeight)
{
		var windowOptions = {};
		
		windowOptions = getState.getState(refName,"windowOptions");
		if(!windowOptions)
		{
			if(!state[refName])
				state[refName] = {};
			windowOptions = 
			{
				x : 736,
				y : 39,
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
			
			postState.postState(refName,"windowOptions",windowOptions);
		}
		
		
		var ref = new BrowserWindow(windowOptions);
		//let image = require('electron').nativeImage.createFromPath('./../64x64.png');
		//if(image.isEmpty())
			//throw "Could Not Load Application Icon\n";
		//ref.setIcon(image);

		ref.loadURL(html);
		if(debug)
			ref.webContents.openDevTools();
	
		ref.on
		(
			'close',function()
			{
				module.exports.saveBounds(ref,refName);
			}
		);
		ref.on
		(
			'move',function()
			{
				module.exports.saveBounds(ref,refName);
			}
		);
		ref.on
		(
			'resize',function()
			{
				module.exports.saveBounds(ref,refName);
			}
		);
		return ref;
}

/**
 * On any change to a windows dimensions or position, save the changes.
 * @param {Electron.BrowserWindow} ref - Reference to the window object whose bounds are to be saved
 * @param {string} refName - State channel to save onto
 */
module.exports.saveBounds = function(ref,refName)
{
	var bounds = ref.getBounds();
	//Get old saved values.
	var windowOptions = getState.getState(refName,"windowOptions");
	if(!windowOptions)
	{
		return;
	}
	//Determine simple diff
	var change = false;
	if(windowOptions.x != bounds.x)
	{
		windowOptions.x = bounds.x;
		change = true;
	}
	if(windowOptions.y != bounds.y)
	{
		windowOptions.y = bounds.y;
		change = true;
	}
	if(windowOptions.width != bounds.width)
	{
		windowOptions.width = bounds.width;
		change = true;
	}
	if(windowOptions.height != bounds.height)
	{
		windowOptions.height = bounds.height;
		change = true;
	}
	//Save changes if any.
	if(change)
		postState.postState(refName,"windowOptions",windowOptions);
}
