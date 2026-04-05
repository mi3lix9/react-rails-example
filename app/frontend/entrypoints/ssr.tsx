import { createInertiaApp } from "@inertiajs/react";
import ReactDOMServer from "react-dom/server";
import Layout from "../components/Layout";

createInertiaApp({
  pages: "../pages",
  layout: Layout,
  setup({ App, props }) {
    return ReactDOMServer.renderToString(<App {...props} />);
  },
});
