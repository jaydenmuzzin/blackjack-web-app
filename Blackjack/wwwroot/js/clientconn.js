const CONN = new signalR.HubConnectionBuilder()
    .withUrl("/gameHub")
    .withAutomaticReconnect()
    .withStatefulReconnect()
    .build();

CONN.on("PlayerNotRegistered", (REASON) => playerNotRegistered(REASON));

CONN.on("PlayerRegistered", () => {
    (async () => {
        await generatePotentialPlayer();
        await generateStartButton();
    })();
});

CONN.on("AnotherPlayerRegistered", (REG_USERNAME, canRegisterAnother) => {
    (async () => {
        try {
            const CLIENT_REGISTERED = await addUsername(REG_USERNAME);

            if (!CLIENT_REGISTERED) {
                if (canRegisterAnother) {
                    generateRegisterNewPlayer();
                } else {
                    displayLimitReachedMsg();
                }
            }
        } catch (err) {
            console.error(err);
        }
    })();
});

CONN.on("GameStart", (USERNAME, NUM_ROUNDS, dJsonStr, pJsonStr) => {
    username = USERNAME;
    loadGame(NUM_ROUNDS, JSON.parse(dJsonStr), JSON.parse(pJsonStr));
});

CONN.on("Turn", () => turn());

CONN.on("Another's Turn", (TURN_USERNAME) => {
    (async () => {
        try {
            await delay(anotherTurn, 500, TURN_USERNAME);
        } catch (err) {
            console.error(err);
        }
    })();
});

CONN.on("Hit", (pJsonStr) => {
    const PLAYER = JSON.parse(pJsonStr);

    (async () => {
        try {
            await hit(PLAYER);
            await CONN.invoke("SendTurnPlayerStatus", "hit");

            if (PLAYER.HandValue > 21) {
                CONN.invoke("SendTurnPlayerStatus", "BUST!");
                CONN.invoke("BeginNextTurn");
            }
        } catch (err) {
            console.error(err);
        }
    })();
});

CONN.on("DealerTurn", (dJsonStr, PERFORM) => {
    (async () => {
        try {
            document.getElementsByClassName("player-actions")[0].innerHTML = "";

            if (PERFORM) {
                await dealersTurn(JSON.parse(dJsonStr));
            }

            CONN.invoke("DetermineResults");
        } catch (err) {
            console.error(err);
        }
    })();
});

CONN.on("Results", (pJsonStr) => {
    const PLAYER_RECORD = JSON.parse(pJsonStr);
    (async () => {
        try {
            await displayResults(PLAYER_RECORD);
            displayRecord(PLAYER_RECORD);
        } catch (err) {
            console.error(err);
        }
    })();
});

CONN.on("PromptNextRound", () => {
    (async () => {
        try {
            await sleep(500);
            generateNextRoundBtn();
        } catch (err) {
            console.error(err);
        }
    })();
});

CONN.on("NewRound", (NUM_ROUNDS, dJsonStr, pJsonStr) =>
    newRound(NUM_ROUNDS, JSON.parse(dJsonStr), JSON.parse(pJsonStr))
);

CONN.on("ReceiveLogMessage", (MSG, ACTION, RECORD, OTHER, SETTING_CHANGE) =>
    generateLogMessage(MSG, ACTION, RECORD, OTHER, SETTING_CHANGE)
);

CONN.on("ReceiveChatMessage", (SENDER, MSG, RECEIVER) =>
    generateChatMessage(SENDER, MSG, RECEIVER)
);

CONN.on("Error", (MSG) => {
    let gameContEl = document.getElementById("game-container");
    if (document.body.contains(gameContEl)) {
        gameContEl.setAttribute("class", "d-none");
    }

    let errMsgEl = document.createElement("p");
    errMsgEl.setAttribute("style", "white-space: preserve-breaks;");
    errMsgEl.setAttribute("class", "p-5 text-center");
    errMsgEl.textContent =
        "Game unable to be run due to a server error. Please try again.\r\n\r\nIf you keep seeing this message, sincerest apologies for the inconvenience. Report this issue if so desired and please try again later when the issue may have been resolved.";
    document.querySelector("main").appendChild(errMsgEl);
    console.error(MSG);
});

CONN.start();

document
    .getElementById("players-form")
    .addEventListener("submit", async (e) => {
        e.preventDefault();
        let USERNAMES = [];
        const FORM_DATA = new FormData(e.target);

        for (let x of FORM_DATA.values()) {
            USERNAMES.push(x);
        }

        CONN.invoke("Start", JSON.stringify(USERNAMES));
    });
