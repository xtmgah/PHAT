import * as electron from "electron";
const app = electron.app;
import * as winMgr from "./winMgr";
import * as dataMgr from "./dataMgr";
import {getReadable} from "./../getAppPath";

winMgr.windowCreators["projectSelection"] = 
{
	Create : function() 
	{
		winMgr.initWindowOptions(
			"ProjectSelection",
			"projectSelection",
			400,800,
			false, 10, 10
		);
		
		winMgr.pushWindow(
			"projectSelection",
			winMgr.createFromOptions(
				"projectSelection",
				"file://"+getReadable("ProjectSelection.html"),
				false
			)
		);
		
		//If the toolbar is not open then the user has closed PHAT without opening a project.
		//Make sure we don't hang around in the background.
		let projectSelectWindow : Array<Electron.BrowserWindow> = winMgr.getWindowsByName("projectSelection");
		if(projectSelectWindow.length > 0)
		{
			projectSelectWindow[0].on(
				"closed",function()
				{
					let toolBarWindow : Array<Electron.BrowserWindow> = winMgr.getWindowsByName("toolBar");
					if(toolBarWindow.length == 0)
					{
						//Let the download -> install handoff handle app quitting and data saving
						if(!dataMgr.getKey("application","downloadedUpdate"))
						{
							dataMgr.saveData();
							app.quit();
						}
					}
				}
			);
		}
	}
};