import { useEffect, useState } from "react";
import { fetchRandomStation, submitGuess } from "../services/radioService";
import Background from "../components/background/Background";

export default function GamePage() {

  const [game, setGame] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [result, setResult] = useState(null);

  // Score system
  const [score, setScore] = useState(0);

  async function loadStation() {
    try {
      const data = await fetchRandomStation();
      // console.log(data);
      setGame(data);
      setSelectedCountry("");
      setResult(null);

    } catch (error) {
      console.error(error);
    }
  }


  useEffect(() => {
      loadStation();
  }, []);

  async function handleSubmit() {
      if (!game) return;

      try {
          const guess = await submitGuess(
              game.gameId,
              selectedCountry
          );

          // console.log(guess);
          setResult(guess);

          if (guess.correct) {
              setScore((prev) => prev + 1);
          }

      } catch (error) {
          console.error(error);
      }
  }

    return (
    <>
      <Background />



      <button onClick={handleSubmit}
        disabled={!selectedCountry || result}
      >

        Check guess
      </button>

      <h1>Radio Hunt</h1>
      <h2>Score: {score}</h2>

      {game && (
        <audio controls autoPlay>
          <source src={game.streamUrl} />
          Your browser does not support the audio element.
        </audio>
      )}

      {game && (
        <div>
          {game.options.map((country) => (
            <button
              key={country}
              disabled={result}
              onClick={() => setSelectedCountry(country)}
              style={{
                  backgroundColor:
                      selectedCountry === country ? "#4CAF50" : ""
              }}
            >
              {country}
            </button>
          ))}
        </div>
      )}

      <p>Selected Country: {selectedCountry}</p>

      {result && (
        <div>
          <h2>
            {result.correct ? "✅ Correct!" : "❌ Wrong!"}
          </h2>

          <p>
            Correct Country: {result.correctCountry}
          </p>
        </div>
      )}

    {result && (
        <button onClick={loadStation}>
            Next Round
        </button>
    )}
    
    </>

  );
}