module Admin
  class OrdersController < ApplicationController
    def index
      orders = Order.order(created_at: :desc).map { |o|
        {
          id: o.id,
          customer_name: o.customer_name,
          customer_email: o.customer_email,
          status: o.status,
          total: o.total.to_f,
          created_at: o.created_at.iso8601
        }
      }
      render inertia: "Admin/Orders/Index", props: { orders: orders }
    end

    def show
      order = Order.includes(order_items: :product).find(params[:id])
      render inertia: "Admin/Orders/Show", props: {
        order: {
          id: order.id,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          status: order.status,
          total: order.total.to_f,
          created_at: order.created_at.iso8601,
          next_status: order.next_status,
          items: order.order_items.map { |item|
            {
              id: item.id,
              product_name: item.product.name,
              quantity: item.quantity,
              unit_price: item.unit_price.to_f
            }
          }
        }
      }
    end

    def update
      order = Order.find(params[:id])
      new_status = params.require(:status)

      if new_status == order.next_status
        order.advance_status!
        redirect_to admin_order_path(order)
      else
        redirect_back fallback_location: admin_order_path(order),
          inertia: { errors: { status: [ "Invalid status transition" ] } }
      end
    end
  end
end
