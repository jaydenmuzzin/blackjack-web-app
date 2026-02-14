using System.Runtime.Serialization.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Web;
using Censored;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace Blackjack
{
    public class Utilities
    {
        private static readonly List<string> BannedWords = [];
        private static readonly Censor Censor;

        private static readonly JsonSerializerOptions opts = new()
        {
            Converters = { new JsonStringEnumConverter() }
        };

        public static string Serialize<T>(T value)
        {
            return JsonSerializer.Serialize(value, opts);
        }

        public static T? DeserializeObject<T>(string value)
        {
            DataContractJsonSerializer ser = new(typeof(T));
            MemoryStream ms = new(Encoding.UTF8.GetBytes(value));
            object? obj = ser.ReadObject(ms);
            ms.Dispose();
            return (T?)obj;
        }

        static Utilities()
        {
            StreamReader reader = new(File.OpenRead("bannedWords.csv"));

            while (!reader.EndOfStream)
            {
                string? line = reader.ReadLine();
                if (line is not null)
                {
                    string[] words = line.Split(',');
                    foreach (string w in words){
                        BannedWords.Add(w);
                    }
                }
            }

            Censor = new(BannedWords);
        }

        public static bool ContainsBannedWord(string text)
        {
            return Censor.HasCensoredWord(text);
        }

        public static string ProcessText(string text)
        {
            return Censor.CensorText(HttpUtility.HtmlDecode(text));
        }
    }
}