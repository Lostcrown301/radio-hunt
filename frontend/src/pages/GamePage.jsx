import { useEffect } from "react";
import { fetchRandomStation } from "../services/radioService";

export default function GamePage() {

  useEffect(() => {
    async function loadStation() {
      try {
        const data = await fetchRandomStation();
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadStation();
  }, []);

  return (
    <h1>Radio Hunt</h1>
  );
}