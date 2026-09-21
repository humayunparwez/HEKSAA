document.addEventListener("DOMContentLoaded", function () {

    const form = document.querySelector(".checkin-card form");
    const successMessage = document.getElementById("success-message");

    const statusMood = document.getElementById("status-mood");
    const statusStress = document.getElementById("status-stress");
    const statusAnxiety = document.getElementById("status-anxiety");
    const overallStatus = document.getElementById("overall-status");

    const historyContainer =
        document.getElementById("checkin-history");


    if (!form) {
        return;
    }


    /* =========================
       Format Values
    ========================= */

    function formatValue(value) {

        return value
            .replace(/-/g, " ")
            .replace(/\b\w/g, function (letter) {
                return letter.toUpperCase();
            });

    }


    /* =========================
       Calculate Overall Status
    ========================= */

    function calculateOverallStatus(
        mood,
        stress,
        anxiety
    ) {

        const moodScore = {

            "very-happy": 0,
            "happy": 1,
            "neutral": 2,
            "sad": 3,
            "very-sad": 4

        };


        const levelScore = {

            "low": 0,
            "moderate": 1,
            "high": 2,
            "very-high": 3

        };


        const totalScore =
            moodScore[mood] +
            levelScore[stress] +
            levelScore[anxiety];


        const averageScore =
            totalScore / 3;


        if (averageScore <= 1) {

            return "Low Concern";

        }


        if (averageScore <= 2) {

            return "Moderate Concern";

        }


        return "High Concern";

    }


    /* =========================
       Apply Status Color
    ========================= */

    function applyStatusClass(
        element,
        result
    ) {

        if (!element) {
            return;
        }


        element.classList.remove(
            "status-low",
            "status-moderate",
            "status-high"
        );


        if (result === "Low Concern") {

            element.classList.add(
                "status-low"
            );

        }

        else if (result === "Moderate Concern") {

            element.classList.add(
                "status-moderate"
            );

        }

        else {

            element.classList.add(
                "status-high"
            );

        }

    }


    /* =========================
       Get Saved History
    ========================= */

    function getHistory() {

        const savedHistory =
            localStorage.getItem(
                "heksaaCheckinHistory"
            );


        if (!savedHistory) {

            return [];

        }


        try {

            return JSON.parse(
                savedHistory
            );

        }

        catch (error) {

            return [];

        }

    }


    /* =========================
       Save History
    ========================= */

    function saveHistory(history) {

        localStorage.setItem(
            "heksaaCheckinHistory",
            JSON.stringify(history)
        );

    }


    /* =========================
       Display History
    ========================= */

    function displayHistory() {

        if (!historyContainer) {
            return;
        }


        const history =
            getHistory();


        if (history.length === 0) {

            historyContainer.innerHTML = `
                <p class="no-history">
                    No previous check-ins available.
                </p>
            `;

            return;

        }


        historyContainer.innerHTML = "";


        history.forEach(function (item) {

            const historyItem =
                document.createElement("div");


            historyItem.className =
                "history-item";


            const date =
                new Date(item.date);


            const formattedDate =
                date.toLocaleString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );


            historyItem.innerHTML = `

                <div class="history-date">
                    ${formattedDate}
                </div>

                <div class="history-row">

                    <span>
                        Mood
                    </span>

                    <strong>
                        ${formatValue(item.mood)}
                    </strong>

                </div>


                <div class="history-row">

                    <span>
                        Stress
                    </span>

                    <strong>
                        ${formatValue(item.stress)}
                    </strong>

                </div>


                <div class="history-row">

                    <span>
                        Anxiety
                    </span>

                    <strong>
                        ${formatValue(item.anxiety)}
                    </strong>

                </div>


                <span class="history-status">
                    ${item.overallStatus}
                </span>

            `;


            const historyStatus =
                historyItem.querySelector(
                    ".history-status"
                );


            applyStatusClass(
                historyStatus,
                item.overallStatus
            );


            historyContainer.appendChild(
                historyItem
            );

        });

    }


    /* =========================
       Submit Check-in
    ========================= */

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const mood =
                document.getElementById(
                    "mood"
                ).value;


            const stress =
                document.getElementById(
                    "stress"
                ).value;


            const anxiety =
                document.getElementById(
                    "anxiety"
                ).value;


            /* Validate */

            if (
                !mood ||
                !stress ||
                !anxiety
            ) {

                alert(
                    "Please complete all the questions before submitting."
                );

                return;

            }


            /* Calculate Overall Status */

            const result =
                calculateOverallStatus(
                    mood,
                    stress,
                    anxiety
                );


            /* Show Success Message */

            if (successMessage) {

                successMessage.style.display =
                    "block";

            }


            /* Update Mood */

            if (statusMood) {

                statusMood.textContent =
                    formatValue(mood);

            }


            /* Update Stress */

            if (statusStress) {

                statusStress.textContent =
                    formatValue(stress);

            }


            /* Update Anxiety */

            if (statusAnxiety) {

                statusAnxiety.textContent =
                    formatValue(anxiety);

            }


            /* Update Overall Status */

            if (overallStatus) {

                overallStatus.textContent =
                    result;


                applyStatusClass(
                    overallStatus,
                    result
                );

            }


            /* =========================
               Create History Record
            ========================= */

            const newCheckin = {

                mood: mood,

                stress: stress,

                anxiety: anxiety,

                overallStatus: result,

                date:
                    new Date().toISOString()

            };


            /* Get Existing History */

            const history =
                getHistory();


            /* Add Newest Check-in First */

            history.unshift(
                newCheckin
            );


            /* Keep Latest 10 */

            const limitedHistory =
                history.slice(0, 10);


            /* Save */

            saveHistory(
                limitedHistory
            );


            /* Refresh History */

            displayHistory();


            /* Reset Form */

            form.reset();

        }
    );


    /* =========================
       Load History on Page Open
    ========================= */

    displayHistory();

});
