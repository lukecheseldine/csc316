class GenderVisualization extends BaseVisualization {
    render() {
        const svg = this.createSvg();

        svg.append('text')
            .attr('x', this.width / 2)
            .attr('y', 15)
            .attr('text-anchor', 'middle')
            .style('font-size', '18px')
            .style('font-weight', 'bold')
            .text('Student Spending Patterns by Gender');

        svg.append('text')
            .attr('x', this.width / 2)
            .attr('y', 35)
            .attr('text-anchor', 'middle')
            .style('font-size', '13px')
            .text('Visualizing average monthly spending by category for male and female students. Larger bubbles indicate higher spending.');

        const categories = [
            'Housing', 'Food', 'Transportation', 'Books & Supplies',
            'Entertainment', 'Personal Care', 'Technology',
            'Health & Wellness', 'Miscellaneous'
        ];
        const genders = ['Male', 'Female', 'Non-binary'];

        const genderAverages = d3.rollup(this.data,
            v => categories.reduce((acc, category) => {
                const dataKey = category.toLowerCase()
                    .replace(/&/g, '')
                    .replace(/\s+/g, '_')
                    .replace(/_+/g, '_')
                    .trim();
                acc[dataKey] = d3.mean(v, d => +d[dataKey]);
                return acc;
            }, {
                total: d3.mean(v, d => categories.reduce((sum, category) => {
                    const dataKey = category.toLowerCase()
                        .replace(/&/g, '')
                        .replace(/\s+/g, '_')
                        .replace(/_+/g, '_')
                        .trim();
                    return sum + +d[dataKey];
                }, 0))
            }),
            d => d.gender
        );

        const bubbleData = genders.flatMap((gender, i) => {
            const data = genderAverages.get(gender);
            return categories.map((category, j) => {
                const dataKey = category.toLowerCase()
                    .replace(/&/g, '')
                    .replace(/\s+/g, '_')
                    .replace(/_+/g, '_')
                    .trim();
                return {
                    gender,
                    category,
                    value: data[dataKey],
                    total: data.total,
                    x: (i * (this.width / 3)) + (this.width / 6),
                    y: this.height / 2 + (j * 20 - categories.length * 10)
                };
            });
        });

        const maxValue = d3.max(bubbleData, d => d.value);
        const radiusScale = d3.scaleSqrt()
            .domain([0, maxValue])
            .range([8, 35]);

        const colors = {
            'Housing': '#e53935',
            'Food': '#43a047',
            'Transportation': '#1976d2',
            'Books & Supplies': '#fbc02d',
            'Entertainment': '#ff7f0e',
            'Personal Care': '#8e24aa',
            'Technology': '#00897b',
            'Health & Wellness': '#d81b60',
            'Miscellaneous': '#795548'
        };

        const simulation = d3.forceSimulation(bubbleData)
            .force('x', d3.forceX(d => d.x).strength(0.2))
            .force('y', d3.forceY(d => d.y).strength(0.2))
            .force('collide', d3.forceCollide(d => radiusScale(d.value) + 3).strength(0.8))
            .force('charge', d3.forceManyBody().strength(-10));

        simulation.tick(300);

        const genderGroups = svg.selectAll('.gender-group')
            .data(genders)
            .join('g')
            .attr('class', 'gender-group');

        genderGroups.append('text')
            .attr('x', (d, i) => (i * (this.width / 3)) + (this.width / 6))
            .attr('y', 50)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(d => d);

        const bubbles = svg.selectAll('.bubble')
            .data(bubbleData)
            .join('g')
            .attr('class', 'bubble');

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

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);

                tooltip.html(`
                    <strong>${d.gender}</strong><br/>
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
                tooltip.html(`
                    <strong>${d.gender}</strong><br/>
                    <strong>${d.category}:</strong> $${Math.round(d.value)}<br/>
                    <hr style="margin: 5px 0"/>
                    <strong>Percentage of total:</strong> ${Math.round((d.value / d.total) * 100)}%<br/>
                    <strong>Rank between genders:</strong> ${getRankForCategory(d.category, d.gender, bubbleData)}
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            });

        // Helper function to get rank between genders for a specific category
        function getRankForCategory(category, gender, data) {
            const categoryData = data.filter(d => d.category === category)
                .sort((a, b) => b.value - a.value);

            const rank = categoryData.findIndex(d => d.gender === gender) + 1;
            return `${rank} of ${genders.length}`;
        }

        // Add tooltip div (add this near the start of render method, before creating bubbles)
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

        bubbles.append('text')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('text-anchor', 'middle')
            .attr('dy', '.3em')
            .style('font-size', '10px')
            .style('fill', '#fff')
            .text(d => d.category.split(' ')[0].charAt(0));

        // Add legend at the bottom
        const legendRowItems = 5;
        const itemWidth = 160;
        const rowHeight = 25;

        const legend = svg.append('g')
            .attr('transform', `translate(${(this.width - (legendRowItems * itemWidth)) / 2}, ${this.height - 70})`);

        categories.forEach((category, i) => {
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