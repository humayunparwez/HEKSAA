document.addEventListener("DOMContentLoaded", function () {


    /* =========================
       Elements
    ========================= */

    const patientList =
        document.getElementById(
            "patient-list"
        );


    const patientName =
        document.getElementById(
            "doctor-patient-name"
        );


    const patientId =
        document.getElementById(
            "doctor-patient-id"
        );


    const patientAge =
        document.getElementById(
            "doctor-patient-age"
        );


    const latestStatus =
        document.getElementById(
            "doctor-latest-status"
        );


    const totalCheckins =
        document.getElementById(
            "total-checkins"
        );


    const lowCount =
        document.getElementById(
            "low-count"
        );


    const moderateCount =
        document.getElementById(
            "moderate-count"
        );


    const highCount =
        document.getElementById(
            "high-count"
        );


    const doctorHistory =
        document.getElementById(
            "doctor-history"
        );


    const trendMood =
        document.getElementById(
            "trend-mood"
        );


    const trendStress =
        document.getElementById(
            "trend-stress"
        );


    const trendAnxiety =
        document.getElementById(
            "trend-anxiety"
        );


    const trendDirection =
        document.getElementById(
            "trend-direction"
        );


    const distressAlert =
        document.getElementById(
            "distress-alert"
        );



    /* =========================
       Utilities
    ========================= */

    function formatValue(value) {

        if (!value) {
            return "No Data";
        }


        return String(value)
            .replace(/-/g, " ")
            .replace(/\b\w/g, function (letter) {

                return letter.toUpperCase();

            });

    }



    function getConcernScore(status) {

        if (status === "Low Concern") {
            return 1;
        }


        if (status === "Moderate Concern") {
            return 2;
        }


        if (status === "High Concern") {
            return 3;
        }


        return 0;

    }



    function getStatusClass(status) {

        if (status === "Low Concern") {
            return "status-low";
        }


        if (status === "Moderate Concern") {
            return "status-moderate";
        }


        if (status === "High Concern") {
            return "status-high";
        }


        return "";

    }



    /* =========================
       Create / Migrate Patients
    ========================= */

    function getPatients() {

        const saved =
            localStorage.getItem(
                "heksaaPatients"
            );


        if (saved) {

            try {

                const patients =
                    JSON.parse(saved);


                if (
                    Array.isArray(patients) &&
                    patients.length > 0
                ) {

                    return patients;

                }

            }

            catch (error) {

                console.log(
                    "Unable to read patients."
                );

            }

        }


        /*
         * Migrate existing single
         * patient data.
         */

        let patients = [];


        const oldProfile =
            localStorage.getItem(
                "heksaaPatientProfile"
            );


        const oldHistory =
            localStorage.getItem(
                "heksaaCheckinHistory"
            );


        if (oldProfile) {

            try {

                const profile =
                    JSON.parse(oldProfile);


                let history = [];


                if (oldHistory) {

                    try {

                        history =
                            JSON.parse(oldHistory);

                    }

                    catch (error) {

                        history = [];

                    }

                }


                patients.push({

                    id:
                        profile.id ||
                        "HK-001",

                    name:
                        profile.name ||
                        "Patient",

                    age:
                        profile.age ||
                        "Not available",

                    history:
                        history

                });

            }

            catch (error) {

                console.log(
                    "Unable to migrate patient."
                );

            }

        }


        /*
         * Demo patients.
         *
         * These make the prototype
         * demonstrate multiple patients.
         */

        patients.push({

            id: "HK-003",

            name: "Rahul",

            age: 24,

            history: [

                {
                    mood: "neutral",
                    stress: "moderate",
                    anxiety: "moderate",
                    overallStatus:
                        "Moderate Concern",
                    date:
                        new Date(
                            Date.now() -
                            3600000
                        ).toISOString()
                },

                {
                    mood: "happy",
                    stress: "low",
                    anxiety: "low",
                    overallStatus:
                        "Low Concern",
                    date:
                        new Date(
                            Date.now() -
                            86400000
                        ).toISOString()
                }

            ]

        });


        patients.push({

            id: "HK-004",

            name: "Aisha",

            age: 22,

            history: [

                {
                    mood: "sad",
                    stress: "high",
                    anxiety: "high",
                    overallStatus:
                        "High Concern",
                    date:
                        new Date(
                            Date.now() -
                            1800000
                        ).toISOString()
                },

                {
                    mood: "very-sad",
                    stress: "very-high",
                    anxiety: "high",
                    overallStatus:
                        "High Concern",
                    date:
                        new Date(
                            Date.now() -
                            86400000
                        ).toISOString()
                }

            ]

        });


        patients.push({

            id: "HK-005",

            name: "Arjun",

            age: 27,

            history: [

                {
                    mood: "happy",
                    stress: "low",
                    anxiety: "low",
                    overallStatus:
                        "Low Concern",
                    date:
                        new Date(
                            Date.now() -
                            7200000
                        ).toISOString()
                }

            ]

        });


        localStorage.setItem(

            "heksaaPatients",

            JSON.stringify(patients)

        );


        return patients;

    }



    /* =========================
       Save Patients
    ========================= */

    function savePatients(patients) {

        localStorage.setItem(

            "heksaaPatients",

            JSON.stringify(patients)

        );

    }



    /* =========================
       Current Patient
    ========================= */

    let patients =
        getPatients();


    let selectedPatientId =
        patients.length > 0
            ? patients[0].id
            : null;



    /* =========================
       Patient List
    ========================= */

    function displayPatientList() {

        if (!patientList) {
            return;
        }


        patientList.innerHTML = "";


        if (patients.length === 0) {

            patientList.innerHTML = `

                <div class="patient-list-empty">

                    No patients available.

                </div>

            `;

            return;

        }


        patients.forEach(function (patient) {


            const card =
                document.createElement("div");


            card.className =
                "patient-card";


            if (
                patient.id ===
                selectedPatientId
            ) {

                card.classList.add(
                    "active"
                );

            }


            const history =
                patient.history || [];


            const latest =
                history.length > 0
                    ? history[0]
                    : null;


            const status =
                latest
                    ? latest.overallStatus
                    : "No Data";


            const statusClass =
                getStatusClass(status);


            card.innerHTML = `

                <div class="patient-list-avatar">

                    👤

                </div>


                <div class="patient-card-info">

                    <strong>
                        ${patient.name}
                    </strong>

                    <span>

                        ${patient.id}
                        • Age ${patient.age}

                    </span>

                </div>


                <div
                    class="patient-card-status
                    ${statusClass}"
                >

                    ${status}

                </div>

            `;


            card.addEventListener(
                "click",
                function () {

                    selectedPatientId =
                        patient.id;

                    displayPatientList();

                    displaySelectedPatient();

                }
            );


            patientList.appendChild(
                card
            );

        });

    }



    /* =========================
       Display Selected Patient
    ========================= */

    function displaySelectedPatient() {

        const patient =
            patients.find(
                function (item) {

                    return (
                        item.id ===
                        selectedPatientId
                    );

                }
            );


        if (!patient) {
            return;
        }


        const history =
            patient.history || [];


        /* Profile */

        patientName.textContent =
            patient.name;


        patientId.textContent =
            patient.id;


        patientAge.textContent =
            patient.age;



        /* Latest Status */

        if (history.length > 0) {

            const status =
                history[0].overallStatus;


            latestStatus.textContent =
                status;


            latestStatus.classList.remove(

                "status-low",

                "status-moderate",

                "status-high"

            );


            const statusClass =
                getStatusClass(status);


            if (statusClass) {

                latestStatus.classList.add(
                    statusClass
                );

            }

        }

        else {

            latestStatus.textContent =
                "No Data";

        }



        /* Summary */

        totalCheckins.textContent =
            history.length;


        let low = 0;

        let moderate = 0;

        let high = 0;


        history.forEach(function (item) {

            if (
                item.overallStatus ===
                "Low Concern"
            ) {

                low++;

            }

            else if (
                item.overallStatus ===
                "Moderate Concern"
            ) {

                moderate++;

            }

            else if (
                item.overallStatus ===
                "High Concern"
            ) {

                high++;

            }

        });


        lowCount.textContent =
            low;


        moderateCount.textContent =
            moderate;


        highCount.textContent =
            high;



        /* Alert */

        if (
            history.length > 0 &&
            history[0].overallStatus ===
            "High Concern"
        ) {

            distressAlert.style.display =
                "block";

        }

        else {

            distressAlert.style.display =
                "none";

        }



        /* History */

        displayHistory(history);


        /* Trend */

        displayTrend(history);

    }



    /* =========================
       History
    ========================= */

    function displayHistory(history) {

        if (!doctorHistory) {
            return;
        }


        if (history.length === 0) {

            doctorHistory.innerHTML = `

                <div class="doctor-empty">

                    <div class="empty-icon">
                        📋
                    </div>

                    <h4>
                        No patient check-ins available
                    </h4>

                    <p>
                        Patient check-in information
                        will appear here when available.
                    </p>

                </div>

            `;

            return;

        }


        doctorHistory.innerHTML = "";


        history.forEach(function (item) {


            const card =
                document.createElement("div");


            card.className =
                "doctor-checkin";


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


            card.innerHTML = `

                <div
                    class="doctor-checkin-header"
                >

                    <div>

                        <h4>
                            Patient Check-in
                        </h4>

                        <span
                            class="doctor-date"
                        >

                            ${formattedDate}

                        </span>

                    </div>


                    <span
                        class="doctor-status
                        ${getStatusClass(
                            item.overallStatus
                        )}"
                    >

                        ${item.overallStatus}

                    </span>

                </div>


                <div class="doctor-data">


                    <div
                        class="doctor-data-item"
                    >

                        <span>
                            Mood
                        </span>

                        <strong>

                            ${formatValue(
                                item.mood
                            )}

                        </strong>

                    </div>


                    <div
                        class="doctor-data-item"
                    >

                        <span>
                            Stress
                        </span>

                        <strong>

                            ${formatValue(
                                item.stress
                            )}

                        </strong>

                    </div>


                    <div
                        class="doctor-data-item"
                    >

                        <span>
                            Anxiety
                        </span>

                        <strong>

                            ${formatValue(
                                item.anxiety
                            )}

                        </strong>

                    </div>


                </div>

            `;


            doctorHistory.appendChild(
                card
            );

        });

    }



    /* =========================
       Trend
    ========================= */

    function displayTrend(history) {

        if (history.length === 0) {

            trendMood.textContent =
                "No Data";


            trendStress.textContent =
                "No Data";


            trendAnxiety.textContent =
                "No Data";


            trendDirection.textContent =
                "No Data";


            return;

        }


        const latest =
            history[0];


        trendMood.textContent =
            formatValue(
                latest.mood
            );


        trendStress.textContent =
            formatValue(
                latest.stress
            );


        trendAnxiety.textContent =
            formatValue(
                latest.anxiety
            );


        if (history.length < 2) {

            trendDirection.textContent =
                "Not enough data";

            trendDirection.className =
                "";

            return;

        }


        const latestScore =
            getConcernScore(
                history[0].overallStatus
            );


        const previousScore =
            getConcernScore(
                history[1].overallStatus
            );


        if (
            latestScore >
            previousScore
        ) {

            trendDirection.textContent =
                "Increasing Concern";

            trendDirection.className =
                "trend-warning";

        }

        else if (
            latestScore <
            previousScore
        ) {

            trendDirection.textContent =
                "Improving";

            trendDirection.className =
                "trend-good";

        }

        else {

            trendDirection.textContent =
                "Stable";

            trendDirection.className =
                "trend-stable";

        }

    }



    /* =========================
       Start
    ========================= */

    displayPatientList();

    displaySelectedPatient();


});
