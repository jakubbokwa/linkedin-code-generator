import "../styles/globals.css";
import Kiosk from "./components/Kiosk";

export default function Page() {
  return (
    <main style={{ minHeight: "100vh", background: "#fff" }}>
      <Kiosk />
    </main>
  );
}
