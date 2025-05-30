class Api::V1::AdminsController < ApplicationController

    skip_before_action :verify_authenticity_token
    before_action :set_admin, only: [:show, :update, :destroy]


  # GET /api/v1/admins
  def index
    @admins = Admin.all
    render json: @admins
  end

  # GET /api/v1/admins/:id 
  def show
    render json: @admin
  end

  # POST /api/v1/admins
  def create
    @admin = Admin.new(admin_params)
    if @admin.save
      render json: @admin, status: :created
    else
      render json: @admin.errors, status: :unprocessable_entity
    end
  end

  # PUT /api/v1/admins/:id
  def update
    if @admin.update(admin_params)
      render json: @admin
    else
      render json: @admin.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/admins/:id
  def destroy
    @admin.destroy
    head :no_content
  end

  private

  def set_admin
    @admin = Admin.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Admin not found' }, status: :not_found
  end

  def admin_params
    params.require(:admin).permit(:firstname, :lastname, :email, :phone, :specialization, :address)
  end
end
