const User = require('../../backend/models/user');
const Streak = require('../../backend/models/streak');
const mongoose = require('mongoose');

// Sample users data
const users = [
    {
        name: 'Admin User',
        email: 'admin@college.edu',
        password: 'password123',
        studentId: 'A001',
        major: 'Computer Science',
        role: 'admin',
        emailVerified: true
    },
    {
        name: 'John Doe',
        email: 'john@college.edu',
        password: 'password123',
        studentId: 'S1001',
        major: 'Business Administration',
        emailVerified: true
    },
    {
        name: 'Jane Smith',
        email: 'jane@college.edu',
        password: 'password123',
        studentId: 'S1002',
        major: 'Computer Science',
        emailVerified: true
    },
    {
        name: 'Mike Johnson',
        email: 'mike@college.edu',
        password: 'password123',
        studentId: 'S1003',
        major: 'Engineering',
        emailVerified: true
    },
    {
        name: 'Sarah Williams',
        email: 'sarah@college.edu',
        password: 'password123',
        studentId: 'S1004',
        major: 'Psychology',
        emailVerified: true
    }
];

// Connect to database and seed users
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-club-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('MongoDB connected for seeding users');
    
    try {
        // Clear existing users
        await User.deleteMany({});
        await Streak.deleteMany({});
        
        // Create users
        for (const userData of users) {
            const user = await User.create(userData);
            
            // Create streak record for each user
            await Streak.create({
                user: user._id
            });
            
            console.log(`User created: ${user.name}`);
        }
        
        console.log('Users seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});