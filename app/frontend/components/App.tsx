import React from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import ProductIndex from "./ProductIndex";
import ProductShow from "./ProductShow";
import ProductForm from "./ProductForm";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductIndex />} />
        <Route path="/products" element={<ProductIndex />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id" element={<ProductShow />} />
        <Route path="/products/:id/edit" element={<ProductForm />} />
      </Routes>
    </BrowserRouter>
  );
}
