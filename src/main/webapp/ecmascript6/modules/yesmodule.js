const main = () => {
    const base = document.querySelector(".nomodule-support-example");
    const result = base.querySelector(".result-area");
    result.innerHTML += "YES MODULE!<br />";
};

window.addEventListener("DOMContentLoaded", main);
