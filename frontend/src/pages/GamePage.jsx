import { useEffect } from "react";
import { fetchRandomStation } from "../services/radioService";
import Background from "../components/background/Background";

export default function GamePage() {

  useEffect(() => {
    async function loadStation() {
      try {
        const data = await fetchRandomStation();
        // console.log(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadStation();
  }, []);

    return (
    <>
      <Background />

      <h1>Radio Hunt</h1>
    </>
  );
}