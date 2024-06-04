// ui_sphere.js
// ==========
// UI event handlers for sphere
//
// AUTHOR: Mark Machado (machmark@sheridancollege.ca)
// CREATED: 2024-06-02
// UPDATED: 2024-06-02
///////////////////////////////////////////////////////////////////////////////

// Must use IIFE to avoid _let_ variable redeclaration errors
(() => {
    let labelRadius = document.getElementById("labelRadius");
    let rangeRadius = document.getElementById("rangeRadius");
    let labelSector = document.getElementById("labelSector");
    let rangeSector = document.getElementById("rangeSector");
    let labelStack = document.getElementById("labelStack");
    let rangeStack = document.getElementById("rangeStack");
    rangeRadius.value = 1;
    rangeSector.value = 36;
    rangeStack.value = 18;
    rangeRadius.addEventListener("input", e => {
        labelRadius.innerText = rangeRadius.value;
        gl.model.setRadius(parseFloat(rangeRadius.value));
    });
    rangeSector.addEventListener("input", e => {
        labelSector.innerText = rangeSector.value;
        gl.model.setSectorCount(parseInt(rangeSector.value));
    });
    rangeStack.addEventListener("input", e => {
        labelStack.innerText = rangeStack.value;
        gl.model.setStackCount(parseInt(rangeStack.value));
    });
})();

