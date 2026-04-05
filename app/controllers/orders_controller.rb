class OrdersController < ApplicationController
  def create
    items_params = params.require(:items)
    product_ids = items_params.map { |i| i[:product_id] }
    products = Product.where(id: product_ids).index_by(&:id)

    order = Order.new(
      customer_name: params.require(:customer_name),
      customer_email: params.require(:customer_email)
    )

    total = 0
    items_params.each do |item|
      product = products[item[:product_id].to_i]
      next unless product

      quantity = item[:quantity].to_i
      unit_price = product.price

      order.order_items.build(
        product: product,
        quantity: quantity,
        unit_price: unit_price
      )
      total += unit_price * quantity
    end

    order.total = total

    if order.save
      redirect_to order_path(order.token)
    else
      redirect_back fallback_location: checkout_path, inertia: { errors: order.errors.to_hash(true) }
    end
  end

  def show
    order = Order.includes(order_items: :product).find_by!(token: params[:token])
    render inertia: "Orders/Show", props: {
      order: serialize_order(order)
    }
  end

  private

  def serialize_order(order)
    {
      token: order.token,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      status: order.status,
      total: order.total.to_f,
      created_at: order.created_at.iso8601,
      items: order.order_items.map { |item|
        {
          id: item.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.unit_price.to_f
        }
      }
    }
  end
end
