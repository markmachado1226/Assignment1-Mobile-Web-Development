// ui_cone.js
// ==========
// UI event handlers for cone
//
//  AUTHOR: Mark Machado (machmark@sheridancollege.ca)
// CREATED: 2024-06-02
// UPDATED: 2024-06-02
///////////////////////////////////////////////////////////////////////////////

// Must use IIFE to avoid _let_ variable redeclaration errors
(() => {
    let labelBaseRadius = document.getElementById("labelBaseRadius");
    let rangeBaseRadius = document.getElementById("rangeBaseRadius");
    let labelHeight = document.getElementById("labelHeight");
    let rangeHeight = document.getElementById("rangeHeight");
    let labelSector = document.getElementById("labelSector");
    let rangeSector = document.getElementById("rangeSector");
    let labelStack = document.getElementById("labelStack");
    let rangeStack = document.getElementById("rangeStack");
    rangeBaseRadius.value = 1;
    rangeHeight.value = 2;
    rangeSector.value = 36;
    rangeStack.value = 1;

    rangeBaseRadius.addEventListener("input", e => {
        labelBaseRadius.innerText = rangeBaseRadius.value;
        gl.model.setBaseRadius(parseFloat(rangeBaseRadius.value));
    });
    rangeHeight.addEventListener("input", e => {
        labelHeight.innerText = rangeHeight.value;
        gl.model.setHeight(parseInt(rangeHeight.value));
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

