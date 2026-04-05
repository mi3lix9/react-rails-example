class ProductsController < ApplicationController
  def index
    render inertia: "Products/Index", props: {
      products: Product.all.map { |p| { id: p.id, name: p.name, price: p.price.to_f } }
    }
  end

  def show
    product = Product.find(params[:id])
    render inertia: "Products/Show", props: {
      product: { id: product.id, name: product.name, price: product.price.to_f }
    }
  end

  def new
    render inertia: "Products/New"
  end

  def create
    product = Product.new(product_params)
    if product.save
      redirect_to product_path(product)
    else
      redirect_back fallback_location: new_product_path, inertia: { errors: product.errors.to_hash(true) }
    end
  end

  def edit
    product = Product.find(params[:id])
    render inertia: "Products/Edit", props: {
      product: { id: product.id, name: product.name, price: product.price.to_f }
    }
  end

  def update
    product = Product.find(params[:id])
    if product.update(product_params)
      redirect_to product_path(product)
    else
      redirect_back fallback_location: edit_product_path(product), inertia: { errors: product.errors.to_hash(true) }
    end
  end

  def destroy
    product = Product.find(params[:id])
    product.destroy
    redirect_to products_path
  end

  private

  def product_params
    params.require(:product).permit(:name, :price)
  end
end
