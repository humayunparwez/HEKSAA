document.addEventListener("DOMContentLoaded", function () {

    const form = document.querySelector(".checkin-card form");
    const successMessage = document.getElementById("success-message");

    const statusMood = document.getElementById("status-mood");
    const statusStress = document.getElementById("status-stress");
    const statusAnxiety = document.getElementById("status-anxiety");

    if (!form) {
        return;
    }

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const mood = document.getElementById("mood").value;
        const stress = document.getElementById("stress").value;
        const anxiety = document.getElementById("anxiety").value;

        if (!mood || !stress || !anxiety) {
            alert("Please complete all the questions before submitting.");
            return;
        }

        // Show success message
        if (successMessage) {
            successMessage.style.display = "block";
        }

        // Update Mental Health Status
        if (statusMood) {
            statusMood.textContent = mood.replace("-", " ");
        }

        if (statusStress) {
            statusStress.textContent = stress.replace("-", " ");
        }

        if (statusAnxiety) {
            statusAnxiety.textContent = anxiety.replace("-", " ");
        }

        // Reset the form
        form.reset();

    });

});
