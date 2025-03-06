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

            // Update the summary text
            updateSummary(userTotal, percentile, stats);
        })
        .catch((error) => {
            console.error("Error loading the CSV file:", error);
            document.getElementById("visualization-container").innerHTML =
                "<div class='alert alert-danger'>Failed to load student spending data. Please try again later.</div>";
        });
}

function updateSummary(userTotal, percentile, stats) {
    const summaryElement = document.getElementById("summary");

    let comparisonText;
    if (percentile < 25) {
        comparisonText = "Your spending is lower than most students.";
    } else if (percentile < 50) {
        comparisonText =
            "Your spending is below average compared to other students.";
    } else if (percentile < 75) {
        comparisonText =
            "Your spending is above average compared to other students.";
    } else {
        comparisonText = "Your spending is higher than most students.";
    }

    summaryElement.innerHTML = `
        <p class="lead">Your total discretionary spending: <strong>$${userTotal.toFixed(
            2
        )}</strong></p>
        <p>You spend more than approximately <strong>${percentile.toFixed(
            0
        )}%</strong> of students.</p>
        <p>${comparisonText}</p>
        <p>The average student spends <strong>$${stats.mean.toFixed(
            2
        )}</strong> on these categories combined.</p>
    `;
}
