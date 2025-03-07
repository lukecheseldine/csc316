class MajorVisualization extends BaseVisualization {
    render() {
        const svg = this.createSvg();

        // Add title and description - moved up by adjusting y positions
        svg.append('text')
            .attr('x', this.width / 2)
            .attr('y', 15)  // Keep this position
            .attr('text-anchor', 'middle')
            .style('font-size', '18px')
            .style('font-weight', 'bold')
            .text('Student Spending Patterns Across Academic Majors');

        svg.append('text')
            .attr('x', this.width / 2)
            .attr('y', 35)  // Keep this position
            .attr('text-anchor', 'middle')
            .style('font-size', '13px')
            .text('Visualizing average monthly spending by category for students in different majors. Larger bubbles indicate higher spending.');

        // Calculate average spending by major
        const majorAverages = d3.rollup(this.data,
            v => ({
                housing: d3.mean(v, d => +d.housing),
                food: d3.mean(v, d => +d.food),
                transportation: d3.mean(v, d => +d.transportation),
                books_supplies: d3.mean(v, d => +d.books_supplies),
                entertainment: d3.mean(v, d => +d.entertainment),
                personal_care: d3.mean(v, d => +d.personal_care),
                technology: d3.mean(v, d => +d.technology),
                health_wellness: d3.mean(v, d => +d.health_wellness),
                miscellaneous: d3.mean(v, d => +d.miscellaneous),
                total: d3.mean(v, d =>
                    +d.housing + +d.food + +d.transportation + +d.books_supplies +
                    +d.entertainment + +d.personal_care + +d.technology +
                    +d.health_wellness + +d.miscellaneous
                )
            }),
            d => d.major
        );

        const categories = [
            'Housing', 'Food', 'Transportation', 'Books & Supplies',
            'Entertainment', 'Personal Care', 'Technology',
            'Health & Wellness', 'Miscellaneous'
        ];
        const majors = ['Computer Science', 'Engineering', 'Economics', 'Biology', 'Psychology'];

        // Create data structure for bubbles with proper key mapping
        const bubbleData = majors.flatMap((major, i) => {
            const data = majorAverages.get(major);
            return categories.map((category, j) => {
                // Create a mapping for the data keys
                const dataKey = category.toLowerCase()
                    .replace(/&/g, '')
                    .replace(/\s+/g, '_')
                    .replace(/_+/g, '_')
                    .trim();

                return {
                    major,
                    category,
                    value: data[dataKey],
                    total: data.total,
                    x: (i * (this.width / 5)) + (this.width / 10),
                    y: this.height / 2 + (j * 20 - categories.length * 10)
                };
            });
        });

        // Scale for bubble size
        const maxValue = d3.max(bubbleData, d => d.value);
        const radiusScale = d3.scaleSqrt()
            .domain([0, maxValue])
            .range([8, 35]);

        // Fixed colors for each category - consistent across visualizations
        const colors = {
            'Housing': '#e53935',          // Red
            'Food': '#43a047',             // Green
            'Transportation': '#1976d2',   // Blue
            'Books & Supplies': '#fbc02d', // Yellow
            'Entertainment': '#ff7f0e',    // Orange
            'Personal Care': '#8e24aa',    // Purple
            'Technology': '#00897b',       // Teal
            'Health & Wellness': '#d81b60',// Pink
            'Miscellaneous': '#795548'     // Brown
        };

        // Create simulation for bubble layout
        const simulation = d3.forceSimulation(bubbleData)
            .force('x', d3.forceX(d => d.x).strength(0.2))
            .force('y', d3.forceY(d => d.y).strength(0.2))
            .force('collide', d3.forceCollide(d => radiusScale(d.value) + 3).strength(0.8))
            .force('charge', d3.forceManyBody().strength(-10));

        simulation.tick(300);

        // Create groups for each major
        const majorGroups = svg.selectAll('.major-group')
            .data(majors)
            .join('g')
            .attr('class', 'major-group');

        // Add major labels - adjusted to be higher in the visualization
        majorGroups.append('text')
            .attr('x', (d, i) => (i * (this.width / 5)) + (this.width / 10))
            .attr('y', 50)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(d => d);

        // Create bubbles
        const bubbles = svg.selectAll('.bubble')
            .data(bubbleData)
            .join('g')
            .attr('class', 'bubble');

        // Add tooltip div to the page (outside of SVG for better formatting)
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #ddd")
            .style("border-radius", "4px")
            .style("padding", "8px")
            .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
            .style("pointer-events", "none")
            .style("font-size", "12px");

        // Add circle for each bubble with enhanced tooltip
        bubbles.append('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => radiusScale(d.value))
            .style('fill', d => colors[d.category])
            .style('stroke', '#fff')
            .style('stroke-width', 1)
            .style('cursor', 'pointer')
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .style('stroke', '#000')
                    .style('stroke-width', 2);

                // Show tooltip with detailed information
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);

                tooltip.html(`
                    <strong>${d.major}</strong><br/>
                    <strong>${d.category}:</strong> $${Math.round(d.value)}<br/>
                    <em>Click for more details</em>
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on('mouseout', function () {
                d3.select(this)
                    .style('stroke', '#fff')
                    .style('stroke-width', 1);

                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on('click', function (event, d) {
                // Show more detailed information on click
                tooltip.html(`
                    <strong>${d.major}</strong><br/>
                    <strong>${d.category}:</strong> $${Math.round(d.value)}<br/>
                    <hr style="margin: 5px 0"/>
                    <strong>Percentage of total:</strong> ${Math.round((d.value / d.total) * 100)}%<br/>
                    <strong>Rank among majors:</strong> ${getRankForCategory(d.category, d.major, bubbleData)}
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            });

        // Helper function to get rank of a major for a specific category
        function getRankForCategory(category, major, data) {
            const categoryData = data.filter(d => d.category === category)
                .sort((a, b) => b.value - a.value);

            const rank = categoryData.findIndex(d => d.major === major) + 1;
            return `${rank} of ${majors.length}`;
        }

        // Add category labels inside bubbles
        bubbles.append('text')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('text-anchor', 'middle')
            .attr('dy', '.3em')
            .style('font-size', '10px')
            .style('fill', '#fff')
            .style('pointer-events', 'none')
            .text(d => d.category.split(' ')[0].charAt(0)); // First letter of first word

        // Create a two-row legend at the bottom
        const legendRowItems = 5; // 5 items in first row, 4 in second
        const itemWidth = 160; // Width per legend item
        const rowHeight = 25; // Height between rows

        const legend = svg.append('g')
            .attr('transform', `translate(${(this.width - (legendRowItems * itemWidth)) / 2}, ${this.height - 70})`);

        categories.forEach((category, i) => {
            // Calculate row and position within row
            const row = Math.floor(i / legendRowItems);
            const col = i % legendRowItems;

            const legendItem = legend.append('g')
                .attr('transform', `translate(${col * itemWidth}, ${row * rowHeight})`);

            legendItem.append('circle')
                .attr('r', 6)
                .attr('fill', colors[category]);

            legendItem.append('text')
                .attr('x', 12)
                .attr('y', 4)
                .style('font-size', '12px')
                .text(category);
        });
    }
}