import * as winMgr from "./../../../req/main/winMgr";

/**
 * Opens an input window
 * 
 * @export
 * @returns {Promise<void>} 
 */
export async function openInputWindow() : Promise<void>
{
    return new Promise<void>((resolve,reject) => {
        setTimeout(function(){
            console.log("opening input window");
            setTimeout(function(){
                let toolBar = winMgr.getWindowsByName("toolBar");
                toolBar[0].webContents.executeJavaScript(`
                    document.getElementById("input").click();
                `);
                resolve();
            },500);
        },500);
    });
}