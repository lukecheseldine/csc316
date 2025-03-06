class MajorVisualization extends BaseVisualization {
    render() {
        const svg = this.createSvg();

        const majorGroups = d3.group(this.data, d => d.major);
        const colors = {
            'Computer Science': '#ff7f0e',
            'Engineering': '#2ca02c',
            'Economics': '#1f77b4',
            'Biology': '#d62728',
            'Psychology': '#9467bd'
        };

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => +d.financial_aid)])
            .range([0, this.width])
            .nice();

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => +d.tuition)])
            .range([this.height, 0])
            .nice();

        this.addAxes(svg, xScale, yScale, "Financial Aid ($)", "Tuition ($)");

        majorGroups.forEach((students, major) => {
            svg.selectAll(`circle.${major.toLowerCase().replace(/\s+/g, '-')}`)
                .data(students)
                .join("circle")
                .attr("class", major.toLowerCase().replace(/\s+/g, '-'))
                .attr("cx", d => xScale(+d.financial_aid))
                .attr("cy", d => yScale(+d.tuition))
                .attr("r", 4)
                .attr("fill", colors[major])
                .attr("opacity", 0.6);
        });

        const legend = svg.append("g")
            .attr("transform", `translate(${this.width - 160}, 20)`);

        Object.entries(colors).forEach(([major, color], i) => {
            const legendRow = legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);

            legendRow.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 4)
                .attr("fill", color);

            legendRow.append("text")
                .attr("x", 10)
                .attr("y", 4)
                .text(major)
                .style("font-size", "12px");
        });
    }
} 