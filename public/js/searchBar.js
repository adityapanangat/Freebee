const domainName = "http://localhost:3000";

var searchBar = null;
var searchBarButton = null;
var nextPage = 1;
var loadingMore = false;

document.addEventListener('DOMContentLoaded', function() {
    searchBar = document.getElementById("searchBar");
    searchBarButton = document.getElementById("searchBarButton");
});

document.addEventListener('keypress', function(e) {
    if(e.key === 'Enter') { //will search on either enter or manual search press
        nextPage = 1;
        searchForProduct(searchBar.value, true);
    }
});

document.getElementById('searchBarButton').addEventListener('click', function() {
    nextPage = 1;
    searchForProduct(searchBar.value, true);
});

import { loadThumbnails, clearThumbnails } from "/js/productThumbnails.js";

//very beginnings of searching mechanism -> will autocorrect then send for  // needs to be trimmed
async function searchForProduct(search, newSearch = false) {
    loadingMore = true;
    search = search.trim().toLowerCase();
    searchBar.blur();

    //NEED TO LOAD RANDOM PRODUCTS
    if(search == "") {
        loadRandomProductFeed(true);
        loadingMore = false;
        return;
    }


    //2 possibilites -- either a completely new search or not...
    if(newSearch == true) {
        nextPage = 1; // reset page number 
        clearThumbnails(); // clear thumbnails
    }

    searchBarButton.style.transform = "scale(1.025)";


    const dataParams = {
        s: search,
        page: nextPage
    }

    var dataURL = domainName + "/search/getSearchData?" + new URLSearchParams(dataParams);

    //fetchData based on nextPage, then add 1 to nextPage
    await fetch(dataURL).then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch');
        }
        loadingMore = false;
        return response.json();
    })
    .then(data => { 
        if(data.length != 0) {
            loadThumbnails(data, newSearch);  
            nextPage += 1; //after page loads, increment the next page by 1       
        }
        if(window.location.search != "?s=" + search) {
            window.history.pushState(null, "", domainName + "/search?s=" + search);
        }

        loadingMore = false;
    })
    .catch(error => {
        console.error('Error:', error);
        loadingMore = false;
    });

    setTimeout(function() {
        searchBarButton.style.transform = "scale(1)";
    }, 100);
}

async function loadRandomProductFeed(deleteCurrent = false) {
    loadingMore = true;
    if(deleteCurrent) { //if it is a new random page loading, delete the current thumbnails
        clearThumbnails();
        nextPage = 1;
    }

    const dataParams = {
        page: nextPage
    }

    var dataURL = domainName + "/search/getRandomProductFeed?" + new URLSearchParams(dataParams);

    await fetch(dataURL).then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch');
        }
        loadingMore = false;
        return response.json();
    })
    .then(data => { 
        if(data.length != 0) { //get rid of the thumnails and load data
            loadThumbnails(data);   
            nextPage += 1;
            loadingMore = false;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        loadingMore = false;
    });    
}

// Function to check if the user has scrolled to the bottom
function isBottomOfPage() {
    // Total height of the document
    const documentHeight = document.documentElement.scrollHeight;

    // Height of the visible part of the window
    const windowHeight = window.innerHeight;

    // Current scroll position from the top
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;

    // Check if the scroll position is at the bottom
    return (scrollPosition + windowHeight) >= (documentHeight - 1);
}

// Add an event listener for the scroll event
window.addEventListener('scroll', () => {
    if (isBottomOfPage() && !loadingMore) {
        
        const params = new URLSearchParams(window.location.search);
        if(params.size == 0) { //on home page
            loadRandomProductFeed();
        }
        else { //something has been searched
            searchForProduct(searchBar.value);
        }
    }
});

window.onload = function() {
    windowLoad();
}

window.onpopstate = function(event) {
    windowLoad();
}

function windowLoad() {
    nextPage = 1; //always set the next page to load back to one

    const params = new URLSearchParams(window.location.search);
    if(params.size == 0) { //if no params, load random feed
        searchBar.value = ""; 
        loadRandomProductFeed(true);
        return; 
    } 

    //if there are params, need to set search and nextPage based on params
    const search = params.get('s');

    searchBar.value = search;   

    //make the search that is on the URL
    searchForProduct(searchBar.value, true);
}