var viewMgr = require('./../viewMgr');
var id = require('./../MakeValidID.js');
var buildInclusiveSearchFilter = require('./../buildInclusiveSearchFilter.js');
module.exports = function(arr,div,model)
{
    arr.push
    (
        new class extends viewMgr.View
        {
            constructor()
            {
                super('fastq',div,model);
                this.data.fastqInputs = new Array();
                this.data.searchFilter = new RegExp("","i");
                this.data.filterString = "";
            }
            onMount(){}
            onUnMount(){}
            renderView()
            {
                if(document.getElementById('fastqInputFilterBox'))
                    this.data.filterString = document.getElementById('fastqInputFilterBox').value;
                var html = new Array();
                html.push
                (
                    "<button id = 'removeSelected'>Remove selected</button><br>",
                    "<input id='fastqInputFilterBox' class='inputFilterBox' type='text' autofocus='autofocus' placeholder='Search...' />",
                    "<table id='fastqTable' style='width:100%'>",
                    "<tr>",
                    "<td><input type='checkbox' id='fastqSelectAllBox'></input></td>",
                    "<th>Sample Name</th>",
                    "<th>Directory</th>",
                    "<th>Size</th>",
                    "</tr>"
                );
                this.data.searchFilter = buildInclusiveSearchFilter(this.data.filterString);

                for(let i = 0; i != this.model.fastqInputs.length; ++i)
                {
                    if(this.data.searchFilter.test(this.model.fastqInputs[i].alias))
                    {
		        	    html.push
		        	    (
			        	    "<tr><td><input type='checkbox' id='",this.model.fastqInputs[i].validID,"'></input></td>",
			        	    "<td>",this.model.fastqInputs[i].alias,"</td>",
			        	    "<td>",this.model.fastqInputs[i].name,"</td>",
			        	    "<td>",this.model.fastqInputs[i].sizeString,"</td>",
			        	    "</tr>"
                        );
                    }
	            }
	            html.push("</table>");
                return html.join('');
            }
            postRender()
            {
                //restore text in search box
                if(this.data.filterString)
                    document.getElementById('fastqInputFilterBox').value = this.data.filterString;
                var shouldCheckCheckAllBox = true;
                for(let i = 0; i != this.model.fastqInputs.length; ++i)
                {
                    //restore state of checkboxes
                    if(this.model.fastqInputs[i].checked)
                    {
                        $('#'+this.model.fastqInputs[i].validID).prop("checked",true);
                    }
                    //check the check all box if all visible items have been checked
                    if(this.data.searchFilter.test(this.model.fastqInputs[i].alias))
                    {
                        if(!this.model.fastqInputs[i].checked)
                            shouldCheckCheckAllBox = false;
                    }
                }
                var me = this;
                //reset change handler to inputFilterBox
                $('#fastqInputFilterBox').on
                (
                    'change keydown keyup paste',
                    function()
                    {
                        me.data.filterString = document.getElementById('fastqInputFilterBox').value;
                        me.render();
                    }
                );
                //apply prop to check all box
                $('#fastqSelectAllBox').prop("checked",shouldCheckCheckAllBox);
                //refocus search box if the user is using it
                document.getElementById('fastqInputFilterBox').focus();
            }
            dataChanged()
            {
                //The renderer window will recieve a reply from the main process
                //after input posts the updated data and trigger a rerender with the new data.
                //No need to do so here.
                this.model.postFastqInputs();
            }
            divClickEvents(event)
            {
                //potentially error or user clicked on something we're not interested in 
                if(!event || !event.target || !event.target.id)
                    return;
                //instead of immediately looping to figure out if a checkbox was even clicked,
                //this is a reasonable check to ensure a checkbox was (maybe) clicked
                if(event.target.id != 'fastqSelectAllBox')
                {
                    //if name is defined then a checkbox was actually clicked
                    var name = id.findOriginalInput(event.target.id,this.model.fastqInputs);
                    //checkbox was clicked
                    if(name !== undefined)
                    {
                        if(event.target.checked)
                        {
                            //for(var i in this.model.fastqInputs)
                            for(let i = 0; i != this.model.fastqInputs.length; ++i)
                            {
                                if(this.model.fastqInputs[i].name == name)
                                {
                                    this.model.fastqInputs[i].checked = true;
                                    this.dataChanged();
                                    return;
                                }
                            }
                        }
                        if(!event.target.checked)
                        {
                            //for(var i in this.model.fastqInputs)
                            for(let i = 0; i != this.model.fastqInputs.length; ++i)
                            {
                                if(this.model.fastqInputs[i].name == name)
                                {
                                    this.model.fastqInputs[i].checked = false;
                                    this.dataChanged();
                                    return;
                                }
                            }
                        }
                    }
                    else { //checkbox was not clicked, must be some other element
                        //if the element was the "removeSelected" button, act on it
                        if (event.target.id == "removeSelected")
                        {
                            for (let i = 0; i != this.model.fastqInputs.length; ++i) 
                            {
                                if (this.model.fastqInputs[i].checked)
                                {
                                    this.model.fastqInputs.splice(i, 1);                            
                                }
                            }
                            //and refresh
                            this.dataChanged();
                        }
                    }
                }
                //on user clicking the select all box
                if(event.target.id == 'fastqSelectAllBox')
                {
                    this.data.searchFilter = buildInclusiveSearchFilter(this.data.filterString);
                    for(let i = 0; i != this.model.fastqInputs.length; ++i)
                    {
                        //for anything currently visible
                        if(this.data.searchFilter.test(this.model.fastqInputs[i].alias))
                        {
                            //set the checked state to that of the select all checkbox
                            this.model.fastqInputs[i].checked = event.target.checked;
                        }
                    }
                    //inform the renderer of an update
                    this.dataChanged();    
                }
            }
        }
    );
}
