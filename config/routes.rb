Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    resources :products, only: [:index, :show, :create, :update, :destroy]
  end

  root "pages#index"
  get "*path", to: "pages#index", via: :all
end
