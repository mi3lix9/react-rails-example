class AddPriceToProducts < ActiveRecord::Migration[8.1]
  def change
    add_column :products, :price, :decimal, precision: 10, scale: 2, null: false, default: 0
    Product.update_all(price: 20.00)
  end
end
