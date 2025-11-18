const Club = require('../../backend/models/Club');
const Membership = require('../../backend/models/membership');
const mongoose = require('mongoose');

// Sample clubs data
const clubs = [
    {
        name: 'Computer Science Club',
        description: 'A club for students interested in computer science, programming, and technology.',
        category: 'technology'
    },
    {
        name: 'Debate Society',
        description: 'A platform for students to enhance their public speaking and critical thinking skills.',
        category: 'academic'
    },
    {
        name: 'Photography Club',
        description: 'For photography enthusiasts to share their work and learn new techniques.',
        category: 'arts'
    },
    {
        name: 'Basketball Team',
        description: 'The official basketball team of the college. Join us for practices and matches.',
        category: 'sports'
    },
    {
        name: 'Environmental Club',
        description: 'Dedicated to promoting environmental awareness and sustainability on campus.',
        category: 'volunteer'
    },
    {
        name: 'Drama Club',
        description: 'A creative space for students interested in acting, directing, and stage production.',
        category: 'arts'
    },
    {
        name: 'Entrepreneurship Cell',
        description: 'Fostering entrepreneurial spirit and innovation among students.',
        category: 'academic'
    },
    {
        name: 'Music Society',
        description: 'For music lovers to come together and create beautiful melodies.',
        category: 'arts'
    }
];

// Connect to database and seed clubs
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-club-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('MongoDB connected for seeding clubs');
    
    try {
        // Get admin user
        const User = require('../../backend/models/user');
        const admin = await User.findOne({ role: 'admin' });
        
        if (!admin) {
            console.error('Admin user not found. Please seed users first.');
            process.exit(1);
        }
        
        // Clear existing clubs and memberships
        await Club.deleteMany({});
        await Membership.deleteMany({});
        
        // Create clubs
        for (const clubData of clubs) {
            const club = await Club.create({
                ...clubData,
                creator: admin._id
            });
            
            // Add admin as a member of each club
            await Membership.create({
                user: admin._id,
                club: club._id
            });
            
            // Add admin to club members array
            club.members.push(admin._id);
            await club.save();
            
            console.log(`Club created: ${club.name}`);
        }
        
        console.log('Clubs seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding clubs:', error);
        process.exit(1);
    }
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});