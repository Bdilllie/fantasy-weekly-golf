const RAPID_API_HOST = "slash-golf-live.p.rapidapi.com";
const RAPID_API_KEY = process.env.RAPIDAPI_KEY;

type SlashScheduleItem = {
    tournId: string;
    name: string;
    dates: string;
    purse: string;
    course: string;
    defendingChamp: string;
    startData: string;
    endData: string;
};

type SlashLeaderboardPlayer = {
    playerId: string;
    name: string;
    position: string;
    total: string;
    earnings: string; // e.g. "$1,200,000"
    status: string; // "active", "cut", "wd"
};

export class SlashGolfService {
    private static getHeaders() {
        if (!RAPID_API_KEY) {
            console.warn("RAPIDAPI_KEY is missing. API calls will fail.");
        }
        return {
            "X-RapidAPI-Key": RAPID_API_KEY || "",
            "X-RapidAPI-Host": RAPID_API_HOST,
        };
    }

    static async getSchedule(year: number = 2025): Promise<SlashScheduleItem[]> {
        try {
            // Endpoint: /schedule?year=2025
            const response = await fetch(
                `https://${RAPID_API_HOST}/schedule?year=${year}`,
                {
                    headers: this.getHeaders(),
                    next: { revalidate: 86400 }, // Cache for 24 hours
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch schedule: ${response.statusText}`);
            }

            const data = await response.json();
            return data as SlashScheduleItem[];
        } catch (error) {
            console.error("Error fetching schedule:", error);
            return [];
        }
    }

    static async getLeaderboard(tournId: string, year: number = 2025): Promise<SlashLeaderboardPlayer[]> {
        try {
            // Endpoint: /leaderboard?tournId=XXX&year=2025
            const response = await fetch(
                `https://${RAPID_API_HOST}/leaderboard?tournId=${tournId}&year=${year}`,
                {
                    headers: this.getHeaders(),
                    next: { revalidate: 300 }, // Cache for 5 minutes during tournament
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
            }

            const data = await response.json();
            // The API structure might vary, adapting to common structure
            // Usually returns { leaderboard: { players: [...] } } or array
            // Assuming array based on similar APIs, but will need validation in real usage

            // Safety check for data structure
            const players = Array.isArray(data) ? data : (data.players || []);

            return players as SlashLeaderboardPlayer[];
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            return [];
        }
    }

    static async getOdds(): Promise<{ name: string; price: number }[]> {
        try {
            if (!process.env.ODDS_API_KEY) return [];

            const response = await fetch(
                `https://api.the-odds-api.com/v4/sports/golf_pga_tour/odds?regions=us&markets=outrights&oddsFormat=american&apiKey=${process.env.ODDS_API_KEY}`,
                { next: { revalidate: 3600 } }
            );

            if (!response.ok) return [];

            const data = await response.json();
            // Data is array of events. Find the one with most outcomes (outrights)
            if (Array.isArray(data) && data.length > 0) {
                // Usually index 0 is the upcoming tourney
                const outcomes = data[0]?.bookmakers[0]?.markets[0]?.outcomes || [];
                return outcomes.slice(0, 10); // Top 10
            }
            return [];
        } catch (error) {
            console.error("Error fetching odds:", error);
            return [];
        }
    }
}

