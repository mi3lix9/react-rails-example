class ProductsController < ApplicationController
  def index
    render inertia: "products/Index", props: {
      products: Product.all.map { |p| { id: p.id, name: p.name } }
    }
  end

  def show
    product = Product.find(params[:id])
    render inertia: "products/Show", props: {
      product: { id: product.id, name: product.name }
    }
  end

  def new
    render inertia: "products/Form", props: {
      product: { name: "" }
    }
  end

  def edit
    product = Product.find(params[:id])
    render inertia: "products/Form", props: {
      product: { id: product.id, name: product.name }
    }
  end

  def create
    product = Product.new(product_params)
    if product.save
      redirect_to product_path(product)
    else
      redirect_to new_product_path, inertia: { errors: product.errors.full_messages }
    end
  end

  def update
    product = Product.find(params[:id])
    if product.update(product_params)
      redirect_to product_path(product)
    else
      redirect_to edit_product_path(product), inertia: { errors: product.errors.full_messages }
    end
  end

  def destroy
    product = Product.find(params[:id])
    product.destroy
    redirect_to products_path
  end

  private

  def product_params
    params.require(:product).permit(:name)
  end
end
