namespace Blackjack
{
    public enum ThemeName
    {
        Default,
        Inverse,
        Casino
    }

    public static class Settings
    {
        public static int DefNumDecks { get; } = 5;

        public static int NumDecks { get; set; } = DefNumDecks;
    }
}
