const CONN = new signalR.HubConnectionBuilder()
    .withUrl("/gameHub")
    .withAutomaticReconnect()
    .withStatefulReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

CONN.onclose((error) => {
    console.assert(CONN.state === signalR.HubConnectionState.Disconnected);
    console.error(
        error == undefined
            ? "Connection to hub was closed and reconnection failed. This may be due to a server error or shutdown."
            : `Connection to hub was closed and reconnection failed. The following error occurred: ${error}`,
    );
});

CONN.onreconnecting(() => {
    console.assert(CONN.state === signalR.HubConnectionState.Reconnecting);
    console.log("Reconnecting to hub...");
});

CONN.onreconnected((CONN_ID) => {
    console.assert(CONN.state === signalR.HubConnectionState.Connected);
    console.log(
        `Connection to hub reestablished. Reconnected with connection id: '${CONN_ID}'`,
    );

    handlePossibleDisconnectedPlayer();
});

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

CONN.on("GameStart", (USERNAME, CONN_ID, NUM_ROUNDS, dJsonStr, pJsonStr) => {
    username = USERNAME;

    sessionStorage.setItem("playerUsername", USERNAME);
    sessionStorage.setItem("playerConnId", CONN_ID);
    loadGame(NUM_ROUNDS, JSON.parse(dJsonStr), JSON.parse(pJsonStr));
});

CONN.on("GameReload", (USERNAME, NEW_CONN_ID, NUM_ROUNDS, dJsonStr, pJsonStr) => {
    username = USERNAME;

    sessionStorage.setItem("playerConnId", NEW_CONN_ID);
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
    newRound(NUM_ROUNDS, JSON.parse(dJsonStr), JSON.parse(pJsonStr)),
);

CONN.on("ReceiveLogMessage", (MSG, ACTION, RECORD, OTHER, SETTING_CHANGE) =>
    generateLogMessage(MSG, ACTION, RECORD, OTHER, SETTING_CHANGE),
);

CONN.on("ReceiveChatMessage", (SENDER, MSG, RECEIVER) =>
    generateChatMessage(SENDER, MSG, RECEIVER),
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

async function startHubConnection() {
    try {
        let timeElapsed = 0;

        console.log("Connecting to hub...");
        CONN.start();
        while (CONN.state !== signalR.HubConnectionState.Connected) {
            await sleep(500);
            timeElapsed += 500;

            if (timeElapsed >= 30000) {
                throw "Failed to connect to hub. Reattempting...";
            }
        }
        console.log("Connected to hub");
    } catch (error) {
        console.error(error);
        startHubConnection();
    }
}

async function reconnectPlayer(USERNAME, OLD_CONN_ID) {
    try {
        console.log("Reconnecting to game...");
        await CONN.invoke("ReconnectPlayer", USERNAME, OLD_CONN_ID);
    } catch (error) {
        console.error(
            `Unable to be reconnected to game due to error: ${error}`,
        );
    }
}

async function handlePossibleDisconnectedPlayer() {
    const USERNAME = sessionStorage.getItem("playerUsername");
    const OLD_CONN_ID = sessionStorage.getItem("playerConnId");

    if (USERNAME != null && OLD_CONN_ID != null) {
        await reconnectPlayer(USERNAME, OLD_CONN_ID);
    } else {
        enableRegistration();
    }
}

window.addEventListener("load", async () => {
    await startHubConnection();
    initialiseGame();
    await handlePossibleDisconnectedPlayer();
});

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