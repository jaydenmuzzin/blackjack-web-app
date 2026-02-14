
namespace Blackjack
{
    public class GamePlayer(int position, string username, string connectionId)
    {
        public int Position { get; } = position;
        public string Username { get; } = username;
        public string ConnectionId { get; } = connectionId;
        public bool ActionLogMsgsEnabled { get; private set; } = true;
        public bool DealerRecordLogMsgsEnabled { get; private set; } = true;
        public bool DealerRecordPerRound { get; private set; } = true;
        public bool OthersLogMsgsEnabled { get; private set; } = true;
        public bool OthersRecordsLogMsgsEnabled { get; private set; } = true;

        public override string ToString() => $"Position: {Position}, Username: {Username}, ConnectionId: {ConnectionId}";

        internal void SetActionLogMsgsEnabled(bool enabled)
        {
            ActionLogMsgsEnabled = enabled;
        }

        internal void SetDealerRecordLogMsgsEnabled(bool enabled)
        {
            DealerRecordLogMsgsEnabled = enabled;
        }

        internal void SetDealerRecordPerRound(bool enabled)
        {
            DealerRecordPerRound = enabled;
        }

        internal void SetOthersLogMsgsEnabled(bool enabled)
        {
            OthersLogMsgsEnabled = enabled;

            if (!OthersLogMsgsEnabled)
            {
                OthersRecordsLogMsgsEnabled = false;
            }
        }

        internal void SetOthersRecordsLogMsgsEnabled(bool enabled)
        {
            OthersRecordsLogMsgsEnabled = enabled;
        }

        internal string GetUserFriendlySettingName(string settingName)
        {
            return settingName switch
            {
                nameof(ActionLogMsgsEnabled) => "Action messages",
                nameof(DealerRecordLogMsgsEnabled) => "Round records of the dealer",
                nameof(DealerRecordPerRound) => "Round records of the dealer",
                nameof(OthersLogMsgsEnabled) => "Messages about other players",
                nameof(OthersRecordsLogMsgsEnabled) => "Round records of other players",
                _ => throw new ArgumentException($"{settingName} has no user-friendly name as it is not a supported setting")
            };
        }
    }
}