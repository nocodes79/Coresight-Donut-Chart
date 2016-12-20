(function (CS) {
	'use strict';
	
	var width; //symbol width
	var height; //symbol height
	var svg; //svg container object
	var path; //arcs paths
	
	//derive symbol from CS base
	function symbolVis() { }
	CS.deriveVisualizationFromBase(symbolVis);
	
	//define object initialization
	symbolVis.prototype.init = function(scope, elem) {
		//define events behaviors
		this.onDataUpdate = dataUpdate;
		this.onResize = resize;
		
		scope.scale = 1;

		//get the svg container
		//compute element id
        var svgElem = elem.find('#donutContainer')[0];
        var id = "donut_" + Math.random().toString(36).substr(2, 16);
        svgElem.id = id;
		
		//legend size
		var	legendRectSize = 14;
		var	legendSpacing = 4;
		//caches input data
		var dataCache;
		//defines color scale
		var color = d3.scale.category20();
		//converts values to pie contributions
		var pie = d3.layout.pie()
			.value(function(d) {
				//Avoid proplems with "," regional settings
				var dottedParsedValue = parseFloat(d.value.replace(",", "."));
				if (!isNaN(dottedParsedValue))
				{
					return dottedParsedValue;
				}
				else
				{
					return 0;
				}
			}).sort(null);
		
		//Chart arcs and legend object
		var arc, legend;
		
		//initialize drawing
        function initChart(startWidth, startHeight) {
			//default size
            width = startWidth / 2;
            height = startHeight;
			
			//donut chart rafius
			var radius = Math.min(width, height) / 2;
			
			//arcs inner and outer radius
			arc = d3.svg.arc()
				.innerRadius(radius*0.3)
				.outerRadius(radius*1);
			
			//get the svg object
			svg = d3.select("#" + id)
				.append("svg")
				.attr("width", startWidth)
				.attr("height", height)
				.append("g")
				.attr("transform", "translate(" + radius * 1 + "," + radius * 1 + ")");
			
			//get data
			dataUpdate(dataCache);
        }
        initChart(scope.config.Width, scope.config.Height);
		
		//legend labels
		var labels = [];
		
		//Update data
		function dataUpdate(csData) {
			//store data to cache
			dataCache = csData;
			if (dataCache) {

				// remap the labels from data to labels object
				if (dataCache.Rows[0].Label) {
					labels = dataCache.Rows.map(function (row) { return row.Label; });
				}
				
				var data = [];
				labels.forEach(function (label, index) {
					data.push(
						{
							'label': label,
							'value': dataCache.Rows[index].Value,
							'uom': dataCache.Rows[index].Units
						});
				});
				
				//cleans drawing
				svg.selectAll("path").remove();
				svg.selectAll('.legend').remove();
				
				//draw arcs
				path = svg.selectAll("path")
					.data(pie(data))
					.enter().append("path")
					.attr("fill", function (d, i) { return color(i); })
					.attr("d", arc);
				
				//draw legend
				if (scope.config.showLegend)
				{
					legend = svg.selectAll('.legend')
						.data(pie(data))
						.enter()
						.append('g')
						.attr('class', 'legend')
						.attr('transform', function (d, i) {
							var height = legendRectSize + legendSpacing;
							var offset = height * color.domain().length / 2;
							var horz = width / 2 + 2 * legendSpacing;
							var vert = i * height - offset;
							return 'translate(' + horz + ',' + vert + ')';
					});
					
					legend.append('rect')                                      
					  .attr('width', legendRectSize)
					  .attr('height', legendRectSize)
					  .style('fill', function (d, i) { return color(i); })
					  .style('stroke', function (d, i) { return color(i); });

					legend.append('text')
					  .attr('x', legendRectSize + legendSpacing)
					  .attr('y', legendRectSize - legendSpacing)
					  .attr()
					  .text(function (d, i) {
						  var units = "";
						  if (typeof data[i].uom != "undefined"){
							 units = " " + data[i].uom; 
						  }
						  return (data[i].label + " [" + data[i].value + units + "]");
						  })
					.attr('fill', function (d, i) { return color(i); });
				}
			}
		}
		
		//Resize object
		function resize(width, height) {
			scope.scale = Math.min(width / 200, height / 200);
			d3.select("#" + id).selectAll("*").remove();
			initChart(width, height);
		}
	};
	
	//Symbol definition
	var def = {
		typeName: 'donut',
		displayName: 'Donut Chart',
		templateUrl: 'scripts/app/editor/symbols/ext/sym-donut-template.html',
		datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
		iconUrl: 'Images/donut.svg',
		visObjectType: symbolVis,
		getDefaultConfig: function() {
    		return {
    		    DataShape: 'Table',
    		    Columns: ["Label", CS.ResourceStrings.TableColValue, CS.ResourceStrings.TableColUnits],
                Height: 200,
                Width: 400,
                showLegend:true
            };
    	},
        configTitle: 'Format Symbol',
	};
	CS.symbolCatalog.register(def);
})(window.Coresight);