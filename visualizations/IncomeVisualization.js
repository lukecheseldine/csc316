class IncomeVisualization extends BaseVisualization {
    render() {
        const svg = this.createSvg();

        // Create a color scale based on income ranges
        const colorScale = d3
            .scaleOrdinal()
            .domain(["Low Income", "Medium Income", "High Income"])
            .range(["#ff7f0e", "#2ca02c", "#1f77b4"]);

        // Calculate income ranges for categorization
        const incomes = this.data.map((d) => d.income);
        const minIncome = d3.min(incomes);
        const maxIncome = d3.max(incomes);
        const incomeRange = maxIncome - minIncome;
        const lowThreshold = minIncome + incomeRange / 3;
        const highThreshold = maxIncome - incomeRange / 3;

        // Categorize students by income level
        this.data.forEach((d) => {
            if (d.income < lowThreshold) {
                d.incomeCategory = "Low Income";
            } else if (d.income > highThreshold) {
                d.incomeCategory = "High Income";
            } else {
                d.incomeCategory = "Medium Income";
            }
        });

        // Create scales
        const xScale = d3
            .scaleLinear()
            .domain([minIncome, maxIncome])
            .range([0, this.width])
            .nice();

        const xAxis = d3
            .axisBottom(xScale)
            .tickFormat((d) => d3.format(",.0f")(d));

        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(this.data, (d) => d.discretionary_spending)])
            .range([this.height, 0])
            .nice();

        // Add axes
        this.addAxes(
            svg,
            xScale,
            yScale,
            "Monthly Income After Expenses ($)",
            "Discretionary Spending ($)",
            xAxis
        );

        // Add scatter plot points
        svg.selectAll("circle")
            .data(this.data)
            .join("circle")
            .attr("cx", (d) => xScale(d.income))
            .attr("cy", (d) => yScale(d.discretionary_spending))
            .attr("r", 5)
            .attr("fill", (d) => colorScale(d.incomeCategory))
            .attr("opacity", 0.7)
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5);

        // Add trend line
        const trendData = this.data.map((d) => ({
            x: d.income,
            y: d.discretionary_spending,
        }));

        // Calculate linear regression
        const xValues = trendData.map((d) => d.x);
        const yValues = trendData.map((d) => d.y);
        const xMean = d3.mean(xValues);
        const yMean = d3.mean(yValues);

        const numerator = d3.sum(
            trendData.map((d, i) => (d.x - xMean) * (d.y - yMean))
        );
        const denominator = d3.sum(
            trendData.map((d) => Math.pow(d.x - xMean, 2))
        );

        const slope = numerator / denominator;
        const intercept = yMean - slope * xMean;

        // Create line function
        const line = d3
            .line()
            .x((d) => xScale(d))
            .y((d) => yScale(slope * d + intercept));

        // Add the trend line
        svg.append("path")
            .datum([minIncome, maxIncome])
            .attr("fill", "none")
            .attr("stroke", "#666")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5")
            .attr("d", line);

        const legend = svg
            .append("g")
            .attr("transform", `translate(${this.width - 120}, 20)`);

        const incomeCategories = ["Low Income", "Medium Income", "High Income"];

        incomeCategories.forEach((category, i) => {
            const legendRow = legend
                .append("g")
                .attr("transform", `translate(0, ${i * 20})`);

            legendRow
                .append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 5)
                .attr("fill", colorScale(category));

            legendRow
                .append("text")
                .attr("x", 10)
                .attr("y", 4)
                .text(category)
                .style("font-size", "12px");
        });

        // Add correlation information
        const correlation =
            numerator /
            (Math.sqrt(denominator) *
                Math.sqrt(
                    d3.sum(trendData.map((d) => Math.pow(d.y - yMean, 2)))
                ));

        svg.append("text")
            .attr("x", 20)
            .attr("y", 20)
            .text(`Correlation: ${correlation.toFixed(2)}`)
            .style("font-size", "12px")
            .style("font-weight", "bold");
    }
}
