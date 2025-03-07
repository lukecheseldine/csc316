let studentData = [];

function loadDataAndDisplayResults() {
    d3.csv("../../data/student_spending.csv")
        .then((data) => {
            studentData = data.map((d) => {
                // Calculate income: monthly_income - (tuition - financial_aid)
                const income =
                    +d.monthly_income - (+d.tuition - +d.financial_aid);

                // Calculate total discretionary spending
                const discretionarySpending =
                    +d.entertainment + +d.personal_care + +d.miscellaneous;

                return {
                    ...d,
                    income: income,
                    discretionary_spending: discretionarySpending,
                };
            });

            // Create and render the visualization
            const container = document.getElementById(
                "visualization-container"
            );
            const visualization = new IncomeVisualization(
                container,
                studentData
            );
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
