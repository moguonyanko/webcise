function reportSample() {
    const el = document.getElementById("external-host-script");
    el.innerHTML = `<p>Dummy script loaded: ${new Date().toString()}</p>`;
}

reportSample();
