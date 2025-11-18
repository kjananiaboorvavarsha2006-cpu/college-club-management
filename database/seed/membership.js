const Membership = require('../../backend/models/membership');
const mongoose = require('mongoose');

// Connect to database and seed memberships
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-club-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('MongoDB connected for seeding memberships');
    
    try {
        // Get users and clubs
        const User = require('../../backend/models/user');
        const Club = require('../../backend/models/Club');
        
        const users = await User.find({ role: 'user' });
        const clubs = await Club.find();
        
        if (users.length === 0 || clubs.length === 0) {
            console.error('No users or clubs found. Please seed users and clubs first.');
            process.exit(1);
        }
        
        // Clear existing memberships
        await Membership.deleteMany({});
        
        // Create memberships - each user joins 1-3 random clubs
        for (const user of users) {
            const numClubs = Math.floor(Math.random() * 3) + 1; // 1-3 clubs
            
            // Get random clubs
            const shuffledClubs = [...clubs].sort(() => 0.5 - Math.random());
            const selectedClubs = shuffledClubs.slice(0, numClubs);
            
            for (const club of selectedClubs) {
                await Membership.create({
                    user: user._id,
                    club: club._id
                });
                
                // Add user to club members array
                club.members.push(user._id);
                await club.save();
                
                console.log(`Membership created: ${user.name} joined ${club.name}`);
            }
        }
        
        console.log('Memberships seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding memberships:', error);
        process.exit(1);
    }
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});