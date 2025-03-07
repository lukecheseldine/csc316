document.addEventListener("DOMContentLoaded", function () {
  // Get user spending data from localStorage
  const userSpendingData = JSON.parse(localStorage.getItem("userSpendingData"));
  if (!userSpendingData) {
    displayMessage(
      "No spending data available. Please input your spending first."
    );
    return;
  }

  // Load the CSV data to get averages
  d3.csv("../../data/student_spending.csv")
    .then((data) => {
      // Calculate averages for the categories we have user data for
      const categories = ["entertainment", "personal_care", "miscellaneous"];
      const averages = {};

      categories.forEach((category) => {
        const values = data.map((d) => parseFloat(d[category]) || 0);
        averages[category] = d3.mean(values) || 0;
      });

      // Calculate differences
      const differences = categories.map((category) => ({
        category: category,
        difference: userSpendingData[category] - averages[category],
        userAmount: userSpendingData[category],
        averageAmount: averages[category],
      }));

      // Find the category with the largest absolute difference
      const biggestDifference = differences.reduce((prev, current) => {
        return Math.abs(current.difference) > Math.abs(prev.difference)
          ? current
          : prev;
      });

      // Format the currency difference and average amount
      const formattedDifference = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Math.abs(biggestDifference.difference));

      const formattedAverage = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(biggestDifference.averageAmount);

      // Calculate the multiplier (how many times more/less than average)
      const multiplier =
        biggestDifference.userAmount / biggestDifference.averageAmount;
      const formattedMultiplier = multiplier.toFixed(1);

      // Create the message with the absolute difference, average amount, and the multiplier
      let message = `Your spending in ${formatCategoryName(
        biggestDifference.category
      )} is ${formattedDifference} ${
        biggestDifference.difference > 0 ? "more" : "less"
      } than the average. The average student spends ${formattedAverage} on ${formatCategoryName(
        biggestDifference.category
      )}. `;

      if (biggestDifference.averageAmount === 0) {
        message = "There is no average spending data available for comparison.";
      } else if (multiplier > 1) {
        message += `That is ${formattedMultiplier}x more than the average spend in ${formatCategoryName(
          biggestDifference.category
        )}.`;
      } else {
        message += `That is ${formattedMultiplier}x of the average spend in ${formatCategoryName(
          biggestDifference.category
        )}.`;
      }

      displayMessage(message);
    })
    .catch((error) => {
      console.error("Error loading data:", error);
      displayMessage("Error loading spending data. Please try again later.");
    });
});

function displayMessage(message) {
  document.getElementById("summary-message").textContent = message;
}

function formatCategoryName(category) {
  // Convert category name to title case and replace underscores with spaces
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
