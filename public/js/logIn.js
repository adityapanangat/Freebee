var logInForm;
var googleLogIn;
var message;

document.addEventListener('DOMContentLoaded', function() {
    logInForm = document.getElementById('logInForm');
    googleLogIn = document.getElementById('googleLogIn');
    returnTo = (new URL(window.location.href)).searchParams.get('returnTo');
    message = document.getElementById("message");

    if(returnTo) {
        logInForm.setAttribute('action', "/login/local?returnTo=" + returnTo);
        googleLogIn.setAttribute('href', "/login/google?returnTo=" + returnTo);
    }

    console.log(logInForm.action)
});

document.addEventListener("submit", async function(event) {
    event.preventDefault();
    message.innerHTML = "";

    formData = new FormData(logInForm); //getting formdata
    formData.set("email", formData.get("email").toLowerCase()); //email is given in lowercase for log in

    var response = await fetch("/login/local", {
        method: 'POST',
        headers: {
            'Accept': "application/json, text/html, */*"
        },
        body: formData,
    });

    response = await response.json();

    message.innerHTML = response.error ? response.error : "";
});

