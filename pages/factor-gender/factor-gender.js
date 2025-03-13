let studentData = [];
let genderVisualization;

function loadDataAndDisplayResults() {
    d3.csv("../../data/student_spending.csv")
        .then((data) => {
            studentData = data;

            // REMOVE UNUSED CONTROLS
            const sortControls = document.querySelector(".sort-controls");
            if (sortControls) {
                sortControls.remove();
            }

            const container = document.getElementById("visualization-container");
            genderVisualization = new GenderVisualization(container, studentData);
            genderVisualization.render();

            // Connect highlight checkboxes to the visualization
            setupHighlightControls();
        })
        .catch((error) => {
            console.error("Error loading the CSV file:", error);
            document.getElementById("visualization-container").innerHTML =
                `<div class="alert alert-danger">Error loading data: ${error.message}</div>`;
        });
}

function setupHighlightControls() {
    // Add event listeners to checkboxes
    document.getElementById("highlight-entertainment").addEventListener("change", updateVisualization);
    document.getElementById("highlight-personal_care").addEventListener("change", updateVisualization);
    document.getElementById("highlight-miscellaneous").addEventListener("change", updateVisualization);
    document.getElementById("show-percentage").addEventListener("change", updateVisualization);
}

function updateVisualization() {
    const highlightedCategories = [];
    if (document.getElementById("highlight-entertainment").checked) {
        highlightedCategories.push("entertainment");
    }
    if (document.getElementById("highlight-personal_care").checked) {
        highlightedCategories.push("personal_care");
    }
    if (document.getElementById("highlight-miscellaneous").checked) {
        highlightedCategories.push("miscellaneous");
    }

    const showPercentage = document.getElementById("show-percentage").checked;

    const container = document.getElementById("visualization-container");
    container.innerHTML = ""; // Clear previous visualization

    genderVisualization = new GenderVisualization(container, studentData);
    genderVisualization.render(highlightedCategories, showPercentage);
}

document.addEventListener("DOMContentLoaded", loadDataAndDisplayResults);
