import React from "react";
import { createRoot, Root } from "react-dom/client";

const componentRegistry: Record<string, React.ComponentType<any>> = {};
const mountedRoots: { element: Element; root: Root; name: string; props: any }[] = [];

export function registerComponent(
  name: string,
  component: React.ComponentType<any>
) {
  componentRegistry[name] = component;
}

function mountComponents() {
  mountedRoots.forEach(({ root }) => root.unmount());
  mountedRoots.length = 0;

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
    mountedRoots.push({ element, root, name, props });
  });
}

export function remountComponents() {
  mountedRoots.forEach(({ root, name, props }) => {
    const Component = componentRegistry[name];
    if (Component) {
      root.render(<Component {...props} />);
    }
  });
}

document.addEventListener("DOMContentLoaded", mountComponents);
document.addEventListener("turbo:load", mountComponents);
