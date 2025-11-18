const Event = require('../../backend/models/event');
const mongoose = require('mongoose');

// Sample events data
const events = [
    {
        title: 'Welcome Party',
        description: 'Join us for the annual welcome party to kick off the new semester!',
        date: new Date('2023-09-15'),
        time: '18:00',
        location: 'Main Auditorium'
    },
    {
        title: 'Hackathon 2023',
        description: 'A 24-hour hackathon to solve real-world problems with technology.',
        date: new Date('2023-10-05'),
        time: '09:00',
        location: 'Tech Building'
    },
    {
        title: 'Debate Competition',
        description: 'Annual inter-college debate competition with exciting prizes.',
        date: new Date('2023-10-20'),
        time: '14:00',
        location: 'Conference Hall'
    },
    {
        title: 'Photography Exhibition',
        description: 'Exhibition showcasing the best photographs by our club members.',
        date: new Date('2023-11-10'),
        time: '11:00',
        location: 'Art Gallery'
    },
    {
        title: 'Basketball Tournament',
        description: 'Inter-department basketball tournament. All are welcome to participate!',
        date: new Date('2023-11-25'),
        time: '16:00',
        location: 'Sports Complex'
    },
    {
        title: 'Environmental Awareness Workshop',
        description: 'Workshop on sustainable practices and environmental conservation.',
        date: new Date('2023-12-05'),
        time: '10:00',
        location: 'Seminar Hall'
    },
    {
        title: 'Annual Drama Production',
        description: 'The drama club presents their annual play. Don\'t miss it!',
        date: new Date('2023-12-15'),
        time: '19:00',
        location: 'Auditorium'
    },
    {
        title: 'Startup Pitch Day',
        description: 'Present your startup ideas to investors and industry experts.',
        date: new Date('2024-01-20'),
        time: '13:00',
        location: 'Entrepreneurship Center'
    },
    {
        title: 'Music Concert',
        description: 'Annual music concert featuring performances by our talented students.',
        date: new Date('2024-02-14'),
        time: '18:30',
        location: 'Open Air Theater'
    },
    {
        title: 'Tech Talk: AI and Future',
        description: 'Expert talk on the future of artificial intelligence and its impact.',
        date: new Date('2024-03-10'),
        time: '15:00',
        location: 'Tech Building'
    }
];

// Connect to database and seed events
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-club-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('MongoDB connected for seeding events');
    
    try {
        // Get clubs
        const Club = require('../../backend/models/Club');
        const clubs = await Club.find();
        
        if (clubs.length === 0) {
            console.error('No clubs found. Please seed clubs first.');
            process.exit(1);
        }
        
        // Clear existing events
        await Event.deleteMany({});
        
        // Create events
        for (let i = 0; i < events.length; i++) {
            const eventData = events[i];
            const club = clubs[i % clubs.length]; // Distribute events across clubs
            
            await Event.create({
                ...eventData,
                club: club._id
            });
            
            console.log(`Event created: ${eventData.title} for ${club.name}`);
        }
        
        console.log('Events seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding events:', error);
        process.exit(1);
    }
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});