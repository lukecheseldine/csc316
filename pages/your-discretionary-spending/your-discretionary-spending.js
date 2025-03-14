document.addEventListener("DOMContentLoaded", function () {
    // Load the CSV data and display results
    loadDataAndDisplayResults();
});

let studentData = [];

function loadDataAndDisplayResults() {
    // Get user spending values from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const entertainment = parseFloat(urlParams.get("entertainment")) || 0;
    const personalCare = parseFloat(urlParams.get("personal-care")) || 0;
    const miscellaneous = parseFloat(urlParams.get("miscellaneous")) || 0;

    // Calculate total
    const userTotal = entertainment + personalCare + miscellaneous;

    // Load student data and create visualization
    d3.csv("../../data/student_spending.csv")
        .then((data) => {
            studentData = data.map((d) => ({
                entertainment: +d.entertainment,
                personal_care: +d.personal_care,
                miscellaneous: +d.miscellaneous,
            }));

            // Create and render the box plot
            const boxPlotContainer = document.getElementById(
                "visualization-container"
            );
            boxPlotContainer.innerHTML = ""; // Clear previous visualization

            const boxPlot = new BoxPlotVisualization(
                boxPlotContainer,
                studentData,
                userTotal
            );

            // Render the visualization and get the stats and percentile
            const { stats, percentile } = boxPlot.render();

            // Apply animations to the visualization elements
            animateVisualization();

            // Update the summary text with animation
            updateSummary(userTotal, percentile, stats);
        })
        .catch((error) => {
            console.error("Error loading the CSV file:", error);
            document.getElementById("visualization-container").innerHTML =
                "<div class='alert alert-danger'>Failed to load student spending data. Please try again later.</div>";
        });
}

function animateVisualization() {
    // Animate the box plot elements using D3 transitions

    // 1. Box animation - start flat and expand
    const boxElement = d3.select(".box");

    // Store original values before changing them
    const originalY = parseFloat(boxElement.attr("y"));
    const originalHeight = parseFloat(boxElement.attr("height"));

    // Now animate from flat to full height
    boxElement
        .attr("data-original-y", originalY) // Store original y as a data attribute
        .attr("data-original-height", originalHeight) // Store original height
        .attr("height", 0) // Start with height 0
        .attr("y", originalY + originalHeight) // Position at the bottom of where the box should be
        .transition()
        .duration(800)
        .delay(200)
        .attr("y", originalY) // Return to original y position
        .attr("height", originalHeight); // Return to original height

    // 2. Animate the median line
    d3.select(".median-line")
        .attr("stroke-dasharray", "100")
        .attr("stroke-dashoffset", "100")
        .transition()
        .duration(800)
        .delay(400)
        .attr("stroke-dashoffset", "0");

    // 3. Animate the whiskers
    d3.selectAll(".whisker")
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay((d, i) => 500 + i * 100)
        .attr("opacity", 1);

    // 4. Animate the user's spending marker
    d3.select(".your-spending")
        .attr("opacity", 0)
        .attr("transform", function () {
            const currentTransform = this.getAttribute("transform");
            return currentTransform + " scale(0.1)";
        })
        .transition()
        .duration(1000)
        .delay(1000)
        .attr("opacity", 1)
        .attr("transform", function () {
            return this.getAttribute("transform").replace(" scale(0.1)", "");
        });

    // 5. Animate the legend items
    d3.selectAll(".legend-item")
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay((d, i) => 1200 + i * 100)
        .attr("opacity", 1);
}

function updateSummary(userTotal, percentile, stats) {
    const summaryElement = document.getElementById("summary");
    summaryElement.className = "text-center fade-in"; // Add fade-in class

    let comparisonText;
    if (percentile < 25) {
        comparisonText = "Your monthly spending is lower than most students.";
    } else if (percentile < 50) {
        comparisonText =
            "Your monthly spending is below average compared to other students.";
    } else if (percentile < 75) {
        comparisonText =
            "Your monthly spending is above average compared to other students.";
    } else {
        comparisonText = "Your monthly spending is higher than most students.";
    }

    summaryElement.innerHTML = `
        <p class="lead slide-in">Your total monthly discretionary spending: <strong>$${userTotal.toFixed(
            2
        )}</strong></p>
        <p class="slide-in">You spend more than approximately <strong>${percentile.toFixed(
            0
        )}%</strong> of students monthly.</p>
        <p class="slide-in">${comparisonText}</p>
        <p class="slide-in">The average student spends <strong>$${stats.mean.toFixed(
            2
        )}</strong> monthly on these categories combined.</p>
    `;

    // Animate the summary text elements
    const summaryItems = summaryElement.querySelectorAll(".slide-in");
    setTimeout(() => {
        summaryElement.classList.add("visible");

        // Stagger animations for each paragraph
        summaryItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add("visible");
            }, 300 * index);
        });
    }, 1500); // Start after the visualization animation
}
