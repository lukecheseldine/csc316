document.addEventListener("DOMContentLoaded", function () {
    // Get all elements that need to fade in
    const factor1 = document.getElementById("factor1");
    const factor2 = document.getElementById("factor2");
    const factor3 = document.getElementById("factor3");
    const factor4 = document.getElementById("factor4");
    const continueText = document.getElementById("continue");

    // Check if this is the first visit
    const isFirstVisit = !localStorage.getItem("factorsPageVisited");

    // Mark visited factors
    markVisitedFactors();

    if (isFirstVisit) {
        // First visit - animate factors sequentially
        localStorage.setItem("factorsPageVisited", "true");

        // Set up the timing for each element to fade in
        setTimeout(() => {
            factor1.classList.add("visible");
        }, 1000);

        setTimeout(() => {
            factor2.classList.add("visible");
        }, 2000);

        setTimeout(() => {
            factor3.classList.add("visible");
        }, 3000);

        setTimeout(() => {
            factor4.classList.add("visible");
        }, 4000);

        // The continue text fades in after 5 seconds
        setTimeout(() => {
            continueText.classList.add("visible");
        }, 5000);
    } else {
        // Not first visit - show all factors immediately
        factor1.classList.add("visible");
        factor2.classList.add("visible");
        factor3.classList.add("visible");
        factor4.classList.add("visible");
        continueText.classList.add("visible");
    }

    // Add event listeners to track visited factors
    const factorLinks = document.querySelectorAll(".fade-in a");
    factorLinks.forEach((link) => {
        link.addEventListener("click", function () {
            const href = this.getAttribute("href");
            const factorKey = href.split("/").pop().replace(".html", "");
            localStorage.setItem(`visited_${factorKey}`, "true");
        });
    });
});

// Function to mark visited factors
function markVisitedFactors() {
    const factorLinks = document.querySelectorAll(".fade-in a");

    factorLinks.forEach((link) => {
        const href = link.getAttribute("href");
        const factorKey = href.split("/").pop().replace(".html", "");

        if (localStorage.getItem(`visited_${factorKey}`)) {
            const card = link.querySelector(".card");
            card.classList.add("visited");
        }
    });
}
