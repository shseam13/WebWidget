import "./App.css";
import CustomizedProgressBars from "./components/Spinner.jsx";
import ResponsiveAppBar from "./components/ResponsiveAppBar.jsx";
import BulkUpdater from "./components/BulkUpdater.jsx";
import DealQuote from "./components/DealQuote.jsx";
import PreLoader from "./components/PreLoader.jsx";
export default function App() {
  return (
    <div>
      {/* <ResponsiveAppBar /> */}
      {/* <CustomizedProgressBars /> */}
      {/* <FormUpdater /> */}
      {/* <BulkUpdater /> */}
      <DealQuote />
      {/* <PreLoader /> */}
    </div>
  );
}
