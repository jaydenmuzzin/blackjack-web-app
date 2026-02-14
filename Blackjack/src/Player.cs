namespace Blackjack
{
    public enum RoundResult
    {
        Won,
        Lost,
        Drew
    }

    public class Player
    {
        protected int wins = 0;
        protected int draws = 0;
        protected int losses = 0;
        protected int busts = 0;

        private RoundResult roundResult;
        private RoundResult dealerRoundResult;

        private bool softAce = false;

        public List<Card> Hand { get; private set; } = new List<Card>();
        public int HandValue { get; private set; } = 0;
        public bool Blackjack { get; protected set; } = false;

        public static void DetermineResult(Player player, Dealer dealer)
        {
            if (dealer.Blackjack)
            {
                if (player.Blackjack)
                {
                    Console.WriteLine("TIE!\n");
                    player.draws++;
                    player.roundResult = RoundResult.Drew;
                    dealer.draws++;
                    player.dealerRoundResult = RoundResult.Drew;
                }
                else
                {
                    Console.WriteLine("Player LOSES!\n");
                    player.losses++;
                    player.roundResult = RoundResult.Lost;
                    dealer.wins++;
                    player.dealerRoundResult = RoundResult.Won;
                }
            }
            else
            {
                if (player.HandValue <= 21)
                {
                    if (player.HandValue > dealer.HandValue || dealer.HandValue > 21)
                    {
                        Console.WriteLine("Player WINS!\n");
                        player.wins++;
                        player.roundResult = RoundResult.Won;
                        dealer.losses++;
                        player.dealerRoundResult = RoundResult.Lost;

                        if (dealer.HandValue > 21)
                        {
                            dealer.busts++;
                        }
                    }
                    else if (player.HandValue < dealer.HandValue && dealer.HandValue <= 21)
                    {
                        Console.WriteLine("Player LOSES!\n");
                        player.losses++;
                        player.roundResult = RoundResult.Lost;
                        dealer.wins++;
                        player.dealerRoundResult = RoundResult.Won;
                    }
                    else
                    {
                        Console.WriteLine("TIE!\n");
                        player.draws++;
                        player.roundResult = RoundResult.Drew;
                        dealer.draws++;
                        player.dealerRoundResult = RoundResult.Drew;
                    }
                }
                else
                {
                    Console.WriteLine("Player LOSES!\n");
                    player.busts++;
                    player.losses++;
                    player.roundResult = RoundResult.Lost;
                    dealer.wins++;
                    player.dealerRoundResult = RoundResult.Won;
                }
            }
        }

        private void AddCardValue(string rank)
        {
            if (int.TryParse(rank, out int value))
            {
                HandValue += value;
            }
            else if (rank == "K" || rank == "Q" || rank == "J" || rank == "T")
            {
                HandValue += 10;
            }
            else
            {
                if (HandValue < 11 && !softAce)
                {
                    HandValue += 11;
                    softAce = true;
                }
                else
                {
                    HandValue++;
                }
            }

            // Change ace in hand (if one) with value of 11 to 1 if hand would bust
            if (HandValue > 21 && softAce)
            {
                HandValue -= 10;
                softAce = false;
            }
        }

        public void AddToHand(Card card, bool faceUp = true)
        {
            if (card != null)
            {
                Hand.Add(card);

                Console.Write("Dealt " + GetType().Name + " card");

                if (faceUp)
                {
                    Console.WriteLine(": " + card.ToString());
                }

                AddCardValue(card.Rank);               
            }
        }

        public void ShowHand()
        {
            Console.WriteLine(GetType().Name + "'s hand is: ");

            foreach (Card card in Hand)
            {
                Console.WriteLine(card.ToString());
            }

            Console.WriteLine("(" + HandValue + ")\n");
        }

        public void CheckBlackjack()
        {
            if (HandValue == 21)
            {
                Console.WriteLine("\nBLACKJACK!\n");
                Blackjack = true;
            }
        }

        public void RetrieveHand()
        {
            Hand.Clear();
            HandValue = 0;
            Blackjack = false;
            softAce = false;
        }

        public Record GetRecord()
        {
            Console.WriteLine(GetType().Name + " Record:");
            Console.WriteLine("W: " + wins);
            Console.WriteLine("D: " + draws);
            Console.WriteLine("L: " + losses);
            Console.WriteLine("B: " + busts + "\n");
            return new Record(roundResult, dealerRoundResult, wins, draws, losses, busts);
        }
    }

    public class Dealer : Player
    {
        public Card? HoleCard;
        private int overallWins = 0;
        private int overallDraws = 0;
        private int overallLosses = 0;
        private int overallBusts = 0;
        private int bustTally = 0;

        private RoundResult overallRoundResult;

        public void CheckBlackjack(Card card) {
            if (Hand.Count == 1)
            {
                if (HandValue >= 10)
                {
                    if (HandValue == 10)
                    {
                        if (card.Rank == "A")
                        {
                            AddToHand(card);
                        }
                        else
                        {
                            HoleCard = card;
                        }
                    }
                    else if (HandValue == 11)
                    {
                        if (card.Rank == "K" || card.Rank == "Q" || card.Rank == "J" || card.Rank == "T")
                        {
                            AddToHand(card);
                        }
                        else
                        {
                            HoleCard = card;
                        }
                    }
                    else
                    {
                        throw new ArithmeticException("Hand consisting of one card cannot exceed a value of 11");
                    }
                }
                else
                {
                    HoleCard = card;
                }

                CheckBlackjack(); 
            }
            else
            {
                throw new InvalidOperationException("Hand must contain one card");
            }
        }

        public void Turn(CardShuffler cs)
        {             
            if (HandValue < 17)
            {
                do
                {
                    Console.WriteLine("Dealer hits");
                    AddToHand(cs.Deal());
                    Console.WriteLine();
                    ShowHand();

                    if (HandValue > 21)
                    {
                        Console.WriteLine("BUST\n");
                    }
                    else if (HandValue > 17)
                    {
                        Console.WriteLine("Dealer stands.\n");
                    }
                }
                while (HandValue < 17);
            }
            else
            {
                Console.WriteLine("Dealer stands.\n");
            }
        }

        public void DetermineOverallResult(List<RoundResult> playerRoundResults)
        {
            int numPlayerWins = playerRoundResults.Where(x => x.Equals(RoundResult.Won)).Count();
            int numPlayerDraws = playerRoundResults.Where(x => x.Equals(RoundResult.Drew)).Count();
            int numPlayerLosses = playerRoundResults.Where(x => x.Equals(RoundResult.Lost)).Count();

            int bustsThisRound = busts - bustTally;
            bustTally = busts;

            if (numPlayerWins > numPlayerDraws)
            {
                if (numPlayerWins > numPlayerLosses)
                {
                    overallLosses++;
                    overallRoundResult = RoundResult.Lost;

                    if (bustsThisRound > numPlayerWins / 2)
                    {
                        overallBusts++;
                    }
                }
                else
                {
                    if (numPlayerWins == numPlayerLosses)
                    {
                        overallDraws++;
                        overallRoundResult = RoundResult.Drew;
                    }
                    else
                    {
                        overallWins++;
                        overallRoundResult = RoundResult.Won;
                    }
                }
            }
            else 
            {
                if (numPlayerLosses > numPlayerWins)
                {
                    if (numPlayerLosses >= numPlayerDraws)
                    {
                        overallWins++;
                        overallRoundResult = RoundResult.Won;
                    }
                    else
                    {
                        overallDraws++;
                        overallRoundResult = RoundResult.Drew;
                    }
                }
                else
                {
                    if (numPlayerLosses == numPlayerWins)
                    {
                        overallDraws++;
                        overallRoundResult = RoundResult.Drew;
                    }
                    else
                    {
                        overallLosses++;
                        overallRoundResult = RoundResult.Lost;

                        if (bustsThisRound > numPlayerWins / 2)
                        {
                            overallBusts++;
                        }
                    }
                }
            }
        }

        public new Record GetRecord()
        {
            return new Record(overallRoundResult, overallRoundResult, wins, draws, losses, busts);
        }

        public Record GetOverallRecord()
        {
            Console.WriteLine("Dealer Record:");
            Console.WriteLine("W: " + overallWins);
            Console.WriteLine("D: " + overallDraws);
            Console.WriteLine("L: " + overallLosses);
            Console.WriteLine("B: " + overallBusts + "\n");
            return new Record(overallRoundResult, overallRoundResult, overallWins, overallDraws, overallLosses, overallBusts);
        }
    }
}
