class YearOfStudyVisualization extends BaseVisualization {
    render() {
        const svg = this.createSvg();

        const yearOrder = {
            'Freshman': 1,
            'Sophomore': 2,
            'Junior': 3,
            'Senior': 4
        };

        const yearAverages = d3.rollup(this.data,
            v => ({
                entertainment: d3.mean(v, d => +d.entertainment),
                personal_care: d3.mean(v, d => +d.personal_care),
                miscellaneous: d3.mean(v, d => +d.miscellaneous)
            }),
            d => d.year_in_school
        );

        const yearData = Array.from(yearAverages)
            .sort((a, b) => yearOrder[a[0]] - yearOrder[b[0]]);

        const xScale = d3.scalePoint()
            .domain(['Freshman', 'Sophomore', 'Junior', 'Senior'])
            .range([0, this.width])
            .padding(0.5);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(yearData, d =>
                Math.max(d[1].entertainment, d[1].personal_care, d[1].miscellaneous)
            )])
            .range([this.height, 0])
            .nice();

        svg.append("g")
            .attr("transform", `translate(0,${this.height})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .call(d3.axisLeft(yScale));

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

        const createLine = (accessor) => {
            return d3.line()
                .x(d => xScale(d[0]))
                .y(d => yScale(d[1][accessor]));
        };

        const categories = [
            { name: 'entertainment', label: 'Entertainment', color: '#ff7f0e' },
            { name: 'personal_care', label: 'Personal Care', color: '#2ca02c' },
            { name: 'miscellaneous', label: 'Miscellaneous', color: '#1f77b4' }
        ];

        categories.forEach(category => {
            svg.append("path")
                .datum(yearData)
                .attr("fill", "none")
                .attr("stroke", category.color)
                .attr("stroke-width", 2)
                .attr("d", createLine(category.name));

            svg.selectAll(`circle.${category.name}`)
                .data(yearData)
                .join("circle")
                .attr("class", category.name)
                .attr("cx", d => xScale(d[0]))
                .attr("cy", d => yScale(d[1][category.name]))
                .attr("r", 4)
                .attr("fill", category.color);
        });

        const legend = svg.append("g")
            .attr("transform", `translate(${this.width - 80}, 50)`)
            .style("background-color", "white");

        categories.forEach((category, i) => {
            const legendRow = legend.append("g")
                .attr("transform", `translate(0, ${i * 25})`);

            legendRow.append("rect")
                .attr("x", -10)
                .attr("y", -10)
                .attr("width", 100)
                .attr("height", 20)
                .attr("fill", "white")
                .attr("opacity", 0.8);

            legendRow.append("line")
                .attr("x1", 0)
                .attr("x2", 20)
                .attr("stroke", category.color)
                .attr("stroke-width", 2);

            legendRow.append("text")
                .attr("x", 30)
                .attr("y", 4)
                .text(category.label)
                .style("font-size", "12px");
        });
    }
}