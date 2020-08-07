var garrisonField = document.getElementById("garrisonID");

var removeButton = document.getElementById("radioRemove");

var moveButton = document.getElementById("radioMove");

removeButton.addEventListener("click", function() {
    radioRemove.checked = true;
    radioMove.checked = false;
    garrisonField.style.visibility = "hidden";
});

moveButton.addEventListener("click", function() {
    radioRemove.checked = false;
    radioMove.checked = true;
    garrisonField.style.visibility = "visible";
});