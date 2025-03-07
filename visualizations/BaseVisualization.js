class BaseVisualization {
  constructor(container, data) {
    this.container = container;
    this.data = data;
    this.margin = { top: 40, right: 30, bottom: 50, left: 80 };
    this.width = container.clientWidth - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  createSvg() {
    return d3
      .select(this.container)
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
  }

  addAxes(svg, xScale, yScale, xLabel, yLabel) {
    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${this.height})`)
      .call(d3.axisBottom(xScale));

    // Add Y axis
    svg.append("g").call(d3.axisLeft(yScale));

    // Add X axis label
    svg
      .append("text")
      .attr("x", this.width / 2)
      .attr("y", this.height + 40)
      .style("text-anchor", "middle")
      .attr("class", "axis-label")
      .text(xLabel);

    // Add Y axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -this.margin.left + 15)
      .attr("x", -this.height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .attr("class", "axis-label")
      .text(yLabel);
  }
}
