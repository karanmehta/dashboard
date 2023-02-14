function toggleTabPanel(event) {

    var previousActiveTabMenu, previousActiveTabPanel, newActiveTabMenu, newActiveTabPanel, clickedTabMenu = event.target;

    previousActiveTabMenu = document.querySelector(".tabmenu.active") ?? false;
    previousActiveTabMenu && previousActiveTabMenu.classList.remove("active");

    previousActiveTabPanel = document.querySelector(".tabpanel.active") ?? false;
    previousActiveTabPanel && previousActiveTabPanel.classList.remove("active");

    newActiveTabMenu = document.querySelector("[data-tab='" + clickedTabMenu.getAttribute('data-tab') + "']") ?? false;
    newActiveTabMenu && clickedTabMenu.classList.add("active");
    newActiveTabPanel = document.getElementById(clickedTabMenu.getAttribute('data-tab'));
    newActiveTabPanel && newActiveTabPanel.classList.add("active");

}

function tabPanel() {

    var tabMenus = document.querySelectorAll('.tabmenu');

    for (let tabMenu of tabMenus) {
        tabMenu.addEventListener("click", toggleTabPanel);
    }

}

document.addEventListener("DOMContentLoaded", () => {
    tabPanel();
});