import { createInertiaApp } from "@inertiajs/react";
import Layout from "../components/Layout";
import "../styles/index.css";

createInertiaApp({
  pages: "../pages",
  strictMode: true,
  layout: Layout,
});
