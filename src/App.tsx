import { Toaster } from "sonner";
import Home from "./pages/Home";

function App() {
  return (
    <>
      <Toaster theme="dark" position="bottom-right" />
      <Home />
    </>
  );
}

export default App;
