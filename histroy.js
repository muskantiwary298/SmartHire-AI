document.addEventListener("DOMContentLoaded", () => {

    const historyList = document.getElementById("historyList");

    if (!historyList) return;

    const history = JSON.parse(
        localStorage.getItem("smartHireHistory") || "[]"
    );

    // Statistics

    const total = history.length;

    const average = total
        ? Math.round(
            history.reduce((sum, item) => sum + item.score, 0) / total
        )
        : 0;

    const best = total
        ? Math.max(...history.map(item => item.score))
        : 0;

    document.getElementById("totalCount").textContent = total;

    document.getElementById("averageScore").textContent = average;

    document.getElementById("bestScore").textContent = best;

    // Empty history

    if (total === 0) {

        const empty = document.createElement("div");

        empty.className = "history-empty";

        const heading = document.createElement("h3");
        heading.textContent = "No Analysis Found";

        const paragraph = document.createElement("p");
        paragraph.textContent = "Upload your first resume to see your reports here.";

        const link = document.createElement("a");
        link.href = "analyzer.html";
        link.className = "primary-btn";
        link.textContent = "Analyze Resume";

        empty.append(heading, paragraph, link);

        historyList.appendChild(empty);

    } else {

        history.forEach(item => {

            const card = document.createElement("div");
            card.className = "history-item";

            const details = document.createElement("div");

            const name = document.createElement("h3");
            name.textContent = item.name;

            const role = document.createElement("p");
            role.textContent = item.jobRole;

            const date = document.createElement("p");
            date.textContent = item.date;

            details.append(name, role, date);

            const score = document.createElement("div");
            score.className = "history-score";
            score.textContent = item.score + "/100";

            card.append(details, score);

            historyList.appendChild(card);

        });

    }

    // Clear History

    document.getElementById("clearHistory").addEventListener(
        "click",
        () => {

            if (history.length === 0) {
                alert("No history to clear.");
                return;
            }

            const confirmDelete = confirm(
                "Are you sure you want to delete all analysis history?"
            );

            if (confirmDelete) {

                localStorage.removeItem("smartHireHistory");

                location.reload();

            }

        }
    );

});