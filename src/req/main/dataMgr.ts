let data : any = {};
let dataPath : string = "";

export function loadData(path : string) : boolean
{
    const jsonFile = require("jsonfile");
    try
    {
        dataPath = path;
        data = jsonFile.readFileSync(path);
        return true;
    }
    catch(err)
    {
        return false;
    }
}

export function saveData() : void
{
    const jsonFile = require("jsonfile");
    
    console.log("Called save"+dataPath);
    try
    {
        try
        {
            data["application"]["operations"] = {};
        }
        catch(err)
        {
            console.log(err);
        }
	    jsonFile.writeFileSync(dataPath,data,{spaces : 4});
    }
    catch(err)
    {
        
    }
}

export function getChannel(channel : string) : any | undefined
{
    try
    {
        return data[channel];
    }
    catch(err)
    {
        return undefined;
    }
}
export function createChannel(channel : string) : boolean
{
    try
    {
        data[channel] = {};
        return true;
    }
    catch(err)
    {
        console.log("Could not get"+channel);
        return false;
    }
}
export function getKey(channel : string,key : string) : any | undefined
{
    try
    {
        return data[channel][key];
    }
    catch(err)
    {
        return undefined;
    }
}
export function createKey(channel : string,key : string) : boolean
{
    try
    {
        if(!getChannel(channel))
        {
            createChannel(channel);
        }
        data[channel][key] = {};
        return true;
    }
    catch(err)
    {
        console.log(err);
        return false;
    }
}
export function setKey(channel : string,key : string,val : any) : boolean
{
    //console.log(stringifyData(undefined,4));
    try
    {
        if(!getChannel(channel))
            createChannel(channel);
        if(!getKey(channel,key))
            createKey(channel,key);
        data[channel][key] = val;
        //saveData();

        return true;
    }
    catch(err)
    {
        console.log(err);
        return false;
    }
}

export function clearData() : void
{
    data = {};
}

export function stringifyData(
    replacer?: (key: string, value: any) => any,
    space?: string | number
) : string
{
    return JSON.stringify(data,replacer,space);
}

export interface KeySubObj
{
	channel : string;
	key : string;
	replyChannel : string
}
export let keySubs = new Array<KeySubObj>();

export function addSubscriberToKey(sub : KeySubObj) : void
{
    for(let i : number = 0; i != keySubs.length; ++i)
    {
        if(keySubs[i].replyChannel == sub.replyChannel &&
        keySubs[i].channel == sub.channel &&
        keySubs[i].key == sub.key)
            return;
    }
	keySubs.push(
		{
			channel : sub.channel,
			key : sub.key,
			replyChannel : sub.replyChannel
		}
	);
}
export function removeSubscriberFromKey(sub : KeySubObj)
{
	for(let i : number = keySubs.length - 1; i >= 0; --i)
	{
		if(keySubs[i].channel == sub.channel &&
		   keySubs[i].key == sub.key &&
		   keySubs[i].replyChannel == sub.replyChannel)
		{
			keySubs.splice(i,1);
		}
	}
}

