/**
 * @module req/renderer/formatByteString
 */
/**
 * Takes a number representing some number of bytes, returns a formatted string with the correct measurement
 * @function formatByteString
 * @param {number} bytes - Number of bytes 
 * @returns {string} - Formatted byte string
 */
//Adapted from https://jsfiddle.net/oy02axhh/
export default function formatByteString(bytes : number) : string
{
    let kb = 1000;
    let ndx = Math.floor(Math.log(bytes) / Math.log(kb));
    let fileSizeTypes = ["bytes", "kb", "mb", "gb", "tb", "pb", "eb", "zb", "yb"];

    let res = "";
    //more than a megabyte
    if(bytes >= 1000000)
        res += +(bytes/kb/kb).toFixed(2)+fileSizeTypes[ndx];
    else
        res += +(bytes/kb).toFixed(2)+fileSizeTypes[ndx];
    return res;
}
