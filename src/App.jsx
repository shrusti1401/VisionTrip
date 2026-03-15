import { Routes, Route } from "react-router-dom";
import Hero from "./components/ui/custom/Hero";
import DestinationDetails from "./pages/DestinationDetails";
import CreateTrip from "./pages/CreateTrip";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/destination" element={<DestinationDetails />} />
      <Route path="/create-trip" element={<CreateTrip />} />
    </Routes>
  );
}

export default App;
