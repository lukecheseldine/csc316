class MajorVisualization extends BaseVisualization {
    constructor(container, data) {
        super(container, data);
        this.categories = [
            { id: 'entertainment', label: 'Entertainment', color: '#ff7f0e' },
            { id: 'personal_care', label: 'Personal Care', color: '#2ca02c' },
            { id: 'miscellaneous', label: 'Miscellaneous', color: '#1f77b4' }
        ];
        this.majors = ['Computer Science', 'Engineering', 'Economics', 'Biology', 'Psychology'];
    }

    render(selectedCategory = 'all', normalizeData = false) {
        // Clear previous content
        d3.select(this.container).selectAll("*").remove();

        // Increase right margin to accommodate legend
        this.margin = { top: 20, right: 120, bottom: 50, left: 60 };
        const svg = this.createSvg();

        // Calculate major averages
        const majorAverages = d3.rollup(this.data,
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
            d => d.major
        );

        // Prepare data for visualization
        const plotData = [];

        this.majors.forEach(major => {
            if (majorAverages.has(major)) {
                const majorData = majorAverages.get(major);

                // If showing all categories
                if (selectedCategory === 'all') {
                    this.categories.forEach(category => {
                        // If normalizing, convert to percent of total
                        const value = normalizeData ?
                            (majorData[category.id] / majorData.total) * 100 :
                            majorData[category.id];

                        plotData.push({
                            major: major,
                            category: category.id,
                            categoryLabel: category.label,
                            value: value,
                            color: category.color
                        });
                    });
                } else {
                    // If showing a specific category
                    const category = this.categories.find(c => c.id === selectedCategory);
                    if (category) {
                        // If normalizing, convert to percent of total
                        const value = normalizeData ?
                            (majorData[category.id] / majorData.total) * 100 :
                            majorData[category.id];

                        plotData.push({
                            major: major,
                            category: category.id,
                            categoryLabel: category.label,
                            value: value,
                            color: category.color
                        });
                    }
                }
            }
        });

        // Find max for y-scale
        const maxValue = d3.max(plotData, d => d.value);

        // Create scales
        const xScale = d3.scaleBand()
            .domain(this.majors)
            .range([0, this.width])
            .padding(0.3);

        let yScale;
        if (normalizeData && selectedCategory === 'all') {
            // For percentage stacked bars, fixed scale to 100%
            yScale = d3.scaleLinear()
                .domain([0, 100])
                .range([this.height, 0]);
        } else {
            // For regular bars, scale to max value
            yScale = d3.scaleLinear()
                .domain([0, maxValue * 1.1]) // Add 10% padding
                .range([this.height, 0]);
        }

        // Add axes
        svg.append("g")
            .attr("transform", `translate(0,${this.height})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .call(d3.axisLeft(yScale)
                .ticks(5)
                .tickFormat(d => normalizeData ? `${d}%` : `$${d}`));

        // Add axis labels
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .attr("x", -this.height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(normalizeData ? "Percentage of Total Spending" : "Average Spending ($)");

        // Code for either stacked bars or grouped bars
        if (selectedCategory === 'all') {
            // Create groups for each major
            const majorGroups = svg.selectAll(".major-group")
                .data(this.majors)
                .join("g")
                .attr("class", "major-group")
                .attr("transform", d => `translate(${xScale(d)},0)`);

            if (normalizeData) {
                // For normalized data, create stacked bars
                const stack = d3.stack()
                    .keys(this.categories.map(c => c.id))
                    .value((d, key) => {
                        const item = plotData.find(item =>
                            item.major === d && item.category === key);
                        return item ? item.value : 0;
                    });

                const stackedData = stack(
                    this.majors.map(major => {
                        const obj = { major };
                        this.categories.forEach(cat => {
                            const item = plotData.find(d =>
                                d.major === major && d.category === cat.id);
                            obj[cat.id] = item ? item.value : 0;
                        });
                        return obj;
                    })
                );

                // Add stacked bars
                this.categories.forEach((category, i) => {
                    svg.selectAll(`.bar-${category.id}`)
                        .data(stackedData[i])
                        .join("rect")
                        .attr("class", `bar bar-${category.id}`)
                        .attr("x", d => xScale(d.data.major))
                        .attr("y", d => yScale(d[1]))
                        .attr("height", d => yScale(d[0]) - yScale(d[1]))
                        .attr("width", xScale.bandwidth())
                        .attr("fill", category.color)
                        .on("mouseover", function (event, d) {
                            // Clear previous tooltips
                            svg.selectAll(".tooltip-bg, .tooltip-text").remove();

                            d3.select(this)
                                .transition()
                                .duration(200)
                                .attr("opacity", 0.8)
                                .attr("stroke", "black")
                                .attr("stroke-width", 1);

                            // Get bar position for tooltip
                            const barX = parseFloat(d3.select(this).attr("x"));
                            const barY = parseFloat(d3.select(this).attr("y"));
                            const barWidth = parseFloat(d3.select(this).attr("width"));

                            // Get value for this segment
                            const value = d[1] - d[0];
                            const major = d.data.major;

                            // Position tooltip above the bar
                            const tooltipX = barX + barWidth / 2;
                            const tooltipY = barY - 10;

                            // Tooltip background
                            svg.append("rect")
                                .attr("class", "tooltip-bg")
                                .attr("x", tooltipX - 60)
                                .attr("y", tooltipY - 35)
                                .attr("width", 120)
                                .attr("height", 35)
                                .attr("fill", "white")
                                .attr("stroke", category.color)
                                .attr("rx", 5);

                            // Tooltip text
                            svg.append("text")
                                .attr("class", "tooltip-text")
                                .attr("x", tooltipX)
                                .attr("y", tooltipY - 20)
                                .attr("text-anchor", "middle")
                                .style("font-size", "11px")
                                .style("font-weight", "bold")
                                .text(`${major}`);

                            svg.append("text")
                                .attr("class", "tooltip-text")
                                .attr("x", tooltipX)
                                .attr("y", tooltipY - 5)
                                .attr("text-anchor", "middle")
                                .style("font-size", "10px")
                                .text(`${category.label}: ${value.toFixed(1)}%`);
                        })
                        .on("mouseout", function () {
                            d3.select(this)
                                .transition()
                                .duration(200)
                                .attr("opacity", 1)
                                .attr("stroke", "none");

                            svg.selectAll(".tooltip-bg, .tooltip-text").remove();
                        });
                });
            } else {
                // For regular data, create grouped bars
                majorGroups.selectAll("rect.bar")
                    .data(d => plotData.filter(item => item.major === d))
                    .join("rect")
                    .attr("class", "bar")
                    .attr("x", d => {
                        const categoryIndex = this.categories
                            .findIndex(c => c.id === d.category);
                        const categoryWidth = xScale.bandwidth() / this.categories.length;
                        return categoryIndex * categoryWidth;
                    })
                    .attr("y", this.height) // Start at baseline for animation
                    .attr("width", xScale.bandwidth() / this.categories.length)
                    .attr("height", 0) // Start with height 0 for animation
                    .attr("fill", d => d.color)
                    .transition()
                    .duration(1000)
                    .attr("y", d => yScale(d.value))
                    .attr("height", d => this.height - yScale(d.value));

                // Add value labels
                majorGroups.selectAll(".value-label")
                    .data(d => plotData.filter(item => item.major === d))
                    .join("text")
                    .attr("class", "value-label")
                    .attr("x", d => {
                        const categoryIndex = this.categories
                            .findIndex(c => c.id === d.category);
                        const categoryWidth = xScale.bandwidth() / this.categories.length;
                        return categoryIndex * categoryWidth + categoryWidth / 2;
                    })
                    .attr("y", d => yScale(d.value) - 5)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "9px")
                    .attr("opacity", 0) // Start invisible for animation
                    .text(d => `$${Math.round(d.value)}`)
                    .transition()
                    .delay(1000) // Wait for bars to finish
                    .duration(500)
                    .attr("opacity", 1);

                // Add hover effects
                majorGroups.selectAll("rect.bar")
                    .on("mouseover", function (event, d) {
                        // Remove any existing tooltips
                        svg.selectAll(".tooltip-bg, .tooltip-text").remove();

                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("opacity", 0.8)
                            .attr("stroke", "black")
                            .attr("stroke-width", 2);

                        // Get bar position for fixed tooltip
                        const barX = parseFloat(d3.select(this).attr("x"));
                        const barY = parseFloat(d3.select(this).attr("y"));
                        const barWidth = parseFloat(d3.select(this).attr("width"));

                        // Position tooltip above the bar
                        const tooltipX = xScale(d.major) + barX + barWidth / 2;
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
                            .style("font-size", "11px")
                            .style("font-weight", "bold")
                            .text(`${d.major}`);

                        svg.append("text")
                            .attr("class", "tooltip-text")
                            .attr("x", tooltipX)
                            .attr("y", tooltipY - 5)
                            .attr("text-anchor", "middle")
                            .style("font-size", "10px")
                            .text(`${d.categoryLabel}: $${Math.round(d.value)}`);
                    })
                    .on("mouseout", function () {
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("opacity", 1)
                            .attr("stroke", "none");

                        svg.selectAll(".tooltip-bg, .tooltip-text").remove();
                    });
            }

        } else {
            // If showing a specific category, show a simple bar chart
            const bars = svg.selectAll("rect.bar")
                .data(plotData)
                .join("rect")
                .attr("class", "bar")
                .attr("x", d => xScale(d.major))
                .attr("y", this.height) // Start at baseline for animation
                .attr("width", xScale.bandwidth())
                .attr("height", 0) // Start with height 0 for animation
                .attr("fill", d => d.color)
                .transition()
                .duration(1000)
                .attr("y", d => yScale(d.value))
                .attr("height", d => this.height - yScale(d.value));

            // Add value labels with better positioning
            svg.selectAll(".value-label")
                .data(plotData)
                .join("text")
                .attr("class", "value-label")
                .attr("x", d => xScale(d.major) + xScale.bandwidth() / 2)
                .attr("y", d => yScale(d.value) - 5)
                .attr("text-anchor", "middle")
                .attr("font-size", "10px")
                .attr("opacity", 0) // Start invisible for animation
                .text(d => normalizeData ?
                    `${d.value.toFixed(1)}%` :
                    `$${Math.round(d.value)}`)
                .transition()
                .delay(1000) // Wait for bars to finish
                .duration(500)
                .attr("opacity", 1);

            // Add average line
            const avgValue = d3.mean(plotData, d => d.value);

            svg.append("line")
                .attr("x1", 0)
                .attr("x2", this.width)
                .attr("y1", yScale(avgValue))
                .attr("y2", yScale(avgValue))
                .attr("stroke", "#666")
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
                .text(`Avg: ${normalizeData ? avgValue.toFixed(1) + '%' : '$' + Math.round(avgValue)}`)
                .attr("opacity", 0)
                .transition()
                .duration(800)
                .attr("opacity", 1);

            // Add hover effects with fixed tooltip position
            svg.selectAll("rect.bar")
                .on("mouseover", function (event, d) {
                    // Remove any existing tooltips
                    svg.selectAll(".tooltip-bg, .tooltip-text").remove();

                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("opacity", 0.8)
                        .attr("stroke", "black")
                        .attr("stroke-width", 2);

                    // Get bar position for fixed tooltip
                    const barX = parseFloat(d3.select(this).attr("x"));
                    const barY = parseFloat(d3.select(this).attr("y"));
                    const barWidth = parseFloat(d3.select(this).attr("width"));

                    // Position tooltip above the bar
                    const tooltipX = barX + barWidth / 2;
                    const tooltipY = barY - 10;

                    // Calculate percentage difference from average
                    const diffFromAvg = ((d.value - avgValue) / avgValue) * 100;
                    const comparisonText = diffFromAvg > 0 ?
                        `${diffFromAvg.toFixed(1)}% above avg` :
                        `${Math.abs(diffFromAvg).toFixed(1)}% below avg`;

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
                        .style("font-size", "11px")
                        .style("font-weight", "bold")
                        .text(d.major);

                    svg.append("text")
                        .attr("class", "tooltip-text")
                        .attr("x", tooltipX)
                        .attr("y", tooltipY - 5)
                        .attr("text-anchor", "middle")
                        .style("font-size", "10px")
                        .text(comparisonText);
                })
                .on("mouseout", function () {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("opacity", 1)
                        .attr("stroke", "none");

                    svg.selectAll(".tooltip-bg, .tooltip-text").remove();
                });
        }

        // Add legend with PROPER EVEN SPACING
        if (selectedCategory === 'all') {
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

    getCategoryLabel(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.label : categoryId;
    }
}