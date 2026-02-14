namespace Blackjack
{
    public record Record(RoundResult RoundResult, RoundResult DealerRoundResult, int Wins, int Draws, int Losses, int Busts);
}