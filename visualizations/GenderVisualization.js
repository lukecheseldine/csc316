class GenderVisualization extends BaseVisualization {
    render() {
        const svg = this.createSvg();

        const genderGroups = d3.group(this.data, d => d.gender);
        const colors = {
            'Female': '#ff7f0e',
            'Male': '#2ca02c',
            'Non-binary': '#1f77b4'
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

        genderGroups.forEach((students, gender) => {
            svg.selectAll(`circle.${gender.toLowerCase()}`)
                .data(students)
                .join("circle")
                .attr("class", gender.toLowerCase())
                .attr("cx", d => xScale(+d.financial_aid))
                .attr("cy", d => yScale(+d.tuition))
                .attr("r", 4)
                .attr("fill", colors[gender])
                .attr("opacity", 0.6);
        });

        const legend = svg.append("g")
            .attr("transform", `translate(${this.width - 160}, 20)`);

        Object.entries(colors).forEach(([gender, color], i) => {
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
                .text(gender)
                .style("font-size", "12px");
        });
    }
} 