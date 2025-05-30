class CreateAdmins < ActiveRecord::Migration[7.2]
  def change
    create_table :admins do |t|
      t.string :firstname
      t.string :lastname
      t.string :email
      t.string :phone
      t.string :specialization
      t.string :address

      t.timestamps
    end
  end
end
