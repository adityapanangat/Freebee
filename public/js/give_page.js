function changeProductImageView() {
    var productImageInput = document.getElementById("productImage");
    var productImageView = document.getElementById("productImageView");
    productImageView.src = URL.createObjectURL(productImageInput.files[0]);
}

