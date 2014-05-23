/*
	PICKS(_SUST) 1.2 based on PEU code.
*/


//define sizes
var h = 700;
var legendWidth = 300;
var w = h + 2*legendWidth;

var radium = 10;
var gravity = 0.8;
var charge = -300;


//filename
var filename = "GCSC data Final links.txt";
//master category
//var masterCat = "Researcher";
var masterCat = "Name";
//child categories
var children = ["Department", "Critique of knowledge production",	"Managing Metabolic processes",	"Empowerment and inequality","Imagining the future","Understanding the past","Biodiversity","Air","Built Environment","Energy",	"Representations","Transport","Waste","Water","Food",	"Abiotic resources",	"Environment / climate",	"Human Wellbeing (IRIS)",	"Materials (IRIS)",	"Global Health (IRIS)",	"Intercultural Interaction (IRIS)",	"Energy, Envir. & Transport (IRIS)",	"Public Policy & Governance (IRIS)",	"Sustainable Cities (IRIS)",	"Risk & Security (IRIS)",	"Systems Engineering (IRIS)"];
//url location
var urlCol = "URL";
//basic description
var string1 = "PICKS-SUST by Martin Zaltz Austwick and Charlotte Johnson 2013-2014";


var sizeVar = "Sum";
var nodeNames, currentDropDown, droplist, droplistBox, dldiv, dropSVG;

var selectAllButton;
var allSelected;


//fill opacities
var fillOpacity = 0.7;
var selectedOpacity = 0.9;
//stroke opacities
var inOpacity = 1;
var outOpacity = 0.5;


var selectedEntity = -1;
var dark = "#000022";
var light = "#fefdfd";

//define svg
//var mainDiv = d3.select("body").append("div").attr("width",w).attr("height",h).style("overflow-y", "scroll");
//mainDiv.attr("class", "mainDiv");

var svg = d3.select("body")	//select body
			//mainDiv
		  .append("svg")	//add svg
		  .attr("width",w)
		  .attr("height", h)
		  .style("overflow", "scroll");

var text1 = svg.append("text").text(string1).attr("x", 0).attr("y", h-5);

var node;
var edges;
var force;
var key;
var colors;



var dataset = {
	nodes: 
	[

	],

	edges:
	[
		
	]
	};

//createNet(200, 0.5);


var keys = new Array();

var dataIn;

d3.select("body").attr("black", 0).style("background-color", light);


 d3.tsv(filename, function(d)
 	{
 		dataIn = d;
		//droplist = svg.selectAll(".dropDowns");	



 		setKeys();
 		
 		setTypedNodes();
		setOnce();
 		//repeated setup
		setUpStuff();
 	});

 function setUpStuff()
 {
 	/*
 		Once the data is written in and the keys initialised:
 		create nodes and edges
 		create forces and responses
 	*/

 	setNodes();
 	
	//addPipedNodes();
 	setSize(sizeVar);	
 	//console.log(node);
 	doDrawing();
 	showKeys();
 	showDropDowns();

 }

function setNodes()
{
	dataset.nodes = new Array();
	dataset.edges = new Array();

	for(var i = 0; i<dataIn.length; i++)
	{
		dataset.nodes.push({id:(dataIn[i])[masterCat], type: masterCat, typeNum: 0, selected: true, dselected:false, url: (dataIn[i])[urlCol]});
		//get current index!
		var start = dataset.nodes.length-1;
		for(var c = 0; c<children.length; c++)
 		{
 			if(dataIn[i][children[c]])
			{
				

	 			/*
	 				check whether the relevant key is selected
	 			*/
	 			var isOn = false;
	 			for(var k = 0; k<keys.length; k++)
	 			{
	 				//console.log(keys[k]);
	 				if(keys[k].id==children[c] && keys[k].selected)
	 				{
	 					isOn = true;
	 				}
	 			}

	 			if(isOn)
	 			{

	 				/*
					
						Check whether table entry has a pipe character and iterate

	 				*/

	 				var entries = dataIn[i][children[c]].split("|");
	 				//console.log(entries.length);
	 				for(var p = 0; p<entries.length; p++)
	 				{
	 					//console.log(entries[p]);
	 					var entry = entries[p];

	 					/*
	 						Check whether this individual entry is checked
	 					*/

	 					var includeEntry = true;
	 					//check whether this array exists; for binary categories, it will not.
	 					//allSelected[children[c]] = true;
	 					if(nodeNames[children[c]])
	 					{
	 						//find position of this entry in the nodeNames label array
	 						var labelPos = returnLocation(nodeNames[children[c]], "id", entry);
	 						if(labelPos>-1)
	 						{
	 							includeEntry = nodeNames[children[c]][labelPos].selected;
	 						}
	 					}

	 					if(includeEntry)
	 					{
			 					/*
									Returns the index where a node appears in the dataset from the CHECKID... method
									If a node of that name and type does not appear, returns -1
								*/
					 			var end = checkIDdoesntExist(entry, children[c]);
				 				/*
				 					Do we need to create a new node to link to?
				 				*/
					 			if(end<0)
								{
									dataset.nodes.push({id:entry, type: children[c], typeNum: c+1, selected:false, dselected: false});
									end = dataset.nodes.length-1;
								}
								//link to the relevant node
								dataset.edges.push({source:start, target: end, onoff:1, type: children[c], typeNum:c+1});
						}

					}
				}
			}
 		}
	}

	console.log(dataset.nodes);
}

function setOnce()
{

	droplistBox = svg.append("foreignObject")
					// .style("overflow-y", "scroll")
					// .attr('width', '100%')
	  		 		//.attr('height', '100%')
					//.attr("y", 0)
					.attr("x", legendWidth)
					.style("visibility", "hidden");

		dldiv = droplistBox.append("xhtml:div")
					.attr("id", "dropDownBox")
					// .append("svg:svg")
					.style("background-color", light)
					
					;

		dropSVG = dldiv.append("svg").attr("height", h).attr("width", w);

		

		selectAllButton = dropSVG.selectAll(".selectAllButton").data([{selected:true}]);
		selectAllButton.enter().append("g").attr("x", 0).attr("y", 0);
		selectAllButton.append("rect").attr("width", radium).attr("height", radium).attr("x",5).attr("y", radium).style("fill",0).style("stroke",0);
		selectAllButton.append("text").text("(De)select all in category").attr("y", radium + 10).attr("x", 2*radium + 5);

		
		selectAllButton.on("click", function(d){
			d.selected = !d.selected;
			//console.log(d);
			if(d.selected) d3.select(this).select("rect").attr("fill-opacity", selectedOpacity);
			else d3.select(this).select("rect").attr("fill-opacity", 0);

			droplist.each(function(e){
				e.selected = d.selected;
				if(d.selected) d3.select(this).select("rect").attr("fill-opacity", 1);
				else d3.select(this).select("rect").attr("fill-opacity", 0);
			});

			allSelected[currentDropDown] = d.selected;
			var keyLoc = returnLocation(keys,"id",currentDropDown);
			//only recalculate dataset if this node is selected
			if(keys[keyLoc].selected) setUpStuff();

		});
}

function setTypedNodes()
{
	/*
		This is essentially a duplicate of the dataset
		Organised hierarchically by type.

		We use the selected state of an individual node to (re)populate the dataset object
	*/
	nodeNames = new Array();
	nodeNames[masterCat]=[];

	allSelected = new Array();
	allSelected[masterCat] = {selected:true};

	currentDropDown = new Array();	

	for(var i = 0; i<dataIn.length; i++)
	{

		if(nodeNames[masterCat]==null) nodeNames.masterCat = [{id: dataIn[i][masterCat], y:(2*i + 1)*radium, selected:true}];
		else nodeNames[masterCat].push({id: dataIn[i][masterCat], y:(2*i+ 1)*radium, selected:true});
 	}

 	/*
 		Associative array keyed on category
 	*/


	for(var c = 0; c<children.length; c++)
 	{
 		nodeNames[children[c]]==[];
		var ypos = 1;
		for(var i = 0; i<dataIn.length; i++)
		{
			
			if(dataIn[i][children[c]])
			{
					//console.log("dataIn " +  dataIn[i][children[c]]);
					var entries = dataIn[i][children[c]].split("|");

			 		/*
			 			Iterate over pipe-separated values
			 		*/
					for(var p = 0; p<entries.length; p++)
					{ 
							//console.log(entries[p]);
							var alreadyExists = false;
							if(nodeNames[children[c]]){
								if(returnLocation(nodeNames[children[c]],"id",entries[p])>-1) 
								{
									alreadyExists = true;
								}	
							}
							
							if(entries[p].length>1 && !alreadyExists)
							{

								
								if(nodeNames[children[c]]==null)  nodeNames[children[c]] = [{id: entries[p], y:ypos*radium, selected:true}];
								else nodeNames[children[c]].push({id: entries[p], y:ypos*radium, selected:true});
								ypos += 2;
							}

							 // if(children[c] == "Applicant_dept" && alreadyExists)
							 // 	{
								// 	console.log(entries[p]);
							 // 		console.log(ypos);
							 // 	}
								

					}
			}
	 	}
 	}
}

function setSize(colName)
{
	var maxAmount  = 0;
	for(var i = 0; i<dataset.nodes.length; i++)
	{
		dataset.nodes[i].size = radium;
		for(var j = 0; j<dataIn.length; j++)
		{
			//id != index, remember
			if(dataset.nodes[i].id==(dataIn[j])[masterCat])
			{
				dataset.nodes[i][colName] = (dataIn[j])[colName];
				if((dataIn[j])[colName]>maxAmount) maxAmount =  (dataIn[j])[colName];
			} 
		}
	}
	//console.log(maxAmount);
	i =0;
	j = 0;
	var radii = d3.scale.sqrt().domain([0, maxAmount]).range([0, 2*radium]);

					for(var i = 0; i<dataset.nodes.length; i++)
				{

					for(var j = 0; j<dataIn.length; j++)
					{

							if(dataset.nodes[i].id==(dataIn[j])[masterCat])
							{

								//dataset.nodes[i].size = radium*dataset.nodes[i][colName]/maxAmount;
								dataset.nodes[i].size = radii(dataset.nodes[i][colName]);
								//console.log(dataset.nodes[i].size);
							} 
					}
				}
		
	


}



function setKeys()
{
	colors = d3.scale.category20();
	keys.push({id:masterCat, on:true, y:radium, typeNum:0, selected:true});
	for(var c = 0; c<children.length; c++)
	{
		/*
			Set separation of keys: 2*radium
		*/
		keys.push({id:children[c],on:true, y:(2*c+3)*radium, typeNum: c+1, selected:false});
	}
}



function showKeys()
{
	var key = svg.selectAll(".key").data(keys).enter().append("g");

			key.append("circle")
			.attr("r", radium)
			.attr("cx", radium+5)
			.attr("cy", function(d){return d.y +5})
			.attr("fill-opacity", function(d){
				if(d.selected) return selectedOpacity;
				else return 0;
			})
			.attr("fill", function(d){
				return colors(d.typeNum);
			})
			.attr("stroke", function(d){
				return colors(d.typeNum);
			})
			.attr("stroke-opacity", outOpacity)
			.attr("stroke-width", 3);

			key.append("text").
			text(function(n){return n.id})
			.attr("opacity",1)
			.style("pointer-events", "none")
			.attr("x", 2.5*radium + 5)
			.attr("y", function(d){return (d.y)+10});

		

			key.on("mouseover", function(){
				d3.select(this).select("circle").attr("stroke-opacity", inOpacity);
			})
			.on("mouseout", function(d){
				d3.select(this).select("circle").attr("stroke-opacity", outOpacity);
			})
			.on("click", function(d){
				d.selected = !d.selected;
				if(d.selected) d3.select(this).select("circle").attr("fill-opacity", selectedOpacity);
				else d3.select(this).select("circle").attr("fill-opacity", 0);
				setUpStuff();

			});


}


function checkIDdoesntExist(ID, newtype)
{
		var IDdoesntExist = -1;
		for(var i = 0; i<dataset.nodes.length;i++)
		{
			//console.log(newtype);
			if(ID==dataset.nodes[i].id && newtype==dataset.nodes[i].type)
			{
				IDdoesntExist = i;
				break; 
			}
		}
		return IDdoesntExist;
}

function returnLocation(thearray, thefield, theID)
{
	var location = -1;
	for(var i = 0; i<thearray.length; i++)
	{
		if(thefield=="Applicant_surname")
		{
			// console.log(thearray[i][thefield]);
			// console.log(theID);
		}
		if(theID==thearray[i][thefield])
		{
			// console.log(thearray[i][thefield]);
			// console.log(theID);
			location = i;
		}
	}
	//console.log(location);
	return location;
}


function populateDropdowns()
{
	/*
		filling in dropdowns when they're selected
	*/
	
	var droplistin = new Array();

	

	if(currentDropDown!="")
	{ 
		/*
			nodeNames captures the names of each node, organised hierarchically by class
		*/
		droplistin = nodeNames[currentDropDown];
		droplistBox.style("visibility", "visible");
		//selectAllButton.attr("selected", allSelected[currentDropDown]);
	}
	else
	{	
		console.log("no selection");
		droplistBox.style("visibility", "hidden");
		
	}

	


	//.log(droplistin);
	
			/*
				Update data by matching id!!!!!!!!!!!!!
			*/
	

	droplist = dropSVG.selectAll(".dropDowns").data(droplistin, function(d){return d.id;});
	droplist.enter().append("g").attr("class", "dropDowns");
	droplist.exit().remove();
	//console.log(droplistin);
	dropSVG.attr("height", 50 + droplistin.length*2*radium);
	
	droplist.append("rect").attr("width", radium).attr("height", radium)
				.attr("x", 5)
				.attr("y", function(d){return d.y + 2*radium;})
				.attr("fill-opacity", function(d){
					if(d.selected) return 1;
					else return 0;
				})
				.style("stroke", 0)
				;

	droplist.append("text").text(function(d){return d.id})
				//.attr("x", legendWidth + 2*radium + 5)
				.attr("x",  2*radium + 5)
				.attr("y", function(d){return d.y+10+2*radium;});

	droplist.on("click", function(d){
		d.selected = !d.selected;
		if(d.selected) d3.select(this).select("rect").attr("fill-opacity", 1);
		else d3.select(this).select("rect").attr("fill-opacity", 0);
		//console.log(d)

		//toggleLinkType(d.typeNum, dataset);
		var keyLoc = returnLocation(keys,"id",currentDropDown);
		//only recalculate dataset if this node is selected
		if(keys[keyLoc].selected) setUpStuff();


	

	});




	
}

function showDropDowns()
{
	/*
				dropdown boxes for creation
			*/

			var dropDownCreators = svg.selectAll(".dropDownCreator").data(keys).enter().append("g");

			dropDownCreators.append("rect").attr("x", legendWidth - radium -5).attr("y", function(d){return d.y;})
				.attr("width", radium).attr("height", radium)
				.attr("fill", function(d){
				return colors(d.typeNum);
				})
				.attr("stroke", function(d){
				return colors(d.typeNum);
				})
				.attr("fill-opacity", function(d){
					if(d.dselected) return selectedOpacity;
					else return 0;
				});
			
			dropDownCreators.on("mouseover", function(){
				d3.select(this).select("rect").attr("stroke-opacity", inOpacity);
			})
			.on("mouseout", function(){
				d3.select(this).select("rect").attr("stroke-opacity", outOpacity);
			})
			.on("click", function(d){

				var toSelect= !d.dselected;

				dropDownCreators.selectAll("rect").attr("fill-opacity", 0);
				dropDownCreators.forEach(function(d){d.dselected=false;});

				d.dselected = toSelect;

				if(d.dselected) d3.select(this).select("rect").attr("fill-opacity", selectedOpacity);
				else{
					d3.select(this).select("rect").attr("fill-opacity", 0);
				} 
				
				if(d.dselected) currentDropDown = d.id;
				else currentDropDown = "";	

				 populateDropdowns();		

			});
}



function doDrawing()
{
		
		//initialise force graph; set parameters
		//assign links object to edges, assign nodes data to nodes
		force = d3.layout.force().nodes(dataset.nodes).links(dataset.edges).size([w,h])
					//.linkDistance([50])
					.charge(charge)
					.gravity(gravity)
					.linkStrength(function(d){return d.onoff})
					.friction(0.8)
					//.linkStrength(1)
					.start();

		if(edges!=null) edges.data([]).exit().remove();
		edges = svg.selectAll(".edges").data(dataset.edges).enter()
					.append("line")
					.style("stroke", "#220000").style("stroke-width", 1)
					.attr("opacity", function(d){return 0.5*d.onoff});
					//use onoff as a 0/1 weight

		if(node!=null) node.data([]).exit().remove();
		node = svg.selectAll(".node").data(dataset.nodes)
						.enter()
						.append("g")
						.call(force.drag)
						.attr("nodeid", function(d){return "i" + d.index});

		// Create a box for the dropdown list


		

		node.append("circle")
			.attr("r", function(d){
				if(d.size>0) return d.size;
				else return radium;
			})
			.attr("fill-opacity", fillOpacity)
			.attr("fill", function(d){
				return colors(d.typeNum);
			})
			.attr("stroke-opacity", outOpacity)
			.attr("stroke", function(d){
				return colors(d.typeNum);
			})
			.attr("stroke-width", 3);

			//console.log(node);

		node.append("text")
			.text(function(n){
				//tidy binary labels
				var label = n.type;
				if(n.id.length>1) label = label + ": " + n.id;
				if(n[sizeVar]>0) label = label + "; Value: " + n[sizeVar];
				return label;
			})
			.attr("opacity",0)
			.attr("y", h-30)
			.style("pointer-events", "none");

		node
		.attr("xlink:href", function(d) { return d.url; })
		.on("mouseover", function(){
				d3.select(this).select("circle").attr("stroke-opacity", inOpacity);
				d3.select(this).select("text").attr("opacity", 1);

			})
			.on("mouseout", function(d){
				d3.select(this).select("circle").attr("stroke-opacity", outOpacity);
				d3.select(this).select("text").attr("opacity", 0);
			})
			.on("click", function(d){
				d.selected = !d.selected;
				if(d.selected) 
				{
					d3.select(this).select("circle").attr("fill-opacity", selectedOpacity);
					selectedEntity = d.index;
					//linkBox.attr("opacity",1).select("text").text(d.id);
				}
				else {
					d3.select(this).select("circle").attr("fill-opacity", fillOpacity);
					selectedEntity = -1;
					//linkBox.attr("opacity",0);
				}
			})
			.on("dblclick", function(d){if(typeof d.url === "string")window.open(d.url);})
			;

		//background box for text
		svg.append("rect").attr("x", 0).attr("y", 0).attr("width", legendWidth).attr("height", 2*radium*(0.5+keys.length)).attr("fill", light).attr("opacity", 0.8);

		


			var urlPointer = "http://ucl.ac.uk";
			

			

			//only use for a black/dark background
			d3.selectAll("text").style("fill", dark);	
			edges.style("stroke", dark);



		force.on("tick", function() {

						edges.attr("x1", function(d) { return d.source.x; })
							 .attr("y1", function(d) { return d.source.y; })
							 .attr("x2", function(d) { return d.target.x; })
							 .attr("y2", function(d) { return d.target.y; });
					
						//node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
						node.selectAll("circle").attr("cx", function(d) { return d.x; })
												.attr("cy", function(d) { return d.y; });
						//key.attr("transform", function(d) { return "translate(" + 100 + "," + 50*d.index + ")"; });


					});




}



