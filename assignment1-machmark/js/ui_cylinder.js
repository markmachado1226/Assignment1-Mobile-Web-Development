// ui_cylinder.js
// ==========
// UI event handlers for cylinder
//
// AUTHOR: Mark Machado (machmark@sheridancollege.ca)
// CREATED: 2024-06-02
// UPDATED: 2024-06-02
///////////////////////////////////////////////////////////////////////////////

// Must use IIFE to avoid _let_ variable redeclaration errors
(() => {
    let labelBaseRadius = document.getElementById("labelBaseRadius");
    let rangeBaseRadius = document.getElementById("rangeBaseRadius");
    let labelTopRadius = document.getElementById("labelTopRadius");
    let rangeTopRadius = document.getElementById("rangeTopRadius");
    let labelHeight = document.getElementById("labelHeight");
    let rangeHeight = document.getElementById("rangeHeight");
    let labelSector = document.getElementById("labelSector");
    let rangeSector = document.getElementById("rangeSector");
    let labelStack = document.getElementById("labelStack");
    let rangeStack = document.getElementById("rangeStack");
    rangeBaseRadius.value = 1;
    rangeTopRadius.value = 1;
    rangeHeight.value = 2;
    rangeSector.value = 36;
    rangeStack.value = 1;


    rangeBaseRadius.addEventListener("input", e => {
        labelBaseRadius.innerText = rangeBaseRadius.value;
        gl.model.setBaseRadius(parseFloat(rangeBaseRadius.value));
    });
    rangeTopRadius.addEventListener("input", e => {
        labelTopRadius.innerText = rangeTopRadius.value;
        gl.model.setTopRadius(parseFloat(rangeTopRadius.value));
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

