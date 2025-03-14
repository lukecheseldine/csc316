class YearOfStudyVisualization extends BaseVisualization {
    constructor(container, data) {
        super(container, data);
        this.categories = [
            { name: 'entertainment', label: 'Entertainment', color: '#ff7f0e' },
            { name: 'personal_care', label: 'Personal Care', color: '#2ca02c' },
            { name: 'miscellaneous', label: 'Miscellaneous', color: '#1f77b4' }
        ];
        this.yearOrder = {
            'Freshman': 1,
            'Sophomore': 2,
            'Junior': 3,
            'Senior': 4
        };
    }

    render(categoryFilter = 'all') {
        // Clear container first
        d3.select(this.container).selectAll("*").remove();

        // Increase right margin to accommodate legend without overlap
        this.margin.right = 200;
        const svg = this.createSvg();

        // Process data like before
        const yearAverages = d3.rollup(this.data,
            v => ({
                entertainment: d3.mean(v, d => +d.entertainment),
                personal_care: d3.mean(v, d => +d.personal_care),
                miscellaneous: d3.mean(v, d => +d.miscellaneous),
                total: d3.mean(v, d => +d.entertainment + +d.personal_care + +d.miscellaneous)
            }),
            d => d.year_in_school
        );

        const yearData = Array.from(yearAverages)
            .sort((a, b) => this.yearOrder[a[0]] - this.yearOrder[b[0]]);

        // Add year labels on x-axis
        const xScale = d3.scalePoint()
            .domain(['Freshman', 'Sophomore', 'Junior', 'Senior'])
            .range([0, this.width])
            .padding(0.5);

        // Filter categories if needed
        let categories = [...this.categories];
        if (categoryFilter !== 'all') {
            categories = categories.filter(c => c.name === categoryFilter);
        }

        // Find max value for y scale
        const yMax = d3.max(yearData, d => {
            if (categoryFilter === 'all') {
                return Math.max(d[1].entertainment, d[1].personal_care, d[1].miscellaneous);
            } else {
                return d[1][categoryFilter];
            }
        });

        const yScale = d3.scaleLinear()
            .domain([0, yMax * 1.1]) // Add 10% padding at top
            .range([this.height, 0])
            .nice();

        // Add axes
        svg.append("g")
            .attr("transform", `translate(0,${this.height})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .call(d3.axisLeft(yScale));

        // Add axis labels
        svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", this.height + 40)
            .style("text-anchor", "middle")
            .attr("class", "axis-label")
            .text("Year of Study");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -this.margin.left + 15)
            .attr("x", -this.height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("class", "axis-label")
            .text("Average Spending ($)");

        // Add overall average line (new feature)
        if (categoryFilter !== 'all') {
            const avgValue = d3.mean(yearData, d => d[1][categoryFilter]);

            svg.append("line")
                .attr("x1", 0)
                .attr("x2", this.width)
                .attr("y1", yScale(avgValue))
                .attr("y2", yScale(avgValue))
                .attr("stroke", "gray")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "5,5")
                .attr("opacity", 0)
                .transition()
                .duration(800)
                .attr("opacity", 1);

            svg.append("text")
                .attr("x", this.width - 5)
                .attr("y", yScale(avgValue) - 5)
                .attr("text-anchor", "end")
                .style("font-size", "12px")
                .text(`Avg: $${Math.round(avgValue)}`)
                .attr("opacity", 0)
                .transition()
                .duration(800)
                .attr("opacity", 1);
        }

        // Draw lines for each category
        categories.forEach(category => {
            // Add path with animation
            const line = d3.line()
                .x(d => xScale(d[0]))
                .y(d => yScale(d[1][category.name]))
                .curve(d3.curveMonotoneX); // Smoother curve

            const path = svg.append("path")
                .datum(yearData)
                .attr("class", `line ${category.name}`)
                .attr("fill", "none")
                .attr("stroke", category.color)
                .attr("stroke-width", 3)
                .attr("d", line)
                .attr("opacity", 0);

            // Get the total length of the path
            const totalLength = path.node().getTotalLength();

            path.attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .attr("opacity", 1)
                .transition()
                .duration(1000)
                .attr("stroke-dashoffset", 0);

            // Add data points with animation
            svg.selectAll(`.point-${category.name}`)
                .data(yearData)
                .join("circle")
                .attr("class", `point-${category.name} ${category.name}`)
                .attr("cx", d => xScale(d[0]))
                .attr("cy", d => yScale(d[1][category.name]))
                .attr("r", 0) // Start with radius 0
                .attr("fill", category.color)
                .transition()
                .delay(1000) // Wait for line animation
                .duration(500)
                .attr("r", 6);

            // Add value labels
            svg.selectAll(`.value-label-${category.name}`)
                .data(yearData)
                .join("text")
                .attr("class", `value-label-${category.name}`)
                .attr("x", d => xScale(d[0]))
                .attr("y", d => yScale(d[1][category.name]) - 10)
                .attr("text-anchor", "middle")
                .style("font-size", "11px")
                .style("fill", category.color)
                .style("font-weight", "bold")
                .style("opacity", 0) // Start invisible
                .text(d => `$${Math.round(d[1][category.name])}`)
                .transition()
                .delay(1500) // Wait for circles
                .duration(500)
                .style("opacity", 1);

            // Add hover interactivity to points
            svg.selectAll(`.point-${category.name}`)
                .on("mouseover", function (event, d) {
                    // Enlarge point
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("r", 8);

                    // Get exact position for tooltip (fixes positioning issues)
                    const xPos = parseFloat(d3.select(this).attr("cx"));
                    const yPos = parseFloat(d3.select(this).attr("cy"));

                    // Remove any existing tooltips first
                    svg.selectAll(".tooltip-bg, .tooltip-text").remove();

                    // Add tooltip background
                    svg.append("rect")
                        .attr("class", "tooltip-bg")
                        .attr("x", xPos - 80)
                        .attr("y", yPos - 45)
                        .attr("width", 160)
                        .attr("height", 30)
                        .attr("fill", "white")
                        .attr("stroke", category.color)
                        .attr("rx", 5);

                    // Add tooltip text
                    svg.append("text")
                        .attr("class", "tooltip-text")
                        .attr("x", xPos)
                        .attr("y", yPos - 25)
                        .attr("text-anchor", "middle")
                        .style("font-size", "12px")
                        .text(`${d[0]}: $${Math.round(d[1][category.name])} (${category.label})`)
                        .style("font-size", "12px");
                })
                .on("mouseout", function () {
                    // Restore point size
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("r", 6);

                    // Remove tooltip
                    svg.selectAll(".tooltip-bg, .tooltip-text").remove();
                });
        });

        // Create legend with interactive features - positioned outside the main chart area
        const legend = svg.append("g")
            .attr("transform", `translate(${this.width + 20}, 20)`)
            .attr("class", "legend");

        // Background for legend
        legend.append("rect")
            .attr("width", 170)
            .attr("height", categories.length * 25 + 10)
            .attr("fill", "white")
            .attr("fill-opacity", 0.8)
            .attr("rx", 5)
            .attr("stroke", "#ccc");

        categories.forEach((category, i) => {
            const legendRow = legend.append("g")
                .attr("transform", `translate(10, ${i * 25 + 15})`)
                .attr("class", "legend-item")
                .style("cursor", "pointer");

            // Line sample
            legendRow.append("line")
                .attr("x1", 0)
                .attr("x2", 20)
                .attr("stroke", category.color)
                .attr("stroke-width", 2);

            // Circle sample
            legendRow.append("circle")
                .attr("cx", 10)
                .attr("cy", 0)
                .attr("r", 4)
                .attr("fill", category.color);

            // Category label
            legendRow.append("text")
                .attr("x", 30)
                .attr("y", 4)
                .text(category.label)
                .style("font-size", "12px");

            // Make legend items interactive
            legendRow.on("mouseover", function () {
                // Highlight this category
                svg.selectAll(`path`)
                    .filter(function () {
                        return !d3.select(this).classed("highlighted");
                    })
                    .transition()
                    .duration(200)
                    .attr("opacity", 0.3);

                svg.selectAll("circle")
                    .transition()
                    .duration(200)
                    .attr("opacity", 0.3);

                svg.selectAll(`circle.${category.name}`)
                    .transition()
                    .duration(200)
                    .attr("opacity", 1)
                    .attr("r", 7);

                d3.select(this).select("text")
                    .transition()
                    .duration(200)
                    .style("font-weight", "bold");
            })
                .on("mouseout", function () {
                    // Reset
                    svg.selectAll("path")
                        .transition()
                        .duration(200)
                        .attr("opacity", 1);

                    svg.selectAll("circle")
                        .transition()
                        .duration(200)
                        .attr("opacity", 1)
                        .attr("r", 6);

                    d3.select(this).select("text")
                        .transition()
                        .duration(200)
                        .style("font-weight", "normal");
                });
        });
    }
}