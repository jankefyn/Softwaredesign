"use strict";
var TextAdventure;
(function (TextAdventure) {
    let loginButton = document.getElementById("login");
    loginButton.addEventListener("click", function () { submit("login"); });
    let submitbuttonHTML = document.getElementById("submitUserData");
    submitbuttonHTML.addEventListener("click", function () { submit("UserData"); });
    let serverantwort = document.getElementById("serverantwort");
    async function submit(_parameter) {
        let formData = new FormData(document.forms[0]);
        let url = "https://softwaredesign-abgabe.herokuapp.com/";
        let query = new URLSearchParams(formData);
        if (_parameter == "login") {
            url = url + "/login";
        }
        if (_parameter == "UserData") {
            url = url + "UserData";
        }
        url = url + "?" + query.toString();
        let response = await fetch(url);
        let text = await response.text();
        serverantwort.innerHTML = text;
    }
})(TextAdventure || (TextAdventure = {}));
//# sourceMappingURL=anmeldungSkript.js.map