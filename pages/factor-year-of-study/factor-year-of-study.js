let studentData = [];

function loadDataAndDisplayResults() {
    d3.csv("../../data/student_spending.csv")
        .then((data) => {
            studentData = data;

            // Create and render the visualization
            const container = document.getElementById("visualization-container");
            const visualization = new YearOfStudyVisualization(container, studentData);
            visualization.render();
        })
        .catch((error) => {
            console.error("Error loading the CSV file:", error);
            document.getElementById("visualization-container").innerHTML =
                "<div class='alert alert-danger'>Failed to load student data. Please try again later.</div>";
        });
}

// Load data when the page loads
document.addEventListener("DOMContentLoaded", loadDataAndDisplayResults); 