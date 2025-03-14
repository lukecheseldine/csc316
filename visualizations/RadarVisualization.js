class RadarVisualization extends BaseVisualization {
  constructor(container, data) {
    super(container, data);

    // Set container positioning
    d3.select(container).style("position", "relative");

    this.categories = [
      "housing",
      "food",
      "transportation",
      "books_supplies",
      "entertainment",
      "personal_care",
      "technology",
      "health_wellness",
      "miscellaneous",
    ];

    // Categories that have student input
    this.studentCategories = [
      "entertainment",
      "personal_care",
      "miscellaneous",
    ];

    // The filters we'll allow
    this.selectedGender = null;
    this.incomeFilter = null;
    this.selectedYearInSchool = null;
    this.selectedMajor = null;

    // Initialize user input data
    this.userInputData = null;

    // Initialize show average flag
    this.showAverage = true;

    // Remove any existing tooltips
    d3.selectAll(".radar-tooltip").remove();

    // Create tooltip div
    this.tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "radar-tooltip")
      .style("opacity", 0)
      .style("position", "fixed")
      .style("background", "white")
      .style("padding", "10px")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("font-size", "12px")
      .style("z-index", "9999");
  }

  /**
   * Set filters from outside if you have dropdowns, etc.
   */
  setFilters(gender, incomeFilter, yearInSchool, major) {
    this.selectedGender = gender;
    this.incomeFilter = incomeFilter;
    this.selectedYearInSchool = yearInSchool;
    this.selectedMajor = major;
  }

  /**
   * Set user input data from the form
   */
  setUserInputData(userData) {
    this.userInputData = userData;
  }

  /**
   * Set whether to show average spending
   */
  setShowAverage(show) {
    this.showAverage = show;
  }

  /**
   * Format category names into human-readable labels
   */
  formatCategoryName(category) {
    // Provide more human-readable and descriptive category names
    const categoryMapping = {
      entertainment: "Entertainment & Leisure",
      personal_care: "Personal Care & Grooming",
      miscellaneous: "Miscellaneous Expenses",
      food: "Food & Dining",
      transportation: "Transportation",
      books_supplies: "Books & Academic Supplies",
      technology: "Technology",
      health_wellness: "Health & Wellness",
      housing: "Housing & Accommodation",
      tuition: "Tuition & Fees",
    };

    // Return the mapped category name if it exists, otherwise use the default formatting
    if (categoryMapping[category]) {
      return categoryMapping[category];
    }

    // Default formatting (fallback): Convert category name to title case and replace underscores with spaces
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Helper function to format currency values
  formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  render() {
    d3.select(this.container).selectAll("svg").remove();
    const svg = this.createSvg();

    const zoomGroup = svg
      .append("g")
      .attr("class", "zoom-container")
      .attr("transform", `translate(${this.width / 2}, ${this.height / 2})`);

    // Create the radar group
    const radarGroup = zoomGroup.append("g");

    // Keep track of the current transform
    let currentTransform = { x: 0, y: 0, k: 1 };

    // Add drag behavior
    const drag = d3
      .drag()
      .on("start", function () {
        d3.select(this).style("cursor", "grabbing");
      })
      .on("drag", (event) => {
        currentTransform.x += event.dx;
        currentTransform.y += event.dy;
        zoomGroup.attr(
          "transform",
          `translate(${this.width / 2 + currentTransform.x}, ${
            this.height / 2 + currentTransform.y
          }) scale(${currentTransform.k})`
        );
      })
      .on("end", function () {
        d3.select(this).style("cursor", "grab");
      });

    // Add zoom behavior for scaling only
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        currentTransform.k = event.transform.k;
        zoomGroup.attr(
          "transform",
          `translate(${this.width / 2 + currentTransform.x}, ${
            this.height / 2 + currentTransform.y
          }) scale(${currentTransform.k})`
        );
      });

    // Apply both behaviors to SVG
    svg.call(drag).call(zoom).style("cursor", "grab");

    // Add zoom controls (keep them fixed, outside the zoom group)
    const zoomControls = svg
      .append("g")
      .attr("class", "zoom-controls")
      .attr("transform", "translate(20, 20)");

    // Zoom in button
    const zoomIn = zoomControls
      .append("g")
      .attr("class", "zoom-button")
      .style("cursor", "pointer");

    zoomIn
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 30)
      .attr("height", 30)
      .attr("fill", "white")
      .attr("stroke", "#999");

    zoomIn
      .append("text")
      .attr("x", 15)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .text("+");

    // Zoom out button
    const zoomOut = zoomControls
      .append("g")
      .attr("class", "zoom-button")
      .attr("transform", "translate(0, 40)")
      .style("cursor", "pointer");

    zoomOut
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 30)
      .attr("height", 30)
      .attr("fill", "white")
      .attr("stroke", "#999");

    zoomOut
      .append("text")
      .attr("x", 15)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .text("−");

    // Add click handlers for zoom buttons
    zoomIn.on("click", () => {
      svg.transition().duration(300).call(zoom.scaleBy, 1.3);
    });

    zoomOut.on("click", () => {
      svg.transition().duration(300).call(zoom.scaleBy, 0.7);
    });

    // Reset button
    const resetZoom = zoomControls
      .append("g")
      .attr("class", "zoom-button")
      .attr("transform", "translate(0, 80)")
      .style("cursor", "pointer");

    resetZoom
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 30)
      .attr("height", 30)
      .attr("fill", "white")
      .attr("stroke", "#999");

    resetZoom
      .append("text")
      .attr("x", 15)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("R");

    resetZoom.on("click", () => {
      // Reset all transforms
      currentTransform = { x: 0, y: 0, k: 1 };

      // Reset zoom transform
      svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity);

      // Reset position with animation
      zoomGroup
        .transition()
        .duration(300)
        .attr(
          "transform",
          `translate(${this.width / 2}, ${this.height / 2}) scale(1)`
        );
    });

    let filteredData = this.data;

    // Filter by gender
    if (this.selectedGender) {
      filteredData = filteredData.filter(
        (d) => d.gender === this.selectedGender
      );
    }

    // Filter by income using the filter function
    if (this.incomeFilter) {
      filteredData = filteredData.filter((d) =>
        this.incomeFilter(d.disposable_income)
      );
    }

    // Filter by year in school
    if (this.selectedYearInSchool) {
      filteredData = filteredData.filter(
        (d) => d.year_in_school === this.selectedYearInSchool
      );
    }

    // Filter by major
    if (this.selectedMajor) {
      filteredData = filteredData.filter((d) => d.major === this.selectedMajor);
    }

    //  If empty after filtering, show message
    if (filteredData.length === 0) {
      radarGroup
        .append("text")
        .text("No data available for the selected filters.")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("x", 0)
        .attr("y", 0)
        .style("font-size", "16px");
      return;
    }

    // "Student row" - use user input if available, otherwise use first row
    const studentRow = this.userInputData;

    // Compute average spending across the subset
    const averages = {};
    this.categories.forEach((cat) => {
      const vals = filteredData.map((d) => d[cat]);
      const avg = d3.mean(vals);
      averages[cat] = avg || 0;
    });

    const studentSpending = this.studentCategories.map((cat) => ({
      category: cat,
      value: studentRow[cat],
    }));
    const averageSpending = this.categories.map((cat) => ({
      category: cat,
      value: averages[cat],
    }));
    const radarData = this.showAverage
      ? [studentSpending, averageSpending]
      : [studentSpending];

    //  Scales
    const maxValue = d3.max(radarData.flat(), (d) => d.value) || 1;
    const radius = Math.min(this.width, this.height) / 2;
    const rScale = d3.scaleLinear().range([0, radius]).domain([0, maxValue]);

    // angle for each category
    const angleSlice = (Math.PI * 2) / this.categories.length;

    //  Draw an axis line + label for each category
    this.categories.forEach((cat, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x2 = rScale(maxValue) * Math.cos(angle);
      const y2 = rScale(maxValue) * Math.sin(angle);

      // axis line
      radarGroup
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "#999");

      // axis label
      radarGroup
        .append("text")
        .attr("x", x2 * 1.1)
        .attr("y", y2 * 1.1)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(this.formatCategoryName(cat))
        .style("font-size", "10px");
    });

    // Optional radial "grid" circles
    const levels = 5;
    d3.range(1, levels + 1).forEach((level) => {
      const r = (radius / levels) * level;
      radarGroup
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "#ccc");
    });

    //  Radar polygons
    radarData.forEach((series, idx) => {
      const color = idx === 0 ? "steelblue" : "orange";
      const label = idx === 0 ? "Student" : "Average";
      const categories = idx === 0 ? this.studentCategories : this.categories;

      // Radar area with tooltip
      const points = categories.map((cat, i) => {
        const angle = this.categories.indexOf(cat) * angleSlice - Math.PI / 2;
        return {
          x:
            rScale(series.find((d) => d.category === cat).value) *
            Math.cos(angle),
          y:
            rScale(series.find((d) => d.category === cat).value) *
            Math.sin(angle),
        };
      });

      // Create the path
      radarGroup
        .append("path")
        .attr("fill", color)
        .attr("fill-opacity", 0.3)
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("d", `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")} Z`)
        .on("mouseover", (event) => {
          this.tooltip
            .style("opacity", 1)
            .html(
              `<strong>${label} Spending</strong><br/>` +
                series
                  .map(
                    (d) =>
                      `${this.formatCategoryName(
                        d.category
                      )}: ${this.formatCurrency(d.value)}`
                  )
                  .join("<br/>")
            )
            .style("left", event.clientX + 10 + "px")
            .style("top", event.clientY + 10 + "px");
        })
        .on("mousemove", (event) => {
          this.tooltip
            .style("left", event.clientX + 10 + "px")
            .style("top", event.clientY + 10 + "px");
        })
        .on("mouseout", () => {
          this.tooltip.style("opacity", 0);
        });

      // Points with tooltips
      radarGroup
        .selectAll(`.radar-circle-${idx}`)
        .data(series)
        .enter()
        .append("circle")
        .attr("class", `radar-circle-${idx}`)
        .attr("r", 4)
        .attr("cx", (d) => {
          const angle =
            this.categories.indexOf(d.category) * angleSlice - Math.PI / 2;
          return rScale(d.value) * Math.cos(angle);
        })
        .attr("cy", (d) => {
          const angle =
            this.categories.indexOf(d.category) * angleSlice - Math.PI / 2;
          return rScale(d.value) * Math.sin(angle);
        })
        .attr("fill", color)
        .attr("fill-opacity", 0.7)
        .on("mouseover", (event, d) => {
          this.tooltip
            .style("opacity", 1)
            .html(
              `<strong>${label}</strong><br/>${this.formatCategoryName(
                d.category
              )}: ${this.formatCurrency(d.value)}`
            )
            .style("left", event.clientX + 10 + "px")
            .style("top", event.clientY + 10 + "px");
        })
        .on("mousemove", (event) => {
          this.tooltip
            .style("left", event.clientX + 10 + "px")
            .style("top", event.clientY + 10 + "px");
        })
        .on("mouseout", () => {
          this.tooltip.style("opacity", 0);
        });
    });

    const legendGroup = svg
      .append("g")
      .attr(
        "transform",
        `translate(${this.width / 2 - 60}, ${this.height + 30})`
      );

    const legendLabels = this.showAverage
      ? ["Student", "Average"]
      : ["Student"];
    legendLabels.forEach((label, i) => {
      const row = legendGroup
        .append("g")
        .attr("transform", `translate(${i * 100}, 0)`);

      row
        .append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", i === 0 ? "steelblue" : "orange")
        .attr("opacity", 0.7);

      row.append("text").attr("x", 18).attr("y", 11).text(label);
    });
  }
}
