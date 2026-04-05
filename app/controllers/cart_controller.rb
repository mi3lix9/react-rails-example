class CartController < ApplicationController
  def index
    render inertia: "Cart/Index"
  end
end
