let studentData = [];
let currentVisualization = null;

function loadDataAndDisplayResults() {
  // Get user input from localStorage
  let userInputData;
  try {
    const storedData = localStorage.getItem("userSpendingData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      userInputData = {
        entertainment: parsedData.entertainment || 0,
        personal_care: parsedData.personal_care || 0,
        miscellaneous: parsedData.miscellaneous || 0,
      };
    } else {
      // If no stored data, use default values
      userInputData = {
        entertainment: 0,
        personal_care: 0,
        miscellaneous: 0,
      };
    }
  } catch (error) {
    console.error("Error parsing stored user data:", error);
    // Use default values if there's an error
    userInputData = {
      entertainment: 0,
      personal_care: 0,
      miscellaneous: 0,
    };
  }

  d3.csv("../../data/student_spending.csv")
    .then((data) => {
      // Convert numeric columns to floats; fallback to 0 if invalid or empty
      data.forEach((d) => {
        // Basic numeric fields you might parse (if you need them):
        d.age = parseFloat(d.age) || 0;
        d.monthly_income = parseFloat(d.monthly_income) || 0;
        d.financial_aid = parseFloat(d.financial_aid) || 0;
        d.tuition = parseFloat(d.tuition) || 0;

        // Calculate disposable income
        d.disposable_income = d.monthly_income - (d.tuition - d.financial_aid);

        // Radar chart spending categories
        d.housing = parseFloat(d.housing) || 0;
        d.food = parseFloat(d.food) || 0;
        d.transportation = parseFloat(d.transportation) || 0;
        d.books_supplies = parseFloat(d.books_supplies) || 0;
        d.entertainment = parseFloat(d.entertainment) || 0;
        d.personal_care = parseFloat(d.personal_care) || 0;
        d.technology = parseFloat(d.technology) || 0;
        d.health_wellness = parseFloat(d.health_wellness) || 0;
        d.miscellaneous = parseFloat(d.miscellaneous) || 0;
      });

      studentData = data;
      setupVisualization(userInputData);
      setupFilterListeners();
    })
    .catch((error) => {
      console.error("Error loading CSV:", error);
      document.getElementById("visualization-container").innerHTML =
        "<div class='alert alert-danger'>Failed to load student data.</div>";
    });
}

function setupVisualization(userInputData) {
  const container = document.getElementById("visualization-container");
  currentVisualization = new RadarVisualization(container, studentData);
  currentVisualization.setUserInputData(userInputData);
  currentVisualization.render();
}

function setupFilterListeners() {
  // Get filter elements
  const genderFilter = document.getElementById("genderFilter");
  const incomeFilter = document.getElementById("incomeFilter");
  const yearFilter = document.getElementById("yearFilter");
  const majorFilter = document.getElementById("majorFilter");
  const averageToggle = document.getElementById("showAverageToggle");

  // Add change event listeners
  const filters = [genderFilter, incomeFilter, yearFilter, majorFilter];
  filters.forEach((filter) => {
    filter.addEventListener("change", updateVisualization);
  });

  // Add change listener for average toggle
  averageToggle.addEventListener("change", (event) => {
    currentVisualization.setShowAverage(event.target.checked);
    currentVisualization.render();
  });
}

function updateVisualization() {
  const gender = document.getElementById("genderFilter").value;
  const income = document.getElementById("incomeFilter").value;
  const year = document.getElementById("yearFilter").value;
  const major = document.getElementById("majorFilter").value;

  // Only apply filters if they're not set to "all"
  const selectedGender = gender !== "all" ? gender : null;
  const selectedYear = year !== "all" ? year : null;
  const selectedMajor = major !== "all" ? major : null;

  // Convert income ranges to numeric thresholds
  let minIncome = null;
  let maxIncome = null;
  if (income !== "all") {
    switch (income) {
      case "0-75":
        minIncome = -Infinity;
        maxIncome = 75;
        break;
      case "75-150":
        minIncome = 75;
        maxIncome = 150;
        break;
      case "150+":
        minIncome = 150;
        maxIncome = Infinity;
        break;
    }
  }

  // Create a custom income filter function
  const incomeFilter =
    minIncome !== null && maxIncome !== null
      ? (disposableIncome) =>
          disposableIncome >= minIncome && disposableIncome <= maxIncome
      : null;

  currentVisualization.setFilters(
    selectedGender,
    incomeFilter,
    selectedYear,
    selectedMajor
  );
  currentVisualization.render();
}

document.addEventListener("DOMContentLoaded", loadDataAndDisplayResults);
