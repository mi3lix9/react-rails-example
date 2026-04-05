class CheckoutController < ApplicationController
  def index
    render inertia: "Checkout/Index"
  end
end
