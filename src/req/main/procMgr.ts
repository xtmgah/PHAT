import * as winMgr from "./winMgr";
import {getReadable} from "./../getAppPath";

winMgr.windowCreators["procMgr"] = 
{
    Create : function()
    {
        winMgr.pushWindow(
            "procMgr",
            winMgr.createWithDefault(
                "Process Manager",
                "procMgr",
                543,331,
                "file://"+getReadable("procMgr.html"),
                false,false,
                0,0
            )
        );
    }
}