import { fetchTranscript } from "youtube-transcript/dist/youtube-transcript.esm.js";

const browserLikeFetch = (input, init = {}) =>
  fetch(input, {
    ...init,
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      "accept-language": "en-US,en;q=0.9,pl;q=0.8",
      ...(init.headers || {})
    }
  });

function extractVideoId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
    return null;
  } catch {
    return null;
  }
}

export const youtubeTranscriptProvider = {
  async getTranscript(youtubeUrl) {
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    const attempts = [
      { target: youtubeUrl, config: { fetch: browserLikeFetch } },
      { target: videoId, config: { fetch: browserLikeFetch } },
      { target: videoId, config: { lang: "en", fetch: browserLikeFetch } },
      { target: videoId, config: { lang: "pl", fetch: browserLikeFetch } }
    ];

    let transcript = null;
    let lastError;

    for (const attempt of attempts) {
      try {
        transcript = await fetchTranscript(attempt.target, attempt.config);
        if (transcript && transcript.length > 0) {
          break;
        }
      } catch (error) {
        lastError = error;
      }
    }

    if (!transcript || transcript.length === 0) {
      throw new Error(lastError?.message || "Transcript unavailable");
    }

    return transcript.map((segment) => segment.text).join(" ");
  }
};
