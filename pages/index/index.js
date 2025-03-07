document.addEventListener("DOMContentLoaded", function () {
  // Clear previously visited factors when landing on the index page
  clearVisitedFactors();

  // Load the CSV data when the page loads
  loadData();

  // Set up form submission handler
  document
    .getElementById("spending-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      compareSpending();
    });
});

let studentData = [];

// Function to clear visited factors
function clearVisitedFactors() {
  // Get all keys from localStorage
  const keys = Object.keys(localStorage);

  // Filter for keys that start with "visited_factor"
  const visitedFactorKeys = keys.filter((key) => key.startsWith("visited_"));

  // Remove each visited factor key
  visitedFactorKeys.forEach((key) => {
    localStorage.removeItem(key);
  });

  // Also clear the factorsPageVisited flag so animation plays again
  localStorage.removeItem("factorsPageVisited");
}

function loadData() {
  d3.csv("../../data/student_spending.csv")
    .then((data) => {
      studentData = data.map((d) => ({
        entertainment: +d.entertainment,
        personal_care: +d.personal_care,
        miscellaneous: +d.miscellaneous,
      }));
    })
    .catch((error) => {
      console.error("Error loading the CSV file:", error);
      alert("Failed to load student spending data. Please try again later.");
    });
}

function compareSpending() {
  // Get user input values
  const entertainment =
    parseFloat(document.getElementById("entertainment").value) || 0;
  const personalCare =
    parseFloat(document.getElementById("personal-care").value) || 0;
  const miscellaneous =
    parseFloat(document.getElementById("miscellaneous").value) || 0;

  // Store the values in localStorage
  const userInputData = {
    entertainment: entertainment,
    personal_care: personalCare,
    miscellaneous: miscellaneous,
  };
  localStorage.setItem("userSpendingData", JSON.stringify(userInputData));

  // Redirect to the results page with parameters
  window.location.href = `/pages/your-discretionary-spending/your-discretionary-spending.html?entertainment=${entertainment}&personal-care=${personalCare}&miscellaneous=${miscellaneous}`;
}
