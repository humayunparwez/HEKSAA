document.addEventListener("DOMContentLoaded", function () {


    /* =========================
       Profile Elements
    ========================= */

    const profileForm =
        document.getElementById("profile-form");

    const profileSuccess =
        document.getElementById("profile-success");

    const patientName =
        document.getElementById("patient-name");

    const patientId =
        document.getElementById("patient-id");

    const patientAge =
        document.getElementById("patient-age");


    /* =========================
       Check-in Elements
    ========================= */

    const form =
        document.querySelector(".checkin-card form");

    const successMessage =
        document.getElementById("success-message");

    const statusMood =
        document.getElementById("status-mood");

    const statusStress =
        document.getElementById("status-stress");

    const statusAnxiety =
        document.getElementById("status-anxiety");

    const overallStatus =
        document.getElementById("overall-status");

    const historyContainer =
        document.getElementById("checkin-history");


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
       Load Profile
    ========================= */

    function loadProfile() {

        const savedProfile =
            localStorage.getItem(
                "heksaaPatientProfile"
            );


        if (!savedProfile) {
            return;
        }


        try {

            const profile =
                JSON.parse(savedProfile);


            if (patientName) {
                patientName.value =
                    profile.name || "";
            }


            if (patientId) {
                patientId.value =
                    profile.id || "";
            }


            if (patientAge) {
                patientAge.value =
                    profile.age || "";
            }

        }

        catch (error) {

            console.log(
                "Unable to load patient profile."
            );

        }

    }


    /* =========================
       Save Profile
    ========================= */

    if (profileForm) {

        profileForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const profile = {

                    name:
                        patientName.value.trim(),

                    id:
                        patientId.value.trim(),

                    age:
                        patientAge.value

                };


                localStorage.setItem(
                    "heksaaPatientProfile",
                    JSON.stringify(profile)
                );


                if (profileSuccess) {

                    profileSuccess.style.display =
                        "block";

                }

            }
        );

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
       Apply Status Class
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
       Get History
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

                    <span>Mood</span>

                    <strong>
                        ${formatValue(item.mood)}
                    </strong>

                </div>


                <div class="history-row">

                    <span>Stress</span>

                    <strong>
                        ${formatValue(item.stress)}
                    </strong>

                </div>


                <div class="history-row">

                    <span>Anxiety</span>

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

    if (form) {

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


                const result =
                    calculateOverallStatus(
                        mood,
                        stress,
                        anxiety
                    );


                if (successMessage) {

                    successMessage.style.display =
                        "block";

                }


                if (statusMood) {

                    statusMood.textContent =
                        formatValue(mood);

                }


                if (statusStress) {

                    statusStress.textContent =
                        formatValue(stress);

                }


                if (statusAnxiety) {

                    statusAnxiety.textContent =
                        formatValue(anxiety);

                }


                if (overallStatus) {

                    overallStatus.textContent =
                        result;


                    applyStatusClass(
                        overallStatus,
                        result
                    );

                }


                const newCheckin = {

                    mood: mood,

                    stress: stress,

                    anxiety: anxiety,

                    overallStatus: result,

                    date:
                        new Date().toISOString()

                };


                const history =
                    getHistory();


                history.unshift(
                    newCheckin
                );


                const limitedHistory =
                    history.slice(0, 10);


                saveHistory(
                    limitedHistory
                );


                displayHistory();


                form.reset();

            }
        );

    }


    /* =========================
       Initial Load
    ========================= */

    loadProfile();

    displayHistory();

});
