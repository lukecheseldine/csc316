class GenderVisualization extends BaseVisualization {
    constructor(container, data) {
        super(container, data);
        this.categories = [
            { id: 'entertainment', label: 'Entertainment', color: '#ff7f0e' },
            { id: 'personal_care', label: 'Personal Care', color: '#2ca02c' },
            { id: 'miscellaneous', label: 'Miscellaneous', color: '#1f77b4' }
        ];
        this.genders = ['Male', 'Female', 'Non-binary'];
    }

    render(highlightedCategories = [], showPercentage = false) {
        // Clear previous content
        d3.select(this.container).selectAll("*").remove();

        // Increase right margin to accommodate legend
        this.margin = { top: 20, right: 120, bottom: 50, left: 60 };
        const svg = this.createSvg();

        // No titles - these are already on the page

        // Calculate gender averages
        const genderAverages = d3.rollup(this.data,
            v => {
                const result = {};
                // Calculate category values
                this.categories.forEach(cat => {
                    result[cat.id] = d3.mean(v, d => +d[cat.id]);
                });

                // Calculate total
                result.total = this.categories.reduce((sum, cat) => sum + result[cat.id], 0);

                return result;
            },
            d => d.gender
        );

        // Prepare data for visualization
        const plotData = [];

        this.genders.forEach(gender => {
            if (genderAverages.has(gender)) {
                const genderData = genderAverages.get(gender);

                this.categories.forEach(category => {
                    // If showing percentages, convert to percent of total
                    const value = showPercentage ?
                        (genderData[category.id] / genderData.total) * 100 :
                        genderData[category.id];

                    plotData.push({
                        gender: gender,
                        category: category.id,
                        categoryLabel: category.label,
                        value: value,
                        color: category.color,
                        highlight: highlightedCategories.includes(category.id)
                    });
                });
            }
        });

        // Create scales with more padding
        const xScale = d3.scaleBand()
            .domain(this.genders)
            .range([0, this.width])
            .padding(0.3);

        const categoryScale = d3.scaleBand()
            .domain(this.categories.map(c => c.id))
            .range([0, xScale.bandwidth()])
            .padding(0.1);

        const maxValue = showPercentage ? 100 : d3.max(plotData, d => d.value);

        const yScale = d3.scaleLinear()
            .domain([0, maxValue * 1.1])
            .range([this.height, 0]);

        // Add axes
        svg.append("g")
            .attr("transform", `translate(0,${this.height})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .call(d3.axisLeft(yScale)
                .ticks(5)
                .tickFormat(d => showPercentage ? `${d}%` : `$${d}`));

        // Add axis labels
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .attr("x", -this.height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(showPercentage ? "Percentage of Total Spending" : "Average Spending ($)");

        // Create gender groups
        const genderGroups = svg.selectAll(".gender-group")
            .data(this.genders)
            .join("g")
            .attr("class", "gender-group")
            .attr("transform", d => `translate(${xScale(d)},0)`);

        // Add bars with animations and proper styling
        genderGroups.selectAll("rect.bar")
            .data(d => plotData.filter(item => item.gender === d))
            .join("rect")
            .attr("class", "bar")
            .attr("x", d => categoryScale(d.category))
            .attr("y", this.height) // Start at baseline for animation
            .attr("width", categoryScale.bandwidth())
            .attr("height", 0) // Start with height 0 for animation
            .attr("fill", d => d.color)
            .attr("opacity", d => d.highlight || highlightedCategories.length === 0 ? 1 : 0.4)
            .attr("stroke", d => d.highlight ? "black" : "none")
            .attr("stroke-width", d => d.highlight ? 2 : 0)
            .transition()
            .duration(1000)
            .attr("y", d => yScale(d.value))
            .attr("height", d => this.height - yScale(d.value));

        // Add value labels with better positioning
        genderGroups.selectAll(".value-label")
            .data(d => plotData.filter(item => item.gender === d))
            .join("text")
            .attr("class", "value-label")
            .attr("x", d => categoryScale(d.category) + categoryScale.bandwidth() / 2)
            .attr("y", d => yScale(d.value) - 5)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .attr("opacity", 0) // Start invisible for animation
            .text(d => showPercentage ?
                `${d.value.toFixed(1)}%` :
                `$${Math.round(d.value)}`)
            .transition()
            .delay(1000) // Wait for bars to finish
            .duration(500)
            .attr("opacity", 1);

        // Add hover effects with fixed tooltip position
        genderGroups.selectAll("rect.bar")
            .on("mouseover", function (event, d) {
                // Clear any existing tooltips first
                svg.selectAll(".tooltip-bg, .tooltip-text").remove();

                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("opacity", 1)
                    .attr("stroke", "black")
                    .attr("stroke-width", 2);

                // Get bar position for fixed tooltip (not mouse position)
                const barX = parseFloat(d3.select(this).attr("x"));
                const barY = parseFloat(d3.select(this).attr("y"));
                const barWidth = parseFloat(d3.select(this).attr("width"));

                // Position tooltip above the bar
                const tooltipX = xScale(d.gender) + barX + barWidth / 2;
                const tooltipY = barY - 10;

                // Tooltip background
                svg.append("rect")
                    .attr("class", "tooltip-bg")
                    .attr("x", tooltipX - 60)
                    .attr("y", tooltipY - 35)
                    .attr("width", 120)
                    .attr("height", 35)
                    .attr("fill", "white")
                    .attr("stroke", d.color)
                    .attr("rx", 5);

                // Tooltip text
                svg.append("text")
                    .attr("class", "tooltip-text")
                    .attr("x", tooltipX)
                    .attr("y", tooltipY - 20)
                    .attr("text-anchor", "middle")
                    .style("font-size", "12px")
                    .text(`${d.gender}: ${showPercentage ?
                        d.value.toFixed(1) + '%' :
                        '$' + Math.round(d.value)}`);

                // Additional info line
                svg.append("text")
                    .attr("class", "tooltip-text")
                    .attr("x", tooltipX)
                    .attr("y", tooltipY - 5)
                    .attr("text-anchor", "middle")
                    .style("font-size", "11px")
                    .text(d.categoryLabel);
            })
            .on("mouseout", function () {
                const d = d3.select(this).datum();
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("opacity", d.highlight || highlightedCategories.length === 0 ? 1 : 0.4)
                    .attr("stroke", d.highlight ? "black" : "none")
                    .attr("stroke-width", d.highlight ? 2 : 0);

                svg.selectAll(".tooltip-bg, .tooltip-text").remove();
            });

        // Add legend with PROPER EVEN SPACING
        // Create floating legend with consistent padding
        const legendPanel = d3.select(this.container)
            .append("div")
            .style("position", "absolute")
            .style("top", "20px")
            .style("right", "20px")
            .style("background-color", "white")
            .style("border", "1px solid #ddd")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("box-shadow", "0 1px 3px rgba(0,0,0,0.1)");

        this.categories.forEach((category, i) => {
            const legendRow = legendPanel.append("div")
                .style("display", "flex")
                .style("align-items", "center")
                .style("margin-bottom", i < this.categories.length - 1 ? "8px" : "0");

            legendRow.append("div")
                .style("width", "15px")
                .style("height", "15px")
                .style("background-color", category.color)
                .style("margin-right", "8px");

            legendRow.append("div")
                .text(category.label)
                .style("font-size", "12px");
        });
    }
}