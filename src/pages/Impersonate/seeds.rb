begin
    #Create an instritution
    Institution.create!(
      name: 'North Carolina State University',
    )
    
    # Create an admin user
    sadmin_id = User.create!(
      name: 'admin',
      email: 'admin2@example.com',
      password: 'password123',
      full_name: 'admin admin',
      institution_id: 1,
      role_id: 1
    )

    #user_ids = []
    #puts "Creating default user"
    #user_ids << User.create(
    #  name: 'user',
    #  email: 'user@user.com',
    #  password: 'password',
    #  full_name: 'user user',
    #  institution_id: 1,
    #  role_id: 5
    #).id


    admins_num = 3
    admins_ids = []
    puts sadmin_id
    puts "Creating admins"
    admins_num.times do
        admins_ids << User.create(
          name: Faker::Internet.unique.username,
            email: Faker::Internet.unique.email,
            password: "password",
            full_name: Faker::Name.name,
            institution_id: 1,
            role_id: 2,
            parent_id: sadmin_id
        ).id
    end


    instructors_num = 6
    instructors_ids = []
    puts "Creating instructors"
    instructors_num.times do
        instructors_ids << User.create(
          name: Faker::Internet.unique.username,
            email: Faker::Internet.unique.email,
            password: "password",
            full_name: Faker::Name.name,
            institution_id: 1,
            role_id: 3,
            parent_id: admins_ids.sample
        ).id
    end

    tas_num = 18
    tas_ids = []
    puts "Creating tas"
    tas_num.times do
        tas_ids << User.create(
          name: Faker::Internet.unique.username,
            email: Faker::Internet.unique.email,
            password: "password",
            full_name: Faker::Name.name,
            institution_id: 1,
            role_id: 4,
            parent_id: instructors_ids.sample
        ).id
    end

    students_num = 54
    students_ids = []
    puts "Creating students"
    students_num.times do
        students_ids << User.create(
          name: Faker::Internet.unique.username,
            email: Faker::Internet.unique.email,
            password: "password",
            full_name: Faker::Name.name,
            institution_id: 1,
            role_id: 5,
            parent_id: tas_ids.sample
        ).id
    end
rescue ActiveRecord::RecordInvalid => e
    puts 'The db has already been seeded'
end
