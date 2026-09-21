document.addEventListener("DOMContentLoaded", function () {

    const form = document.querySelector(".checkin-card form");

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

        alert(
            "Your check-in has been recorded successfully."
        );

        form.reset();
    });

});
