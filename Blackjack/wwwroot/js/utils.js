// Utilities

function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sleep(ms = 1500) {
    await delay(() => void 0, ms);
}

async function delay(fn, ms = 1500, ...args) {
    await timeout(ms);
    return fn(...args);
}

function sanitiseInputs(e) {
    e.target.value = e.target.value.replace(/[^A-Za-z\s\d]/gi, "");
}

function addInputSanitiser(INPUT_EL_ID) {
    document
        .getElementById(INPUT_EL_ID)
        .addEventListener("input", sanitiseInputs);
}