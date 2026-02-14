using Microsoft.AspNetCore.SignalR;

using System.Collections.Concurrent;
using System.Web;

namespace Blackjack {
    public record RegPlayer(string ConnectionId, int Number);

    public class GameHub : Hub
    {
        private static readonly ConcurrentDictionary<string, RegPlayer> RegisteredPlayers = new();
        private static readonly ConcurrentDictionary<string, GamePlayer> GamePlayers = new();
        private static readonly int playerLimit = 5;
        private static int playerNumber = 1;
        private static int playerTurn = 0;
        private static readonly List<int> posOfBlackJacks = [];
        private static int playerBusts = 0;
        private static bool dealerBlackjack = false;

        private static GamePlayer GetTurnPlayer()
        {   
            if (GamePlayers.TryGetValue(playerTurn.ToString(), out GamePlayer? p))
            {
                return p;
            }

            throw new NullReferenceException($"Player doesn't exist. No player has a position of {playerTurn}");
        }

        private async void InitialiseRound(InitialDeal id)
        {
            await Clients.All.SendAsync("ReceiveLogMessage", $"Round {id.numRounds} begun!");

            for (int i = 0; i < id.Players.Count; i++)
            {
                if (id.Players[i].Blackjack)
                {
                    GamePlayers.TryGetValue((i + 1).ToString(), out GamePlayer? bgp);

                    if (bgp is not null)
                    {
                        await Clients.Client(bgp.ConnectionId).SendAsync("ReceiveLogMessage", "You got Blackjack!");
                        posOfBlackJacks.Add(i + 1);
                    }
                    else
                    {
                        throw new NullReferenceException($"Player in position {i + 1} with blackjack failed to be retrieved");
                    }
                }                
            }

            posOfBlackJacks.ForEach(async x => {
                GamePlayers.TryGetValue(x.ToString(), out GamePlayer? bgp);
                
                if (bgp is not null)
                {
                    await Clients.AllExcept(bgp.ConnectionId).SendAsync("ReceiveLogMessage", $"{bgp.Username} got Blackjack!", false, false, true);
                }
            });

            if (id.Dealer.Blackjack)
            {
                dealerBlackjack = true;

                await Clients.All.SendAsync("ReceiveLogMessage", "Dealer got Blackjack!");
            }
            
            await BeginNextTurn();
        }

        // public override Task OnConnectedAsync()
        // {
        //     return base.OnConnectedAsync();
        // }

        public override Task OnDisconnectedAsync(Exception? e)
        {
            RegisteredPlayers.Clear();
            GamePlayers.Clear();
            playerNumber = 1;
            playerTurn = 0;
            posOfBlackJacks.Clear();
            playerBusts = 0;
            dealerBlackjack = false;

            return base.OnDisconnectedAsync(e);
        }

        public async void RegisterPlayer(string username)
        {
            try
            {
                if (RegisteredPlayers.Count < 5)
                {
                    if (string.IsNullOrWhiteSpace(username))
                    {
                        Console.WriteLine("Player not registered because the username was blank");
                        await Clients.Caller.SendAsync("PlayerNotRegistered", "Username cannot be blank. Please enter one.");
                    }
                    else
                    {
                        if (Utilities.ContainsBannedWord(username))
                        {
                            Console.WriteLine("Player not registered because the username contains banned word/s and is disallowed");
                            await Clients.Caller.SendAsync("PlayerNotRegistered", "Username disallowed. Please enter one without profanity.");
                        }
                        else
                        {
                            string processedUsername = Utilities.ProcessText(username);
                        
                            if (RegisteredPlayers.TryAdd(processedUsername, new RegPlayer( 
                                    Context.ConnectionId,
                                    playerNumber++
                                )))
                            {
                                Console.WriteLine($"{processedUsername} registered");
                                
                                await Clients.Caller.SendAsync("PlayerRegistered", processedUsername);
                                await Clients.Others.SendAsync("AnotherPlayerRegistered", processedUsername, RegisteredPlayers.Count < playerLimit);
                            }
                            else
                            {
                                Console.WriteLine($"{processedUsername} not registered because it has already been taken");
                                await Clients.Caller.SendAsync("PlayerNotRegistered", "Username already registered. Please select another one.");
                            }
                        }
                    }
                }
                else
                {
                    Console.WriteLine($"{Utilities.ProcessText(username)} not registered because the player limit has been reached");
                    await Clients.Caller.SendAsync("PlayerNotRegistered", "Maximum players registered. You will be a watcher when the game starts.\n\nPlease reload if you would like to play.");
                }
            }
            catch (Exception e)
            {
                await Clients.Caller.SendAsync("Error", $"New player failed to be registered due to a server error: {e.Message}");
                throw;
            }
        }
    
        public async Task Start(string usernames)
        {
            try 
            {
                List<string>? playerUsernames = Utilities.DeserializeObject<List<string>>(HttpUtility.HtmlDecode(usernames));

                if (playerUsernames is not null)
                {
                    List<int> playerNumbers = [];
              
                    foreach (var username in RegisteredPlayers.Keys)
                    {
                        RegisteredPlayers.TryGetValue(username, out RegPlayer? regPlayer);

                        if (regPlayer is not null)
                        {
                            playerNumbers.Add(regPlayer.Number);
                        }
                    }

                    var regPlayersNumbers = RegisteredPlayers.Keys.Zip(playerNumbers).OrderBy(i => i.Second).ToList();

                    foreach (string? username in playerUsernames)
                    {
                        if (RegisteredPlayers.TryGetValue(username, out RegPlayer? regPlayer))
                        {
                            var (Username, Number) = regPlayersNumbers.FirstOrDefault(x => x.First == username);
                            
                            if (GamePlayers.TryAdd(Number.ToString(), new GamePlayer(Number, Username, regPlayer.ConnectionId)))
                            {
                                Console.WriteLine($"{username} added");
                            }
                            else
                            {
                                if (GamePlayers.TryGetValue(regPlayersNumbers.FirstOrDefault(x => x.First == username).Second.ToString(), out GamePlayer? player))
                                {
                                    throw new HubException($"Desired player {username} has already registered as {player.Username}");
                                }
                            }
                        }
                        else
                        {
                            throw new NullReferenceException($"{username} is not registered.");
                        }
                    }
                }
                else
                {
                    throw new NullReferenceException("Failed to deserialize player usernames as playerUsernames variable is null.");
                }

                await Task.FromResult(Game.Start(GamePlayers.Count)).ContinueWith(async tid => {
                    InitialDeal id = tid.Result;

                    foreach (KeyValuePair<string, GamePlayer> kvp in GamePlayers)
                    {
                        await Clients.Client(kvp.Value.ConnectionId).SendAsync("GameStart", kvp.Value.Username, id.numRounds, Utilities.Serialize(id.Dealer), Utilities.Serialize(id.Players[kvp.Value.Position - 1]));
                    }

                    await Clients.All.SendAsync("ReceiveLogMessage", "Game started!");
                
                    InitialiseRound(id);
                });
            }
            catch (Exception e)
            {  
                await Clients.All.SendAsync("Error", $"Game not started: {e.Message}");
                throw;
            }
        }

        public async Task BeginNextTurn()
        {
            try
            {
                if (dealerBlackjack)
                {
                    await PerformDealerTurn();
                }
                else
                {
                    playerTurn++;

                    if (playerTurn > 1)
                    {
                        if (Task.FromResult(Game.GetPlayer(playerTurn - 2)).Result.HandValue > 21)
                        {
                            playerBusts++;
                        }
                    }

                    while (posOfBlackJacks.Contains(playerTurn))
                    {
                        playerTurn++;
                    }

                    if (playerTurn > GamePlayers.Count)
                    {
                        await PerformDealerTurn();
                    }
                    else
                    {
                        GamePlayer tp = GetTurnPlayer();

                        if (tp is not null)
                        {
                            await Clients.Client(tp.ConnectionId).SendAsync("Turn");
                            await Clients.AllExcept(tp.ConnectionId).SendAsync("Another's Turn", $"{tp.Username}");
                            
                            await SendLogMessage(tp, "Your turn!", true);

                            for (int i = 1; i <= GamePlayers.Count; i++)
                            {
                                GamePlayers.TryGetValue(i.ToString(), out GamePlayer? gp);

                                if (gp != tp)
                                {
                                    await SendLogMessage(gp, $"{tp.Username}'s turn!", false , false, true);
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception e)
            {
                await Clients.All.SendAsync("Error", $"Failed to begin next player's turn: {e.Message}");
                throw;
            }
        }

        public async Task PerformHit()
        {
            try
            {
                Task<Player> tp = Task.FromResult(Game.Hit(playerTurn - 1));

                await Clients.Caller.SendAsync("Hit", Utilities.Serialize(tp.Result));
            }
            catch (Exception e)
            {
                await Clients.All.SendAsync("Error", $"Hit failed due to: {e.Message}");
                throw;
            }
        }

        public async Task SendTurnPlayerStatus(string status)
        {
            GamePlayer turnPlayer = GetTurnPlayer();

            Console.WriteLine();
            Console.WriteLine($"{turnPlayer.Username} {status}");

            for (int i = 1; i <= GamePlayers.Count; i++)
            {
                GamePlayers.TryGetValue(i.ToString(), out GamePlayer? gp);
                await SendLogMessage(gp, $"{(gp == turnPlayer ? "You" : turnPlayer.Username)} {status}", true);
            }
        }

        public async Task PerformDealerTurn()
        {
            try
            {
                bool perform = !dealerBlackjack && posOfBlackJacks.Count + playerBusts < GamePlayers.Count;

                playerTurn = GamePlayers.Count;

                await Clients.All.SendAsync("DealerTurn", Utilities.Serialize(perform ? Task.FromResult(Game.DealerTurn()).Result : null), perform);

                if (perform)
                {
                    Console.WriteLine("Dealer's turn performed\n");
                    
                    for (int i = 1; i <= GamePlayers.Count; i++)
                    {
                        GamePlayers.TryGetValue(i.ToString(), out GamePlayer? gp);
                        await SendLogMessage(gp, "Dealer's turn", true, false, false, false, true);
                    }
                }
            }
            catch (Exception e)
            {
                await Clients.All.SendAsync("Error", $"Dealer's turn failed due to: {e.Message}");
                throw;
            }
        }

        public async Task DetermineResults()
        {
            try
            {
                if (Context.ConnectionId == GetTurnPlayer().ConnectionId)
                {
                    Dictionary<string, Record> results = Task.FromResult(Game.DetermineResults()).Result;
                    Dictionary<string, Record?> dealerRecordLogs = [];

                    Console.WriteLine("Results determined\n");

                    for (int i = 1; i <= GamePlayers.Count; i++)
                    {
                        GamePlayers.TryGetValue(i.ToString(), out GamePlayer? gp);

                        if (gp is not null)
                        {
                            results.TryGetValue($"{(gp.DealerRecordPerRound ? "DealerPerRound" : $"DealerPerPlayer{i-1}")}", out Record? dr);
                            dealerRecordLogs.Add(gp.ConnectionId, dr);

                            results.TryGetValue($"Player{i-1}", out Record? pRecord);

                            await Clients.Client(gp.ConnectionId).SendAsync("Results", Utilities.Serialize(pRecord));
                        }
                        else
                        {
                            throw new NullReferenceException($"Player in position {i} failed to be retrieved to send them their statistics for displaying");
                        }
                    }

                    await Task.Delay(2500);

                    for (int j = 1; j <= GamePlayers.Count; j++)
                    {
                        results.TryGetValue($"Player{j-1}", out Record? s);
                        GamePlayers.TryGetValue(j.ToString(), out GamePlayer? gp);

                        if (gp is not null)
                        {
                            await SendLogMessage(gp, "You|" + Utilities.Serialize(s), false, true);
                        }
                        else
                        {
                            throw new NullReferenceException($"Player in position {j} failed to be retrieved to send them their record for logging");
                        }
                    }

                    for (int k = 1; k <= GamePlayers.Count; k++)
                    {
                        results.TryGetValue($"Player{k-1}", out Record? kpr);
                        GamePlayers.TryGetValue(k.ToString(), out GamePlayer? kgp);

                        if (kgp is not null)
                        {
                            for (int l = 1; l <= GamePlayers.Count; l++)
                            {
                                GamePlayers.TryGetValue(l.ToString(), out GamePlayer? lgp);
                                
                                if (l != k)
                                {
                                    await SendLogMessage(lgp, $"{kgp.Username}|" + Utilities.Serialize(kpr), false, true, true);
                                }
                            }
                        }
                        else
                        {
                            throw new NullReferenceException($"Player in position {k} failed to be retrieved to send their record to others for logging");
                        }
                    }

                    for (int m = 1; m <= GamePlayers.Count; m++)
                    {
                        GamePlayers.TryGetValue(m.ToString(), out GamePlayer? mgp);

                        if (mgp is not null)
                        {
                            dealerRecordLogs.TryGetValue(mgp.ConnectionId, out Record? dr);

                            await SendLogMessage(mgp, $"Dealer|" + Utilities.Serialize(dr), false, true, false, false, true);
                        }
                        else
                        {
                            throw new NullReferenceException($"Player in position {m} failed to be retrieved to send them the dealer's record for logging");
                        }
                    }

                    await Clients.All.SendAsync("ReceiveLogMessage", "Round ended!");
                    await Clients.Client(GetTurnPlayer().ConnectionId).SendAsync("PromptNextRound");
                }
            }
            catch (Exception e)
            {
                await Clients.All.SendAsync("Error", $"Results failed to be determined due to: {e.Message}");
                throw;
            }
        }

        public async Task BeginNewRound()
        {
            try
            {
                posOfBlackJacks.Clear();
                dealerBlackjack = false;
                playerBusts = 0;
                playerTurn = 0; // BeginNextTurn sets playerTurn to 1 to perform the first turn of the new round

                await Task.FromResult(Game.NewRound()).ContinueWith(async tid => {
                    InitialDeal id = tid.Result;
                    
                    foreach (KeyValuePair<string, GamePlayer> kvp in GamePlayers)
                    {
                        await Clients.Client(kvp.Value.ConnectionId).SendAsync("NewRound", id.numRounds, Utilities.Serialize(id.Dealer), Utilities.Serialize(id.Players[kvp.Value.Position - 1]));
                    }

                    InitialiseRound(id);
                });
            }
            catch (Exception e)
            {
                await Clients.All.SendAsync("Error", $"New round not started: {e.Message}");
                throw;
            }
        }

        public async Task UpdateSetting(string setting, bool enabled)
        {
            try
            {
                var gamePlayer = GamePlayers.FirstOrDefault(x => x.Value.ConnectionId == Context.ConnectionId).Value;

                if (gamePlayer is not null)
                {
                    string updateMsg = $"{gamePlayer.GetUserFriendlySettingName(setting)} have been {(enabled ? "enabled" : "disabled")}";

                    switch(setting)
                    {
                        case nameof(gamePlayer.ActionLogMsgsEnabled): gamePlayer.SetActionLogMsgsEnabled(enabled); break;
                        case nameof(gamePlayer.DealerRecordLogMsgsEnabled): gamePlayer.SetDealerRecordLogMsgsEnabled(enabled); break;
                        case nameof(gamePlayer.DealerRecordPerRound): gamePlayer.SetDealerRecordPerRound(enabled && gamePlayer.DealerRecordLogMsgsEnabled); break;
                        case nameof(gamePlayer.OthersLogMsgsEnabled): gamePlayer.SetOthersLogMsgsEnabled(enabled); break;
                        case nameof(gamePlayer.OthersRecordsLogMsgsEnabled): gamePlayer.SetOthersRecordsLogMsgsEnabled(enabled && gamePlayer.OthersLogMsgsEnabled); break;
                        default: throw new ArgumentException($"Setting {setting} intended for update is not supported.");
                    }

                    if (setting == nameof(gamePlayer.DealerRecordPerRound))
                    {
                        updateMsg = $"{gamePlayer.GetUserFriendlySettingName(setting)} will now display according to each {(gamePlayer.DealerRecordPerRound ? "ROUND" : "PLAYER")}";
                    }

                    await Clients.Caller.SendAsync("ReceiveLogMessage", updateMsg, false, false, false, true);
                }
                else
                {
                    throw new NullReferenceException($"Player with connection ID ${Context.ConnectionId} failed to be retrieved to update their setting");
                }
            }
            catch (Exception e)
            {
                await Clients.Caller.SendAsync("Error", $"Setting failed to update: {e.Message}");
                throw;
            }
        }

        public async Task SendLogMessage(GamePlayer? gp, string message, bool isActionMsg = false, bool isRecordMsg = false, bool isOthersMsg = false, bool isSettingChangeMsg = false, bool isDealerMsg = false)
        {
            try
            {
                if (gp is not null)
                {
                    if (isActionMsg)
                    {
                        if (!gp.ActionLogMsgsEnabled)
                        {
                            return;
                        }
                    }

                    if (isRecordMsg)
                    {
                        if (isDealerMsg)
                        {
                            if (!gp.DealerRecordLogMsgsEnabled)
                            {
                                return;
                            }
                        }

                        if (isOthersMsg)
                        {
                            if (!gp.OthersLogMsgsEnabled || !gp.OthersRecordsLogMsgsEnabled)
                            {
                                return;
                            }
                        }
                    }

                    if (isOthersMsg)
                    {
                        if (!gp.OthersLogMsgsEnabled)
                        {
                            return;
                        }
                    }

                    if (isActionMsg)
                    {
                        if (!gp.ActionLogMsgsEnabled)
                        {
                            return;
                        }
                    }

                    await Clients.Client(gp.ConnectionId).SendAsync("ReceiveLogMessage", message, isActionMsg, isRecordMsg, isOthersMsg, isSettingChangeMsg);
                }
                else
                {
                    throw new NullReferenceException($"Player failed to be retrieved to determine sending of message");
                }
            }
            catch (Exception e)
            {
                await Clients.All.SendAsync("Error", $"Failure in sending log message: {e.Message}");
                throw;
            }
        }

        public async Task SendChatMessage(string sender, string message)
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(message))
                {         
                    string processedMessage = Utilities.ProcessText(message);
                    
                    await Clients.Caller.SendAsync("ReceiveChatMessage", sender, processedMessage, false);
                    await Clients.Others.SendAsync("ReceiveChatMessage", sender, processedMessage, true);
                }
            }
            catch (Exception e)
            {
                await Clients.All.SendAsync("Error", $"Failure in sending chat message: {e.Message}");
                throw;
            }
        }
    }
}