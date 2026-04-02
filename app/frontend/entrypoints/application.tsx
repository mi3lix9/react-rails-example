import { registerComponent, remountComponents } from "../components/mountComponent";
import ProductIndex from "../components/ProductIndex";
import ProductShow from "../components/ProductShow";
import ProductForm from "../components/ProductForm";

registerComponent("ProductIndex", ProductIndex);
registerComponent("ProductShow", ProductShow);
registerComponent("ProductForm", ProductForm);

if (import.meta.hot) {
  import.meta.hot.accept(
    [
      "../components/ProductIndex",
      "../components/ProductShow",
      "../components/ProductForm",
    ],
    ([newIndex, newShow, newForm]) => {
      if (newIndex) registerComponent("ProductIndex", newIndex.default);
      if (newShow) registerComponent("ProductShow", newShow.default);
      if (newForm) registerComponent("ProductForm", newForm.default);
      remountComponents();
    }
  );
}
