// JS functionality for the Blackjack game

// Onload

window.onload = () => {
    addInputSanitiser("player-1");
    document
        .getElementById("add-player-btn")
        .addEventListener("click", registerPlayer);

    initialiseSettings();
    initialiseChat();
};

// ------------------------------------------------------------

// Pregame

function sanitiseInputs(e) {
    e.target.value = e.target.value.replace(/[^A-Za-z\s\d]/gi, "");
}

function addInputSanitiser(playerUsernameId) {
    document
        .getElementById(playerUsernameId)
        .addEventListener("input", sanitiseInputs);
}

function createPotentialPlayerElement(LAST_ADD_PLAYER_EL) {
    let potentialPlayerEl = LAST_ADD_PLAYER_EL.cloneNode(true);
    potentialPlayerEl.setAttribute("id", "potentialPlayer");
    potentialPlayerEl.classList.add("d-none");

    let potentialPlayerLabelEl = potentialPlayerEl.querySelector("label");
    potentialPlayerLabelEl.setAttribute("for", "potentialPlayerInput");

    let potentialPlayerSpanEl = potentialPlayerEl.querySelector("span");
    potentialPlayerSpanEl.setAttribute("class", "player-username");
    potentialPlayerSpanEl.textContent = "";

    let potentialPlayerInputEl = potentialPlayerEl.querySelector("input");
    potentialPlayerInputEl.setAttribute("id", "potentialPlayerInput");
    potentialPlayerInputEl.setAttribute("name", "potentialPlayerInput");
    potentialPlayerInputEl.setAttribute("disabled", true);
    potentialPlayerInputEl.value = "";

    return potentialPlayerEl;
}

async function registerPlayer(e) {
    e.preventDefault();

    const ADD_PLAYER_ELS = document.querySelectorAll(".add-player");

    await CONN.invoke(
        "RegisterPlayer",
        `${
            ADD_PLAYER_ELS.item(ADD_PLAYER_ELS.length - 1).querySelector(
                "input",
            ).value
        }`,
    );
}

async function playerNotRegistered(NREG_REASON) {
    const ADD_PLAYER_ELS = document.querySelectorAll(".add-player");

    ADD_PLAYER_ELS.item(ADD_PLAYER_ELS.length - 1).querySelector(
        "label",
    ).textContent = `${NREG_REASON}`;
}

async function generatePotentialPlayer() {
    const ADD_PLAYER_ELS = document.querySelectorAll(".add-player");
    const LAST_ADD_PLAYER_EL = ADD_PLAYER_ELS.item(ADD_PLAYER_ELS.length - 1);
    const USERNAME_LABEL_EL = LAST_ADD_PLAYER_EL.querySelector("label");
    const USERNAME_INPUT_EL = LAST_ADD_PLAYER_EL.querySelector("input");

    let usernameSpanEl = document.createElement("span");
    usernameSpanEl.setAttribute("class", "player-username");
    usernameSpanEl.textContent = `${USERNAME_INPUT_EL.value}`;

    LAST_ADD_PLAYER_EL.insertBefore(usernameSpanEl, USERNAME_INPUT_EL);

    document.querySelector(".add-player-btn-cont").remove();

    USERNAME_INPUT_EL.setAttribute("type", "hidden");
    USERNAME_INPUT_EL.setAttribute("name", `${USERNAME_INPUT_EL.id}`);
    USERNAME_INPUT_EL.readOnly = true;

    const POTENTIAL_PLAYER_EL =
        createPotentialPlayerElement(LAST_ADD_PLAYER_EL);

    if (document.body.contains(USERNAME_LABEL_EL)) {
        USERNAME_LABEL_EL.remove();
    }

    document.getElementById("players-form").appendChild(POTENTIAL_PLAYER_EL);
}

async function generateStartButton() {
    let startBtnEl = document.createElement("input");
    startBtnEl.setAttribute("type", "submit");
    startBtnEl.setAttribute("id", "startGameBtn");
    startBtnEl.setAttribute("class", "primary-link-button");
    startBtnEl.value = "Start";

    document.getElementById("players-form").appendChild(startBtnEl);
}

async function addUsername(username) {
    let clientRegistered = false;

    const ADD_PLAYER_ELS = document.querySelectorAll(".add-player");
    const PLAYER_ID = `player-${ADD_PLAYER_ELS.length}`;

    let lastAddPlayerEl = ADD_PLAYER_ELS.item(ADD_PLAYER_ELS.length - 1);
    let usernameLabelEl = lastAddPlayerEl.querySelector("label");
    let usernameSpanEl = lastAddPlayerEl.querySelector("span");
    let usernameInputEl = lastAddPlayerEl.querySelector("input");

    let registeredPlayerSpanEl;
    let potentialPlayerEl;

    if (lastAddPlayerEl.id == "potentialPlayer") {
        lastAddPlayerEl.setAttribute("id", "");

        usernameLabelEl.setAttribute("for", `${PLAYER_ID}`);

        usernameSpanEl.textContent = `${username}`;

        usernameInputEl.setAttribute("id", `${PLAYER_ID}`);
        usernameInputEl.setAttribute("name", `${PLAYER_ID}`);
        usernameInputEl.removeAttribute("disabled");

        potentialPlayerEl = createPotentialPlayerElement(lastAddPlayerEl);

        clientRegistered = true;
    } else {
        registeredPlayerSpanEl = document.createElement("span");
        registeredPlayerSpanEl.setAttribute("class", "player-username");
        registeredPlayerSpanEl.textContent = `${username}`;
    }

    let addPlayerBtnContEl = document.querySelector(".add-player-btn-cont");
    if (document.body.contains(addPlayerBtnContEl)) {
        addPlayerBtnContEl.remove();
    }

    usernameLabelEl.remove();

    usernameInputEl.setAttribute("type", "hidden");
    usernameInputEl.readOnly = true;
    usernameInputEl.value = `${username}`;

    if (registeredPlayerSpanEl != undefined) {
        lastAddPlayerEl.insertBefore(registeredPlayerSpanEl, usernameInputEl);
    }

    if (potentialPlayerEl != undefined) {
        document
            .getElementById("players-form")
            .insertBefore(
                potentialPlayerEl,
                document.getElementById("startGameBtn"),
            );

        lastAddPlayerEl.classList.remove("d-none");
    }

    return clientRegistered;
}

async function generateRegisterNewPlayer() {
    const PLAYER_ID = `player-${
        document.querySelectorAll(".add-player").length + 1
    }`;

    let newPlayerEl = document.createElement("div");
    newPlayerEl.setAttribute(
        "class",
        "add-player d-flex justify-content-center align-items-center mb-2",
    );

    let newPlayerLblEl = document.createElement("label");
    newPlayerLblEl.setAttribute("for", PLAYER_ID);
    newPlayerLblEl.textContent = "Username:";

    let newPlayerInputEl = document.createElement("input");
    newPlayerInputEl.setAttribute("type", "text");
    newPlayerInputEl.setAttribute("id", PLAYER_ID);
    newPlayerInputEl.setAttribute("name", PLAYER_ID);

    let newPlayerAddBtnCntEl = document.createElement("div");
    newPlayerAddBtnCntEl.setAttribute("class", "add-player-btn-cont");

    let newPlayerAddBtnEl = document.createElement("button");
    newPlayerAddBtnEl.setAttribute("type", "submit");
    newPlayerAddBtnEl.setAttribute("id", "add-player-btn");
    newPlayerAddBtnEl.textContent = "+";

    newPlayerEl.appendChild(newPlayerLblEl);
    newPlayerEl.appendChild(newPlayerInputEl);
    newPlayerEl
        .appendChild(newPlayerAddBtnCntEl)
        .appendChild(newPlayerAddBtnEl);

    document.getElementById("players-form").appendChild(newPlayerEl);

    document
        .getElementById("add-player-btn")
        .addEventListener("click", registerPlayer);

    addInputSanitiser(PLAYER_ID);
}

function displayLimitReachedMsg() {
    let playerLimitReachedMsgEl = document.createElement("p");
    playerLimitReachedMsgEl.setAttribute("class", "mt-2");
    playerLimitReachedMsgEl.innerHTML =
        "Maximum players registered. You will be a watcher when the game starts.<br><br>Please reload if you would like to play.";

    document.getElementById("intro").appendChild(playerLimitReachedMsgEl);
}

// ------------------------------------------------------------

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

// ------------------------------------------------------------

// Play area

var username = "";

async function updateView() {
    let playerActionsEl = document.querySelector(".player-actions");
    let toggleSidebarEl = document.getElementById("toggle-sidebar");
    let asideEl = document.querySelector("aside");

    if ($(window).outerWidth() < 900) {
        playerActionsEl.classList.add("mb-4");

        toggleSidebarEl.classList.add("d-none");
        toggleSidebarEl.classList.add("btn-expanded");

        asideEl.inert = false;
        asideEl.classList.remove("attached");
        asideEl.classList.remove("collapsed");
        asideEl.classList.remove("expanded");

        document.getElementById("sidebar").classList.remove("collapsed");

        document
            .getElementById("sidebar-header-wrapper")
            .classList.remove("visually-hidden");
        document
            .getElementById("sidebar-content-wrapper")
            .classList.remove("visually-hidden");
    } else {
        playerActionsEl.classList.remove("mb-4");
        toggleSidebarEl.classList.remove("d-none");
        asideEl.classList.add("attached");
    }
}

const observer = new MutationObserver((mutationList, observer) => {
    updateView();
    observer.disconnect();
});

observer.observe($("main").get(0), {
    childList: true,
    subtree: true,
});

$(window).resize(updateView);

async function loadGame(NUM_ROUNDS, DEALER, PLAYER) {
    document.querySelector("footer").classList.add("game-footer");

    document.getElementById("intro").remove();

    let toggleSidebarEl = document.getElementById("toggle-sidebar");
    let asideEl = document.querySelector("aside");
    let sidebarEl = document.getElementById("sidebar");
    let sidebarHeadWrpEl = document.getElementById("sidebar-header-wrapper");
    let sidebarContWrpEl = document.getElementById("sidebar-content-wrapper");

    if (document.body.contains(toggleSidebarEl)) {
        toggleSidebarEl.addEventListener("click", (e) => {
            e.preventDefault();

            if (toggleSidebarEl.classList.contains("btn-expanded")) {
                asideEl.inert = true;
                asideEl.classList.add("expanded");

                sidebarEl.classList.add("collapsed");
                sidebarHeadWrpEl.classList.add("visually-hidden");
                sidebarContWrpEl.classList.add("visually-hidden");
            }

            toggleSidebarEl.classList.toggle("btn-expanded");
            asideEl.classList.toggle("collapsed");

            if (toggleSidebarEl.classList.contains("btn-expanded")) {
                asideEl.inert = false;
                asideEl.classList.add("expanded");

                delay(() => {
                    sidebarEl.classList.remove("collapsed");
                    sidebarHeadWrpEl.classList.remove("visually-hidden");
                    sidebarContWrpEl.classList.remove("visually-hidden");
                }, 1250);
            } else {
                delay(() => {
                    asideEl.classList.remove("expanded");
                }, 1250);
            }
        });
    }

    let recordEl = document.getElementById("record");
    let recordSwitchInputEl = document.getElementById("record-option");

    // Prevent click event while toggling of record is animating
    recordEl.addEventListener("animationstart", async () => {
        recordSwitchInputEl.inert = true;
    });
    recordEl.addEventListener("animationend", async (e) => {
        recordSwitchInputEl.inert = false;

        if (recordEl.classList.contains("collapsed")) {
            recordEl.classList.add("d-none");
        }
    });

    // Toggling of record switch
    recordSwitchInputEl.addEventListener("click", async (e) => {
        recordEl.classList.toggle("collapsed");

        if (recordSwitchInputEl.getAttribute("aria-checked") === "true") {
            recordSwitchInputEl.setAttribute("aria-checked", "false");
        } else {
            recordEl.classList.remove("d-none");
            recordSwitchInputEl.setAttribute("aria-checked", "true");
        }

        // If spacebar triggers switch, refocus switch element after inertion and animation time passed - needed for accessibility
        if (e.detail === 0) {
            delay(() => recordSwitchInputEl.focus(), 800);
        }
    });

    constructPlayerHand("player-hand", PLAYER.Hand);
    initialiseRound(NUM_ROUNDS, PLAYER, DEALER);

    document.getElementById("username").textContent = `${username}`;

    document.getElementById("game-container").classList.remove("d-none");
}

function setSymbol(SUITE) {
    switch (SUITE.Symbol) {
        case "Club":
            return "♣";
        case "Diamond":
            return "♦";
        case "Heart":
            return "♥";
        case "Spade":
            return "♠";
    }
}

function setColour(SUITE) {
    return SUITE.Colour == "Black" ? "black" : "red";
}

function checkBlackjack(PLAYER) {
    if (PLAYER.Blackjack) {
        document
            .getElementById("player-hand")
            .getElementsByClassName("card-status")[0].textContent =
            "Blackjack!";
    }
}

async function turn() {
    document
        .getElementById("player-hand")
        .getElementsByClassName("card-status")[0].textContent = "Your turn!";
    generateHitStandBtns();
}

async function anotherTurn(TURN_USERNAME) {
    document.getElementsByClassName("player-actions")[0].innerHTML =
        `<h4>Currently ${TURN_USERNAME}'s turn</h4>`;
}

async function hit(PLAYER) {
    document
        .getElementById("player-hand")
        .getElementsByClassName("cards")[0]
        .appendChild(generateCard(PLAYER.Hand.slice(-1)[0]));

    if (PLAYER.HandValue > 21) {
        document.getElementById("hitBtn").remove();
        document.getElementById("standBtn").remove();
        document
            .getElementById("player-hand")
            .getElementsByClassName("card-status")[0].textContent = "BUST!";
    }
}

async function stand() {
    document.getElementById("hitBtn").remove();
    document.getElementById("standBtn").remove();
    document
        .getElementById("player-hand")
        .getElementsByClassName("card-status")[0].textContent = "You stood";
}

async function dealersTurn(DEALER) {
    let dealerStatusEl = document
        .getElementById("dealer-position")
        .getElementsByClassName("card-status")[0];

    dealerStatusEl.textContent = "Dealer's turn";

    await sleep();

    document.getElementById("hole").remove();

    await dealDealer(DEALER.Hand).then(async () => {
        if (DEALER.HandValue > 21) {
            dealerStatusEl.textContent = "BUST!";
        } else {
            await delay(() => (dealerStatusEl.textContent = "Stands"));
        }
    });
}

async function displayResults(PLAYER_RECORD) {
    await delay(() => {
        document
            .getElementById("dealer-position")
            .getElementsByClassName("card-status")[0].textContent =
            PLAYER_RECORD.DealerRoundResult;

        document
            .getElementById("player-hand")
            .getElementsByClassName("card-status")[0].textContent =
            `You ${PLAYER_RECORD.RoundResult.toLowerCase()}${
                PLAYER_RECORD.RoundResult == "Won"
                    ? "!"
                    : PLAYER_RECORD.RoundResult == "Lost"
                      ? " :("
                      : ""
            }`;
    });
}

function displayRecord(PLAYER_RECORD) {
    document.getElementById("wins").textContent = `${PLAYER_RECORD.Wins}`;
    document.getElementById("draws").textContent = `${PLAYER_RECORD.Draws}`;
    document.getElementById("losses").textContent = `${PLAYER_RECORD.Losses}`;
    document.getElementById("busts").textContent = `${PLAYER_RECORD.Busts}`;
}

async function newRound(NUM_ROUNDS, DEALER, PLAYER) {
    document.querySelectorAll(".playing-card").forEach((el) => el.remove());

    document
        .querySelectorAll(".card-status")
        .forEach((el) => (el.textContent = ""));

    initialiseRound(NUM_ROUNDS, PLAYER, DEALER);
}

function generateCard(CARD) {
    let genCardEl = document.createElement("div");
    genCardEl.setAttribute("class", `playing-card ${setColour(CARD.Suite)}`);

    let genCardSpanEl = document.createElement("span");
    genCardSpanEl.textContent = `${CARD.Rank}${setSymbol(CARD.Suite)}`;

    genCardEl.appendChild(genCardSpanEl);
    return genCardEl;
}

function constructPlayerHand() {
    let playerHandEl = document.createElement("div");
    playerHandEl.setAttribute("id", "player-hand");
    playerHandEl.setAttribute("class", "player-hand");
    playerHandEl.innerHTML =
        '<div class="card-status text-center"></div><div class="cards player-cards"></div>';

    document.getElementById("player-positions").appendChild(playerHandEl);
}

function generateHitStandBtns() {
    let playerHitEl = document.createElement("input");
    playerHitEl.setAttribute("type", "submit");
    playerHitEl.setAttribute("id", "hitBtn");
    playerHitEl.setAttribute("class", "primary-link-button");
    playerHitEl.setAttribute("value", "Hit");

    let playerStandEl = document.createElement("input");
    playerStandEl.setAttribute("type", "submit");
    playerStandEl.setAttribute("id", "standBtn");
    playerStandEl.setAttribute("class", "primary-link-button");
    playerStandEl.setAttribute("value", "Stand");

    let playerActionsEl = document.getElementsByClassName("player-actions")[0];
    playerActionsEl.innerHTML = "";
    playerActionsEl.appendChild(playerHitEl);
    playerActionsEl.appendChild(playerStandEl);

    document.getElementById("hitBtn").addEventListener("click", (e) => {
        e.preventDefault();
        CONN.invoke("PerformHit");
    });

    document.getElementById("standBtn").addEventListener("click", (e) => {
        e.preventDefault();
        (async () => {
            try {
                await stand();
                CONN.invoke("SendTurnPlayerStatus", "stood");
                CONN.invoke("BeginNextTurn");
            } catch (err) {
                console.error(err);
            }
        })();
    });
}

async function dealDealer(DEALER_HAND) {
    for (let i = 1; i < DEALER_HAND.length; i++) {
        if (i == 1) {
            document
                .getElementById("dealer-hand")
                .getElementsByClassName("cards")[0]
                .appendChild(generateCard(DEALER_HAND[1]));
        } else {
            await delay(() => {
                document
                    .getElementById("dealer-hand")
                    .getElementsByClassName("cards")[0]
                    .appendChild(generateCard(DEALER_HAND[i]));
            });
        }
    }
}

async function generateNextRoundBtn() {
    let nextRoundEl = document.createElement("input");
    nextRoundEl.setAttribute("type", "submit");
    nextRoundEl.setAttribute("id", "nextRoundBtn");
    nextRoundEl.setAttribute("class", "primary-link-button");
    nextRoundEl.setAttribute("value", "Next Round");

    document
        .getElementsByClassName("player-actions")[0]
        .appendChild(nextRoundEl);
    let nextRound = document.getElementById("nextRoundBtn");
    if (document.body.contains(nextRound)) {
        nextRound.addEventListener("click", (e) => {
            e.preventDefault();
            nextRound.remove();
            CONN.invoke("BeginNewRound");
        });
    }
}

function generateInitialPlayerHand(PLAYER_HAND_EL_ID, PLAYER_HAND) {
    let playerCardsEl = document
        .getElementById(PLAYER_HAND_EL_ID)
        .getElementsByClassName("cards")[0];
    playerCardsEl.appendChild(generateCard(PLAYER_HAND[0]));
    playerCardsEl.appendChild(generateCard(PLAYER_HAND[1]));
    return playerCardsEl;
}

function generateInitialDealerHand(DEALER) {
    let dealerCardsEl = document
        .getElementById("dealer-hand")
        .getElementsByClassName("cards")[0];

    dealerCardsEl.appendChild(generateCard(DEALER.Hand[0]));

    if (DEALER.Blackjack) {
        dealerCardsEl.appendChild(generateCard(DEALER.Hand[1]));

        document
            .getElementById("dealer-position")
            .getElementsByClassName("card-status")[0].textContent =
            "Blackjack!";
    } else {
        dealerCardsEl.appendChild(generateHoleCard());
    }
}

function generateHoleCard() {
    let holeCardEl = document.createElement("div");
    holeCardEl.setAttribute("id", "hole");
    holeCardEl.setAttribute("class", "playing-card");

    let holeCardSpanEl = document.createElement("span");
    holeCardSpanEl.textContent = "J♠";

    holeCardEl.appendChild(holeCardSpanEl);
    return holeCardEl;
}

function initialiseRound(NUM_ROUNDS, PLAYER, DEALER) {
    document.getElementById("round-num").textContent = `${NUM_ROUNDS}`;

    checkBlackjack(PLAYER);

    generateInitialDealerHand(DEALER);
    generateInitialPlayerHand("player-hand", PLAYER.Hand);
}

// ------------------------------------------------------------

// Settings

var existingFormData = new FormData(document.getElementById("settings-form"));
var preservedChat = "";

function processActionLogSetting(SETTING) {
    if (existingFormData.get("action-log-msgs-enabled") != SETTING) {
        if (SETTING == "on") {
            CONN.invoke("UpdateSetting", "ActionLogMsgsEnabled", true);
        } else {
            document.querySelectorAll(".action-msg").forEach((msg) => {
                msg.remove();
            });

            CONN.invoke("UpdateSetting", "ActionLogMsgsEnabled", false);
        }
    }
}

function processDealerRecordLogSetting(MAIN_SETTING, RECORD_TYPE_SETTING) {
    if (
        existingFormData.get("dealer-record-log-msgs-enabled") != MAIN_SETTING
    ) {
        if (MAIN_SETTING == "on") {
            CONN.invoke("UpdateSetting", "DealerRecordLogMsgsEnabled", true);
            CONN.invoke(
                "UpdateSetting",
                "DealerRecordPerRound",
                RECORD_TYPE_SETTING == "round",
            );
        } else {
            document.querySelectorAll(".dealer-msg").forEach((msg) => {
                msg.remove();
            });

            CONN.invoke("UpdateSetting", "DealerRecordLogMsgsEnabled", false);
        }
    } else if (existingFormData.get("dealer-record") != RECORD_TYPE_SETTING) {
        CONN.invoke(
            "UpdateSetting",
            "DealerRecordPerRound",
            RECORD_TYPE_SETTING == "round",
        );
    }
}

function processOthersLogSetting(MAIN_SETTING, RECORD_SETTING) {
    let othersLogMsgsEls = document.querySelectorAll(".other-msg");
    let othersRecordsLogMsgsEls = document.querySelectorAll(
        ".other-msg.record-msg",
    );

    if (existingFormData.get("others-log-msgs-enabled") != MAIN_SETTING) {
        if (MAIN_SETTING == "on") {
            CONN.invoke("UpdateSetting", "OthersLogMsgsEnabled", true);
        } else {
            othersLogMsgsEls.forEach((msg) => {
                msg.remove();
            });

            CONN.invoke("UpdateSetting", "OthersLogMsgsEnabled", false);
        }
    } else if (
        existingFormData.get("others-records-log-msgs-enabled") !=
        RECORD_SETTING
    ) {
        if (RECORD_SETTING == "on") {
            CONN.invoke("UpdateSetting", "OthersRecordsLogMsgsEnabled", true);
        } else {
            othersRecordsLogMsgsEls.forEach((msg) => {
                msg.remove();
            });

            CONN.invoke("UpdateSetting", "OthersRecordsLogMsgsEnabled", false);
        }
    }
}

function processEnabledChatSetting(SETTING) {
    let chatEl = document.getElementById("chat");
    let chatTabEl = document.getElementById("chat-tab").parentElement;
    let logTabBtnEl = document.getElementById("log-tab");

    if (SETTING == "on") {
        if (chatEl.innerHTML == "") {
            chatEl.innerHTML = preservedChat;
            initialiseChat();
            logTabBtnEl.classList.remove("single-tab-btn");
            chatTabEl.classList.remove("d-none");
        } else {
            preservedChat = chatEl.innerHTML;
        }
    } else {
        chatTabEl.classList.add("d-none");
        logTabBtnEl.click();
        logTabBtnEl.classList.add("single-tab-btn");
        chatEl.classList.add("d-none");
        preservedChat = chatEl.innerHTML;
        chatEl.innerHTML = "";
    }
}

function initialiseSettings() {
    const settingsModalEl = new bootstrap.Modal(
        document.getElementById("settings-modal"),
    );
    const confirmModalEl = new bootstrap.Modal(
        document.getElementById("confirm-modal"),
    );

    var settingsChanged = false;

    let settingsFormEl = document.getElementById("settings-form");

    document
        .getElementById("settings-modal")
        .addEventListener("shown.bs.modal", (e) => e.target.focus());

    settingsFormEl.addEventListener("input", () => {
        settingsChanged = true;
    });

    document
        .getElementById("dealer-record-log-msgs-enabled")
        .addEventListener("change", (e) => {
            let dealerRecordPerRoundSettingEl =
                document.getElementById("per-round");
            let dealerRecordPerPlayerSettingEl =
                document.getElementById("per-player");

            if (e.target.checked) {
                dealerRecordPerRoundSettingEl.removeAttribute("disabled");
                dealerRecordPerPlayerSettingEl.removeAttribute("disabled");
            } else {
                dealerRecordPerRoundSettingEl.setAttribute("disabled", true);
                dealerRecordPerPlayerSettingEl.setAttribute("disabled", true);
            }
        });

    document
        .getElementById("others-log-msgs-enabled")
        .addEventListener("change", (e) => {
            let othersRecordMsgsSettingEl = document.getElementById(
                "others-records-log-msgs-enabled",
            );

            if (e.target.checked) {
                othersRecordMsgsSettingEl.removeAttribute("disabled");
            } else {
                if (othersRecordMsgsSettingEl.checked) {
                    othersRecordMsgsSettingEl.checked = false;
                }

                othersRecordMsgsSettingEl.setAttribute("disabled", true);
            }
        });

    settingsFormEl.addEventListener("submit", (e) => {
        e.preventDefault();

        let newFormData = new FormData(e.target);

        processActionLogSetting(newFormData.get("action-log-msgs-enabled"));
        processDealerRecordLogSetting(
            newFormData.get("dealer-record-log-msgs-enabled"),
            newFormData.get("dealer-record"),
        );
        processOthersLogSetting(
            newFormData.get("others-log-msgs-enabled"),
            newFormData.get("others-records-log-msgs-enabled"),
        );
        processEnabledChatSetting(newFormData.get("chat-enabled"));

        existingFormData = newFormData;
        settingsChanged = false;
    });

    settingsFormEl.addEventListener("reset", () => {
        document.getElementById("per-round").removeAttribute("disabled");
        document.getElementById("per-player").removeAttribute("disabled");
        document
            .getElementById("others-records-log-msgs-enabled")
            .removeAttribute("disabled");
    });

    document.querySelectorAll(".close-settings").forEach((x) => {
        x.addEventListener("click", () => {
            if (settingsChanged) {
                confirmModalEl.show();
            } else {
                settingsModalEl.hide();
            }
        });
    });

    document
        .getElementById("dismiss-unsaved-settings")
        .addEventListener("click", () => {
            settingsModalEl.hide();
            document.getElementById("settings-form").reset();
            settingsChanged = false;
        });
}

// ------------------------------------------------------------

// Sidebar

document.querySelectorAll(".nav-link").forEach((x) => {
    x.addEventListener("click", (e) => {
        document.querySelector(".nav-link.active").classList.remove("active");

        e.target.classList.add("active");

        const SIDEBAR_SECTIONS = document.getElementById(
            "sidebar-content-wrapper",
        ).children;

        for (const y of SIDEBAR_SECTIONS) {
            if (e.target.textContent.toLowerCase() == y.id) {
                y.classList.remove("d-none");
            } else {
                y.classList.add("d-none");
            }
        }
    });
});

async function generateLogMessage(
    msg,
    ACTION = false,
    RECORD = false,
    OTHER = false,
    SETTING_CHANGE = false,
) {
    let logMsgEl = document.createElement("article");

    if (RECORD) {
        const [PLAYER, ...MSG_JSON_STR] = msg.split("|");
        let msgJson = JSON.parse(MSG_JSON_STR);

        if (PLAYER == "Dealer") {
            logMsgEl.classList.add("dealer-msg");
        }

        logMsgEl.innerHTML = `${PLAYER} ${msgJson.RoundResult}! <span>Record — W: ${msgJson.Wins} D: ${msgJson.Draws} L: ${msgJson.Losses} B: ${msgJson.Busts}</span>`;
        logMsgEl.classList.add("record-msg");
    } else {
        logMsgEl.textContent = msg;
    }

    if (ACTION) {
        logMsgEl.classList.add("action-msg");
    }

    if (OTHER) {
        logMsgEl.classList.add("other-msg");
    }

    if (SETTING_CHANGE) {
        logMsgEl.classList.add("setting-change-msg");
    }

    document.getElementById("log").appendChild(logMsgEl);
}

function initialiseChat() {
    let submitMsnBtnEl = document.getElementById("submit-msg-btn");
    let chatMsgEl = document.getElementById("chat-message");

    submitMsnBtnEl.addEventListener("click", (e) => {
        e.preventDefault;

        if (e.detail === 0) {
            chatMsgEl.focus();
        }
    });

    document
        .getElementById("send-chat-message")
        .addEventListener("submit", (e) => {
            e.preventDefault();

            if (chatMsgEl.value.trim() != "") {
                CONN.invoke(
                    "SendChatMessage",
                    username,
                    new FormData(e.target).get("chat-message"),
                );

                chatMsgEl.value = "";
                chatMsgEl.style.height = chatMsgEl.style.minHeight;

                submitMsnBtnEl.setAttribute("disabled", true);
            }
        });

    chatMsgEl.addEventListener("keydown", (e) => {
        if (e.key == "Enter" && !e.shiftKey) {
            e.preventDefault();
        }
    });

    chatMsgEl.addEventListener("keyup", (e) => {
        if (e.key == "Enter" && !e.shiftKey) {
            submitMsnBtnEl.click();
        }

        if (e.target.value.trim() == "") {
            submitMsnBtnEl.setAttribute("disabled", true);
        } else {
            submitMsnBtnEl.removeAttribute("disabled");
        }
    });
}

async function generateChatMessage(SENDER, MSG, RECEIVER) {
    const NOW = new Date();

    let chatMsgEl = document.createElement("article");
    let chatMsgHeaderEl = document.createElement("header");
    let chatMsgTimeEl = document.createElement("time");
    let chatMsgSpanEl = document.createElement("span");

    let headerContent = "";

    chatMsgTimeEl.textContent = `${("0" + NOW.getHours()).slice(-2)}:${(
        "0" + NOW.getMinutes()
    ).slice(-2)}`;

    if (RECEIVER) {
        chatMsgEl.setAttribute("class", "received");
        headerContent = `${SENDER} `;
    } else {
        chatMsgEl.setAttribute("class", "sent");
    }

    chatMsgHeaderEl.innerHTML = headerContent;
    chatMsgSpanEl.textContent = `${MSG}`;

    chatMsgHeaderEl.appendChild(chatMsgTimeEl);
    chatMsgEl.appendChild(chatMsgHeaderEl);
    chatMsgEl.appendChild(chatMsgSpanEl);

    document.getElementById("chat-messages").appendChild(chatMsgEl);
}
