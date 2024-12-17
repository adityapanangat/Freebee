var form;
var message;

var emailInput;
var passwordInput;
var confirmPasswordInput;

form = document.getElementById("signUpForm");
message = document.getElementById('message');

emailInput = document.getElementById('email');
passwordInput = document.getElementById('password');
confirmPasswordInput = document.getElementById('confirmPassword');

customFormBehavior();

function customFormBehavior() {

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        if(!checkSignUpValidity()) { return; } //checks to make sure inputs are valid

        const info = {
            email: emailInput.value,
            password: passwordInput.value,
        }
        beginVerification(info); //starts the verification process
    });
}



async function signUp() {
    try {
        var formData = new FormData(form);
        formData.set("email", formData.get('email').toLowerCase());

        var response = await fetch("/signup/local", {
            method: 'POST',
            headers: {
                'Accept': "application/json, text/html, */*"
            },
            body: formData,
        });
        
        if(!response.ok) throw new Error();

        const contentType = response.headers.get('Content-Type');
        var responseData;
        
        if (response.redirected) {
            // Handle redirect
            console.log('Redirecting to:', response.url);
            window.location.href = response.url; // Redirect using window.location
        }
        else if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
            console.log('JSON Response:', responseData);
            
            if(responseData.error == 0) {
                message.innerHTML = "Email already in use."
            }
        } 
        else if(contentType && contentType.includes('text/html')) {
            responseData = await response.text();
            document.getElementById("content").innerHTML = responseData;
        }

    } catch(error) {
        console.log(error);
        return false;
    }
}

function checkSignUpValidity() {
    var valid = [false, false, false]; //email, password, confirmPassword -- everything starts off invalid

    if(isValidEmail(emailInput.value)) { valid[0] = true; }
    if(isValidPassword(passwordInput.value)) { valid[1] = true; }
    if(passwordInput.value === confirmPasswordInput.value) { valid[2] = true; }


    if(allAreTrue(valid)) { //everything is valid
       return true;
    }
    else {
        showMessage(valid);
        return false;
    }
}

function allAreTrue(boolArray) {
    return boolArray.every(value => value === true);
}

function showMessage(valid) {
    if(!valid[0]) {
        message.innerHTML = "Invalid email address";
    }
    else if(!valid[1]) {
        message.innerHTML = "Password must be at least 8 characters long and include at least one number and one symbol.";
    }
    else if(!valid[2]) {
        message.innerHTML = "Passwords do not match. Please make sure both password are identical.";
    }
    else {
        message.innerHTML = "";
    }
}


function isValidEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function isValidPassword(password) {
    const hasNumber = /\d/;
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/;
    
    if (password.length < 8) {
        return false;
    }

    if (!hasNumber.test(password)) {
        return false;
    }

    if (!hasSymbol.test(password)) {
        return false;
    }

    return true;
}


 
async function beginVerification(user) {
    message.innerHTML = "";

    var formData = new FormData(form);
    formData.set("email", formData.get('email').toLowerCase());

    try {
        var results = await fetch("/beginVerification", {
            method: 'POST',
            headers: {
                'Accept': "application/json, text/html, */*"
            },
            body: formData,
        });

        results = await results.json(); //returns email in use, success, or failure
        if(results.success == "Email in use") { message.innerHTML = "An account already exists with this email"; return; }
        if(results.success == false) throw new Error();
        
        message.innerHTML = "You will be able to create your account once you verify your email";
    }
    catch(err) {
        console.log(err);
        message.innerHTML = "Something went wrong";
    }
}