import React from "react";
import { createRoot } from "react-dom/client";

const componentRegistry: Record<string, React.ComponentType<any>> = {};

export function registerComponent(
  name: string,
  component: React.ComponentType<any>
) {
  componentRegistry[name] = component;
}

function mountComponents() {
  const mountPoints = document.querySelectorAll("[data-react-component]");
  mountPoints.forEach((element) => {
    const name = element.getAttribute("data-react-component");
    const propsJson = element.getAttribute("data-react-props");

    if (!name || !componentRegistry[name]) {
      console.warn(`React component "${name}" not found in registry`);
      return;
    }

    const props = propsJson ? JSON.parse(propsJson) : {};
    const Component = componentRegistry[name];
    const root = createRoot(element);
    root.render(<Component {...props} />);
  });
}

document.addEventListener("DOMContentLoaded", mountComponents);
document.addEventListener("turbo:load", mountComponents);
