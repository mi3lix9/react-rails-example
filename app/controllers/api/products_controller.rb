class Api::ProductsController < ApplicationController
  skip_forgery_protection

  def index
    products = Product.all
    render json: products.map { |p| { id: p.id, name: p.name } }
  end

  def show
    product = Product.find(params[:id])
    render json: { id: product.id, name: product.name }
  end

  def create
    product = Product.new(product_params)
    if product.save
      render json: { id: product.id, name: product.name }, status: :created
    else
      render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    product = Product.find(params[:id])
    if product.update(product_params)
      render json: { id: product.id, name: product.name }
    else
      render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    product = Product.find(params[:id])
    product.destroy
    head :no_content
  end

  private

  def product_params
    params.require(:product).permit(:name)
  end
end
