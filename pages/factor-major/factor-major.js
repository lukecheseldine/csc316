let studentData = [];
let majorVisualization;
let currentCategory = "all";
let normalizeData = false;

function loadDataAndDisplayResults() {
    d3.csv("../../data/student_spending.csv")
        .then((data) => {
            studentData = data;

            // Initial render
            renderVisualization();

            // Set up category buttons
            setupCategoryButtons();

            // Set up normalize checkbox
            document.getElementById("normalize-data").addEventListener("change", function () {
                normalizeData = this.checked;
                renderVisualization();
            });
        })
        .catch((error) => {
            console.error("Error loading the CSV file:", error);
            document.getElementById("visualization-container").innerHTML =
                "<div class='alert alert-danger'>Failed to load student data. Please try again later.</div>";
        });
}

function setupCategoryButtons() {
    const buttons = document.querySelectorAll("[data-category]");

    buttons.forEach(button => {
        button.addEventListener("click", function () {
            // Update active state
            buttons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            // Update current category
            currentCategory = this.getAttribute("data-category");

            // Re-render visualization
            renderVisualization();
        });
    });
}

function renderVisualization() {
    const container = document.getElementById("visualization-container");
    container.innerHTML = ""; // Clear previous visualization

    majorVisualization = new MajorVisualization(container, studentData);
    majorVisualization.render(currentCategory, normalizeData);
}

document.addEventListener("DOMContentLoaded", loadDataAndDisplayResults); 