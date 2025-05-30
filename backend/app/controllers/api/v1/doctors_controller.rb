class Api::V1::DoctorsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_doctor, only: [:show, :update, :destroy]

  def index
    @doctors = Doctor.all
    render json: @doctors
  end

  def show
    render json: @doctor
  end

  def create
    @doctor = Doctor.new(doctor_params)
    if @doctor.save
      render json: @doctor, status: :created
    else
      render json: @doctor.errors, status: :unprocessable_entity
    end
  end

  def update
    if @doctor.update(doctor_params)
      render json: @doctor
    else
      render json: @doctor.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @doctor.destroy
    head :no_content
  end

  private

  def set_doctor
    @doctor = Doctor.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Doctor not found' }, status: :not_found
  end

  def doctor_params
    params.require(:doctor).permit(:firstname, :lastname, :email, :phone, :specialization, :address)
  end
end
