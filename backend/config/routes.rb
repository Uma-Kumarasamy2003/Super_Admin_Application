Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :admins
      resources :doctors 
    end
  end
end
