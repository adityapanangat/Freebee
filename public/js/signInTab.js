// -- here's the definitions:
/* 
logging in - you have an account
signing up - making an account
signing in - universal term for both */

//#region Tab Mechanics Variables
var signingUp = false; //-- is it a sign up or login
var signInTabOpen = false; // false when it's closed; true when it's open
var hasOpenedTabBefore = false; //prevents reloading of elements over and over

//all visual elements
var signInTab;
var logInButton;
var signUpButton;
var infoBox;
var pfpElement; //just used for positioning
var emailBox;
var passwordBox;
var confirmPasswordBox;
var enterButton;

var signedIn = false;
var processingData = false;

var resetPasswordLink;


//#endregion

//#region Tab Mechanics

function clearTab() {

    //clear out inputs
    emailBox.value = "";
    passwordBox.value = "";

    if(confirmPasswordBox) {
        confirmPasswordBox.value = "";
    }

    //set signedIn = true so that tab won't open again, and remove tab
    signedIn = true;
    signInTab.remove();
    signInTabOpen = false;
    infoErrors.style.setProperty("color", "#e86c5b");

    hasOpenedTabBefore = false; //that way everything gets reset when reopened hopefully****
    processingData = false;
}



function checkInfoBoxValidity() {
    var errors = [];
    var problemBoxes = [false, false, false]; //boolean array, 0: email box, 1: password box, 2: confirm password box || flagged true means problem in that box

    //for both sign up and login

    //checks email validity

    if(emailBox.value == "") {
        errors.push("Email is a requird field");
        problemBoxes[0] = true;
    }
    if(!emailBox.checkValidity()) {
        errors.push("Email Invalid");
        problemBoxes[0] = true;
    }

    //checks password validity (can't be blank)
    if(!passwordBox.checkValidity()) {
        errors.push("Password is a required field");
        problemBoxes[1] = true;
    }

    /*password must:
        - contain uppercase
        - contain a special character
        - contain a number
        - be at least 8 characters long
    */

    if(!containsUppercase(passwordBox.value) || !containsSpecialCharacters(passwordBox.value) || !containsNumber(passwordBox.value) || passwordBox.value.length < 8) {
        errors.push("Password Invalid -- Needs: 8 characters, 1 capital, 1 number, and 1 symbol");
        problemBoxes[1] = true;
    }
    
    //that's all we need to check for login, so we can return
    if(!signingUp) {
        colorInfoBoxes(problemBoxes, 2);
        return errors;
    }

    //for just signing up

    //password must match with confirm password
    if(passwordBox.value != confirmPasswordBox.value) {
        errors.push("Password does not match with confirmed password");
        problemBoxes[2] = true;
        problemBoxes[2] = true;
    }
    
    //colors info boxes according to the errors
    colorInfoBoxes(problemBoxes, 3);
    return errors;
}

function colorInfoBoxes(whichAreWrong, numberOfInfoBoxes) {
    var allInfoBoxes = [emailBox, passwordBox, confirmPasswordBox];

    for(i = 0; i < numberOfInfoBoxes; i++) {
        if(whichAreWrong[i]) {
           // allInfoBoxes[i].style.setProperty("box-shadow", "3px 3px #e67c6e");
           allInfoBoxes[i].classList.add("infoBoxInvalid");
           allInfoBoxes[i].classList.remove("infoBoxValid");

           allInfoBoxes[i].addEventListener('input', function() {
            this.classList.remove("infoBoxInvalid");
            this.classList.remove("infoBoxValid");
           });
        }
        
        else {
          //  allInfoBoxes[i].style.setProperty("box-shadow", "3px 3px #b1d797");
          allInfoBoxes[i].classList.add("infoBoxValid");
          allInfoBoxes[i].classList.remove("infoBoxInvalid");

          allInfoBoxes[i].addEventListener('input', function() {
            this.classList.remove("infoBoxInvalid");
            this.classList.remove("infoBoxValid");
           });

        }

        
    }
}


function containsUppercase(str) {
    return /[A-Z]/.test(str);
}

function containsSpecialCharacters(str) {
    var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return format.test(str);
}

function containsNumber(str) {
    var format = /[0-9]/;
    return format.test(str);
}
// #endregion




async function signUp(emailInput, passwordInput) {

    //makes it easier; email will be email regardless of case
    emailInput = emailInput.toLowerCase();

    //posting to sign up -- server will take care of verification
    var response =  await makePRequest("POST", "/signUp", { email: emailInput, password: passwordInput });

    //applying error message
    infoErrors.style.setProperty("color", "#e86c5b");
    
    if(!response) { //means server/network error
        infoErrors.innerHTML = "Something went wrong";
        processingData = false;
        return;
    }

    if(response.error == -1) {
        infoErrors.innerHTML = "Could not connect to server";
        processingData = false;
        return;
    }

    if(response.error == 0) { //email is already in use
        infoErrors.innerHTML = "An account with this email already exists. Try logging in. Forgot your password? Change it "

        if(!resetPasswordLink) {
            resetPasswordLink = document.createElement("a");
            resetPasswordLink.setAttribute("id", "resetPasswordLink");
            resetPasswordLink.setAttribute("href", "https://www.youtube.com");
            resetPasswordLink.innerHTML = "HERE";
            resetPasswordLink.classList.add("clickify", "buttonify");
        }

        signInTab.insertBefore(resetPasswordLink, confirmPasswordBox.nextSibling);

        var interval = setInterval(function() {
            if(infoErrors.innerHTML != "An account with this email already exists. Try logging in. Forgot your password? Change it ") {
                resetPasswordLink.remove();
                clearInterval(interval);
            }
        }, 10);

        emailBox.classList.add("infoBoxInvalid");
        emailBox.classList.remove("infoBoxValid");

        processingData = false;

        emailBox.addEventListener('input', function() {
            this.classList.remove("infoBoxInvalid");
            this.classList.remove("infoBoxValid");
        });

        return;
    }

    if(response.error == 1) { //success
        infoErrors.style.setProperty("color", "#b1d797");
        infoErrors.innerHTML = "Signed Up!";
        setTimeout(clearTab, 750);
        return;
    }
    
}

function logIn(emailInput, passwordInput) {
    //makes it easier; email will be email regardless of case
    emailInput = emailInput.toLowerCase();

    makePRequest("POST", "/logIn", { email: emailInput, password: passwordInput }).then(response => {
        console.log(response);
        if(!response) {
            infoErrors.style.setProperty("color", "#e86c5b");

        }
        else {
            console.log(success.body.error);
            infoErrors.style.setProperty("color", "#b1d797");
            infoErrors.innerHTML = "Logged in!";
            setTimeout(clearTab, 750);
        }
    }); 
}

async function makePRequest(requestType, UrlEnding, data) { //works for POST and PUT
    //makes request
    try {
        var toReturn = null;

        await fetch("http://localhost:3000" + UrlEnding, {
            method: requestType,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => response.json()).then(json => {
            toReturn = json;
        });
        return toReturn;

    } catch(error) {
        console.log(error);
        return false;
    }
    //returns response if successful, otherwise returns false
}


