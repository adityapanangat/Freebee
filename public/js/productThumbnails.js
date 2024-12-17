var numberOfRows = 1; //kept track of by script
var thumbnailNumber = 1;
var productGrid = document.getElementById("productGrid");



//gives extra room after all thumbnails
function makeFooter() {
    var footer = document.createElement("div");
    footer.setAttribute("class", "footer");
    footer.style.setProperty("top", ((numberOfRows - 1) * 330 + 300).toString() + "px");
    var message = document.createElement('p');
    message.innerHTML = "Loading...";

    footer.appendChild(message);
    document.body.appendChild(footer);
}

export function clearThumbnails() {
    productGrid.innerHTML = "";
}

export function loadThumbnails(productArray) {  

    // Assuming buffer is your Buffer object containing image data

    const names = productArray.map(product => product.productName);
    const srcs = productArray.map(product => URL.createObjectURL(new Blob([new Uint8Array(product.productImage.data)], { type: "image/octet-stream" })));
    const IDs = productArray.map(product => product.productID);

    var counter = 0;
    var left = 10;


    //need to make display for phones, as well.
    for(var i = 0; i < productArray.length; i++) {
        
        generateThumbnail(names[i], srcs[i], IDs[i]);
        
        counter++;

        if(counter == 4) {
            counter = 0;
            numberOfRows += 1;
        }
    }
}



//generates one thumbnail, taking in product name, image, and location; will only be called by addRow()
function generateThumbnail(productName, imageSource, ID) {
    var productThumbnail = document.createElement("a");
    productThumbnail.setAttribute("class", "productThumbnail");
    productThumbnail.setAttribute("href", "/freebie?p=" + ID);
    
    var productImage = document.createElement("img");
    productImage.setAttribute("src", imageSource);
    productImage.setAttribute("loading", "lazy");
    
    var productTitle = document.createElement("p");
    productTitle.innerHTML = productName;

    productThumbnail.appendChild(productImage);
    productThumbnail.appendChild(productTitle);
    
    productGrid.appendChild(productThumbnail);
}