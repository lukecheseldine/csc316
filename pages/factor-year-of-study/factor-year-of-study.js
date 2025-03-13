let studentData = [];

function loadDataAndDisplayResults() {
    d3.csv("../../data/student_spending.csv")
        .then((data) => {
            studentData = data;

            // Create and render the visualization
            const container = document.getElementById("visualization-container");
            const visualization = new YearOfStudyVisualization(container, studentData);
            visualization.render();

            // Set up category filtering
            setupCategoryFilters(visualization);
        })
        .catch((error) => {
            console.error("Error loading the CSV file:", error);
            document.getElementById("visualization-container").innerHTML =
                "<div class='alert alert-danger'>Failed to load student data. Please try again later.</div>";
        });
}

function setupCategoryFilters(visualization) {
    const buttons = document.querySelectorAll("#category-buttons button");
    buttons.forEach(button => {
        button.addEventListener("click", function () {
            // Remove active class from all buttons
            buttons.forEach(b => b.classList.remove("active"));
            // Add active class to clicked button
            this.classList.add("active");

            const category = this.getAttribute("data-category");

            // Clear and re-render with the selected category
            document.getElementById("visualization-container").innerHTML = "";
            visualization.render(category);
        });
    });
}

// Load data when the page loads
document.addEventListener("DOMContentLoaded", loadDataAndDisplayResults); 