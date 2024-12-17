var header;
var profileInformation = {
    profile: {
        email: null,
        phoneNumber: null,
    },
    settings: [],
    acceptedFreebies: [],
    donatedFreebies: [],
};
var entryList;
var emailHTML;
var acceptedFreebiesHTMLs  = [];
var donatedFreebiesHTMLs = [];


document.addEventListener('DOMContentLoaded', async function() {
    header = document.getElementById("header-text");
    entryList = document.getElementById('entry-list');

    profileInformation = await getProfileInformation();

    console.log(profileInformation);

    emailHTML = 
    `
    <div class="entry">
        <label>Email&nbsp;&nbsp;</label> 
        <input id="emailInput" placeholder='` + profileInformation.profile.email + `' readonly>
        <button>Edit</div>
    </div>
    `;

    generateAcceptedFreebiesHTMLs();
    generateDonatedFreebiesHTMLs();
    loadProfileEntries(); 
});
 
const passwordHTML = 
`
<div class="entry">
    <label>Password&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label> 
<a href="/profile/changePassword" id="changePassword">Change Password</a>
</div>
`;

function showEntries(headerName) {
    header.innerHTML = headerName;

    if(headerName === 'Profile') {
        loadProfileEntries(); 
    }

    else if(headerName === 'Settings') {
        loadSettingsEntries();
    }

    else if(headerName === 'Accepted Freebies') {
        loadAcceptedFreebiesEntries();
    }

    else if(headerName === 'Donated Freebies') {
        loadDonatedFreebiesEntries();
    }
}

function loadProfileEntries() {
    entryList.innerHTML = "";
    entryList.insertAdjacentHTML('beforeend', emailHTML); 
    entryList.insertAdjacentHTML('beforeend', passwordHTML); 
}

function loadSettingsEntries() {
    entryList.innerHTML = "";
}

function loadAcceptedFreebiesEntries() {
    entryList.innerHTML = "";
    for(var html of acceptedFreebiesHTMLs) {
        entryList.insertAdjacentHTML('beforeend', html);
    }
}

function loadDonatedFreebiesEntries() {
    entryList.innerHTML = "";
    
    for(var html of donatedFreebiesHTMLs) {
        entryList.insertAdjacentHTML('beforeend', html);
    }
}

async function getProfileInformation() {

    try {
        const results = await fetch("/profile/getProfile");
        var profileInformation = await results.json();
    }
    catch(err) {
        console.log("Couldn't fetch");
    }

    console.log(profileInformation);

    return profileInformation;
}

function generateAcceptedFreebiesHTMLs() {
    if(profileInformation.acceptedFreebies.length == 0) return;

    console.log(profileInformation.acceptedFreebies);

   
    for(const [freebie] of profileInformation.acceptedFreebies) {
        //**MAKE IT SO THAT FREEBIE?P= ONLY ACCESSIBLE IF ACCEPTED = 0 || IF YOU HAVE ALREADY ACCEPTED

        console.log(freebie);

        const uint8Array = new Uint8Array(freebie.productImage.data);
        const blob = new Blob([uint8Array], { type: 'image/jpeg' }); // Adjust mime type if needed
        const imageSource = URL.createObjectURL(blob);

        var freebieHTML = `
        <div class="entry">
            <img style='width:150px; height:100px;' src='` + imageSource + `'></img> 
            <p>&nbsp;&nbsp;&nbsp;&nbsp;` + freebie.productName +`</p> <br>`;
        
        if(freebie.received == 0) {
            freebieHTML +=
            `
            <a style='position:relative; left:55%;' href=/freebie/confirm/${freebie.confirmationLink}>Click here to verify reception</a>
            </div>
            `;
        }
        else {
            freebieHTML +=
            `
            <a style='position:relative; left:55%;'>Reception verified</a>
            </div>
            `;
        }

        //** how to make a open up in a new tab? */
        acceptedFreebiesHTMLs.push(freebieHTML);
    }
}

function generateDonatedFreebiesHTMLs() {
    if(profileInformation.donatedFreebies.length == 0) return;

    console.log(profileInformation.donatedFreebies);

   
    for(const [freebie] of profileInformation.donatedFreebies) {
        //**MAKE IT SO THAT FREEBIE?P= ONLY ACCESSIBLE IF ACCEPTED = 0 || IF YOU HAVE ALREADY ACCEPTED

        console.log(freebie);

        const uint8Array = new Uint8Array(freebie.productImage.data);
        const blob = new Blob([uint8Array], { type: 'image/jpeg' }); // Adjust mime type if needed
        const imageSource = URL.createObjectURL(blob);

        var freebieHTML = `
        <div class="entry">
            <img style='width:150px; height:100px;' src='` + imageSource + `'></img> 
            <p>&nbsp;&nbsp;&nbsp;&nbsp;` + freebie.productName +`</p> <br>
            </div>
        `;

        //** how to make a open up in a new tab? */
        donatedFreebiesHTMLs.push(freebieHTML);
    }
}