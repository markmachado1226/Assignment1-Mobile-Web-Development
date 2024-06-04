// ui_torus.js
// ==========
// UI event handlers for torus
//
// AUTHOR: Mark Machado (machmark@sheridancollege.ca)
// CREATED: 2024-06-02
// UPDATED: 2024-06-02
///////////////////////////////////////////////////////////////////////////////

// Must use IIFE to avoid _let_ variable redeclaration errors
(() => {
    let labelMajorRadius = document.getElementById("labelMajorRadius");
    let rangeMajorRadius = document.getElementById("rangeMajorRadius");
    let labelMinorRadius = document.getElementById("labelMinorRadius");
    let rangeMinorRadius = document.getElementById("rangeMinorRadius");
    let labelSector = document.getElementById("labelSector");
    let rangeSector = document.getElementById("rangeSector");
    let labelSide = document.getElementById("labelSide");
    let rangeSide = document.getElementById("rangeSide");
    rangeMajorRadius.value = 1;
    rangeMinorRadius.value = 0.5;
    rangeSector.value = 36;
    rangeSide.value = 18;

    rangeMajorRadius.addEventListener("input", e => {
        labelMajorRadius.innerText = rangeMajorRadius.value;
        gl.model.setMajorRadius(parseFloat(rangeMajorRadius.value));
    });
    rangeMinorRadius.addEventListener("input", e => {
        labelMinorRadius.innerText = rangeMinorRadius.value;
        gl.model.setMinorRadius(parseFloat(rangeMinorRadius.value));
    });
    rangeSector.addEventListener("input", e => {
        labelSector.innerText = rangeSector.value;
        gl.model.setSectorCount(parseInt(rangeSector.value));
    });
    rangeSide.addEventListener("input", e => {
        labelSide.innerText = rangeSide.value;
        gl.model.setSideCount(parseInt(rangeSide.value));
    });
})();

