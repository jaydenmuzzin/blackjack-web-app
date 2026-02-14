namespace Blackjack
{
    public class Game
    {
        private static int numRounds = 0;
        private static List<Player> Players { get; set; } = [];
        private static Dealer Dealer { get; set; }
        private static CardShuffler CS { get; set; }

        public static InitialDeal NewRound()
        {
            numRounds++;

            if (numRounds > 1)
            {
                CS.RetrieveCards(Players, Dealer);
            }
            
            if (CS.RestockRequired())
            {               
                CS.Restock();
            }

            Console.WriteLine("Round " + numRounds);

            Players.ForEach(p => {
               p.AddToHand(CS.Deal());
            });
            Dealer.AddToHand(CS.Deal());
            
            Players.ForEach(p => {
               p.AddToHand(CS.Deal());
            });

            Dealer.CheckBlackjack(CS.Deal());
            Players.ForEach(p => {
               p.CheckBlackjack();
            });        

            return new InitialDeal(numRounds, Dealer, Players);
        }

        public static Player Hit(int playerNum) {
            Player player = Players[playerNum];

            Console.WriteLine();
            player.AddToHand(CS.Deal());
            Console.WriteLine();
            player.ShowHand();

            if (player.HandValue > 21)
            {
                Console.WriteLine("BUST");
            }
            
            return player;
        }

        public static Dealer DealerTurn() {
            Console.WriteLine("\nPlayer/s have been dealt\n");
            Console.WriteLine("Dealer's turn");

            Dealer.AddToHand(Dealer.HoleCard);

            Console.WriteLine();

            Dealer.ShowHand();
            Dealer.CheckBlackjack();

            if (!Dealer.Blackjack)
            {
                Dealer.Turn(CS);
            }

            return Dealer;
        }

        public static Dictionary<string, Record> DetermineResults() {
            var results = new Dictionary<string, Record>();
            List<RoundResult> playerRoundResults = [];

            for (int i = 0; i < Players.Count; i++)
            {
                Player.DetermineResult(Players[i], Dealer);
                Record pr = Players[i].GetRecord();
                results.Add($"Player{i}", pr);
                playerRoundResults.Add(pr.RoundResult);
                results.Add($"DealerPerPlayer{i}", Dealer.GetRecord());
            }

            Dealer.DetermineOverallResult(playerRoundResults);

            results.Add("DealerPerRound", Dealer.GetOverallRecord());

            return results;
        }

        public static InitialDeal Start(int numPlayers)
        {
            Dealer = new Dealer();

            for (int i = 0; i < numPlayers; i++)
            {
                Players.Add(new Player());
            }

            CS = new CardShuffler(Settings.NumDecks);

            numRounds = 0;

            Console.WriteLine();
            Console.WriteLine("---------------------------------");
            Console.WriteLine();
            Console.WriteLine("New game started!");
            Console.WriteLine();

            return NewRound();            
        }

        public static Player GetPlayer(int playerNum)
        {
            return Players[playerNum];
        }
    }
}
