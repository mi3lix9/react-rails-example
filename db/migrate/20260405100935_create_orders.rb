class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders do |t|
      t.string :customer_name, null: false
      t.string :customer_email, null: false
      t.string :status, null: false, default: "pending"
      t.decimal :total, precision: 10, scale: 2, null: false
      t.string :token, null: false

      t.timestamps
    end

    add_index :orders, :token, unique: true
  end
end
