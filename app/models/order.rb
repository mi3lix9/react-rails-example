class Order < ApplicationRecord
  STATUSES = %w[pending confirmed shipped delivered].freeze
  NEXT_STATUS = {
    "pending" => "confirmed",
    "confirmed" => "shipped",
    "shipped" => "delivered"
  }.freeze

  has_many :order_items, dependent: :destroy
  has_many :products, through: :order_items

  validates :customer_name, presence: true
  validates :customer_email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :total, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :token, presence: true, uniqueness: true

  before_validation :generate_token, on: :create

  def next_status
    NEXT_STATUS[status]
  end

  def can_advance?
    next_status.present?
  end

  def advance_status!
    raise "Cannot advance from #{status}" unless can_advance?
    update!(status: next_status)
  end

  private

  def generate_token
    self.token ||= SecureRandom.hex(16)
  end
end
