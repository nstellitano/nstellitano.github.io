

sankey_chart = function(parent_element)
{
    that = this;
    var units = "Surveyed (Weighted)";
    //var slider_year = parseInt(d3.select("#slider-time").property("value"));
    //document.getElementById("year").innerHTML = slider_year.toString();

    this.margin = {top: 10, right: 300, bottom: 10, left: 10}
    this.width = 1450 - that.margin.left - that.margin.right
    this.height = 900 - that.margin.top - that.margin.bottom;

    this.formatNumber = d3.format(",.0f");  // zero decimal places
      this.format = function (d) {
            return that.formatNumber(d) + " " + units;
        },
        color = d3.scale.category20();

    // append the svg canvas to the page
    this.svg = parent_element.append("svg")
        .attr("width", that.width + that.margin.left + that.margin.right)
        .attr("height", that.height + that.margin.top + that.margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + that.margin.left + "," + that.margin.top + ")");

    // Set the sankey diagram properties
    this.sankey = d3.sankey()
        .nodeWidth(20)
        .nodePadding(40)
        .size([that.width, that.height]);

    this.path = this.sankey.link();

    this.graph =0;
    this.oldgraph = 0;
    this.oldgraphbig=0;

    this.initVis()
}

sankey_chart.prototype.initVis = function() {

    that = this;

}

    sankey_chart.prototype.chart = function()  {

        that = this;

       // d3.selectAll(".node").remove()
        //d3.selectAll(".link").remove()


// add in the links


        var link = this.svg.selectAll(".link")
            .data(that.graph.links, function(d){return d.id})

            link.enter().append("path").attr("class", "link")


        link.exit().remove()

        link.attr("d", that.path)
            .transition().duration(3000)
            .style("stroke-width", function(d) { return Math.max(1, d.dy); })
            //.sort(function(a, b) { return b.dy - a.dy; });


// add the link titles
        var title = link.selectAll(".title")
            .data(function(d){return [d]})

        title.enter().append("title").attr("class", "title")

        title.exit().remove();

        title
            .text(function(d) {
                return d.source.name + " → " +
                    d.target.name + "\n" + that.format(d.value); });



// add in the nodes
        console.log(that.graph.nodes)

        var node = this.svg.selectAll(".node")
            .data(that.graph.nodes, function(d) { return d.id})

            node.enter().append("g")
            .attr("class", "node")

        node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"; })
            .call(d3.behavior.drag()
                .origin(function(d) { return d; })
                .on("dragstart", function() {
                    this.parentNode.appendChild(this); })
                .on("drag", dragmove));

        node.exit().remove()

// add the rectangles for the nodes

        var rect = node.selectAll(".rect")
            .data(function(d) {return [d]})


        rect.enter().append("rect").attr("class", "rect")

        var count = -1;
            rect
                //.attr("height", function(d,i) {count++; return that.oldgraph.nodes[i].dy ; })
                //.transition().duration(1000)
                .attr("height", function(d) {return d.dy; })

                rect
                    .attr("width", that.sankey.nodeWidth())
                    .style("fill", function(d) {
                return d.color = color(d.name.replace(/ .*/, "")); })
            .style("stroke", function(d) {
                return d3.rgb(d.color).darker(2); })
            .append("title")
            .text(function(d) {
                return d.name + "\n" + that.format(d.value); });



        rect.exit().remove()

        var label = node.selectAll(".text")
            .data(function(d) {return [d]})


        label.enter().append("text").attr("class", "text")

        label
            .attr("x", -6)
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x < that.width / 2; })
            .attr("x", 6 + that.sankey.nodeWidth())
            .attr("text-anchor", "start");


        label.exit().remove()

        var testing = that;

// the function for moving the nodes
        function dragmove(d) {

            d3.select(this).attr("transform",
                "translate(" + (
                    d.x = Math.max(0, Math.min(testing.width - d.dx, d3.event.x))
                ) + "," + (
                    d.y = Math.max(0, Math.min(testing.height - d.dy, d3.event.y))
                ) + ")");
             testing.sankey.relayout();
            link.attr("d", testing.path);
        }



        };






sankey_chart.prototype.update = function(year){

    that = this;


    var chart= JSON.parse(JSON.stringify(year, null, 1));


            var nodeMap = {};
            chart.nodes.forEach(function (x) {
                nodeMap[x.name] = x;
            });
            chart.links = chart.links.map(function (x) {
                return {
                    source: nodeMap[x.source],
                    target: nodeMap[x.target],
                    value: x.value
                };
            });

            that.sankey
                .nodes(chart.nodes)
                .links(chart.links)
                .layout(32);

            that.graph = chart


console.log(that.graph)

    for(i=0; i<that.graph.links.length; i++){
        that.graph.links[i].id = i
    }

    this.path = this.sankey.link();

        this.chart()



}

