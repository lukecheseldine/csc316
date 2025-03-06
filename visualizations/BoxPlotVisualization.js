class BoxPlotVisualization {
    constructor(container, data, userValue) {
        this.container = container;
        this.rawData = data;
        this.userValue = userValue;

        this.margin = { top: 40, right: 30, bottom: 50, left: 80 };
        this.width =
            container.clientWidth - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;
    }

    processData() {
        // Calculate total discretionary spending for each student
        const totals = this.rawData.map(
            (d) => d.entertainment + d.personal_care + d.miscellaneous
        );

        // Sort the totals for percentile calculations
        const sortedTotals = [...totals].sort((a, b) => a - b);

        // Calculate statistics
        const min = d3.min(totals);
        const max = d3.max(totals);
        const q1 = d3.quantile(sortedTotals, 0.25);
        const median = d3.median(sortedTotals);
        const q3 = d3.quantile(sortedTotals, 0.75);
        const mean = d3.mean(totals);

        // Calculate IQR and whiskers
        const iqr = q3 - q1;
        const lowerWhisker = Math.max(min, q1 - 1.5 * iqr);
        const upperWhisker = Math.min(max, q3 + 1.5 * iqr);

        return {
            min,
            max,
            q1,
            median,
            q3,
            mean,
            iqr,
            lowerWhisker,
            upperWhisker,
            allData: totals,
        };
    }

    calculatePercentile(value) {
        // Calculate the percentile of the user's spending
        const totals = this.rawData.map(
            (d) => d.entertainment + d.personal_care + d.miscellaneous
        );

        const belowCount = totals.filter((total) => total < value).length;
        return (belowCount / totals.length) * 100;
    }

    render() {
        // Process the data
        const stats = this.processData();

        // Calculate where the user falls in the distribution
        const percentile = this.calculatePercentile(this.userValue);

        // Create SVG element
        const svg = d3
            .select(this.container)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr(
                "transform",
                `translate(${this.margin.left},${this.margin.top})`
            );

        // Create y scale
        const yScale = d3
            .scaleLinear()
            .domain([0, Math.max(stats.max, this.userValue) * 1.1])
            .range([this.height, 0]);

        // Add y axis
        svg.append("g").call(d3.axisLeft(yScale));

        // Add y axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -this.margin.left + 15)
            .attr("x", -this.height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("class", "axis-label")
            .text("Monthly Spending ($)");

        // Box width
        const boxWidth = 100;

        // Draw box
        svg.append("rect")
            .attr("x", this.width / 2 - boxWidth / 2)
            .attr("y", yScale(stats.q3))
            .attr("height", yScale(stats.q1) - yScale(stats.q3))
            .attr("width", boxWidth)
            .attr("class", "box");

        // Draw median line
        svg.append("line")
            .attr("x1", this.width / 2 - boxWidth / 2)
            .attr("x2", this.width / 2 + boxWidth / 2)
            .attr("y1", yScale(stats.median))
            .attr("y2", yScale(stats.median))
            .attr("class", "median-line");

        // Draw whiskers
        // Upper whisker
        svg.append("line")
            .attr("x1", this.width / 2)
            .attr("x2", this.width / 2)
            .attr("y1", yScale(stats.q3))
            .attr("y2", yScale(stats.upperWhisker))
            .attr("class", "whisker");

        svg.append("line")
            .attr("x1", this.width / 2 - 20)
            .attr("x2", this.width / 2 + 20)
            .attr("y1", yScale(stats.upperWhisker))
            .attr("y2", yScale(stats.upperWhisker))
            .attr("class", "whisker");

        // Lower whisker
        svg.append("line")
            .attr("x1", this.width / 2)
            .attr("x2", this.width / 2)
            .attr("y1", yScale(stats.q1))
            .attr("y2", yScale(stats.lowerWhisker))
            .attr("class", "whisker");

        svg.append("line")
            .attr("x1", this.width / 2 - 20)
            .attr("x2", this.width / 2 + 20)
            .attr("y1", yScale(stats.lowerWhisker))
            .attr("y2", yScale(stats.lowerWhisker))
            .attr("class", "whisker");

        // Draw user's spending as a triangle
        svg.append("path")
            .attr("d", d3.symbol().type(d3.symbolTriangle).size(150))
            .attr(
                "transform",
                `translate(${this.width / 2}, ${yScale(this.userValue)})`
            )
            .attr("class", "your-spending");

        // Add label for user's spending
        svg.append("text")
            .attr("x", this.width / 2 + 15)
            .attr("y", yScale(this.userValue))
            .attr("dy", "0.35em")
            .attr("class", "legend-item")
            .text("Your Spending");

        // Add title
        svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", -this.margin.top / 2)
            .attr("text-anchor", "middle")
            .attr("class", "axis-label")
            .text("Discretionary Spending Distribution");

        // Add legend for box plot elements
        const legendData = [
            { label: "Median", class: "median-line", type: "line" },
            { label: "25%-75% Range", class: "box", type: "rect" },
            {
                label: "Min/Max (excl. outliers)",
                class: "whisker",
                type: "line",
            },
        ];

        const legend = svg
            .append("g")
            .attr(
                "transform",
                `translate(${this.width - 180}, ${this.height - 100})`
            );

        legendData.forEach((item, i) => {
            if (item.type === "rect") {
                legend
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", i * 20)
                    .attr("width", 15)
                    .attr("height", 15)
                    .attr("class", item.class);
            } else if (item.type === "line") {
                legend
                    .append("line")
                    .attr("x1", 0)
                    .attr("x2", 15)
                    .attr("y1", i * 20 + 7.5)
                    .attr("y2", i * 20 + 7.5)
                    .attr("class", item.class);
            }

            legend
                .append("text")
                .attr("x", 25)
                .attr("y", i * 20 + 7.5)
                .attr("dy", "0.35em")
                .attr("class", "legend-item")
                .text(item.label);
        });

        // Return the stats and percentile for use in the summary
        return { stats, percentile };
    }
}
