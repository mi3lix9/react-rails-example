Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  root "products#index"
  resources :products

  get "cart", to: "cart#index"
  get "checkout", to: "checkout#index"
  resources :orders, only: [ :create, :show ], param: :token

  namespace :admin do
    resources :orders, only: [ :index, :show, :update ]
  end
end
