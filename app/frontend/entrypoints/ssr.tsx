import { createInertiaApp } from "@inertiajs/react";
import ReactDOMServer from "react-dom/server";

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob("../pages/**/*.tsx", { eager: true });
    return pages[`../pages/${name}.tsx`];
  },
  setup({ App, props }) {
    return ReactDOMServer.renderToString(<App {...props} />);
  },
});
