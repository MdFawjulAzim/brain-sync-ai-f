import { createRoot } from "react-dom/client";
import "./index.css";
import { store } from "./store/app/store";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
    <Toaster position="top-center" />
  </Provider>
);