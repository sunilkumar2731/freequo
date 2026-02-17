import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Job from '../models/Job.js';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected for seeding');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Demo users
const users = [
    {
        email: 'admin@freequo.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        status: 'active'
    },
    {
        email: 'john@company.com',
        password: 'demo123',
        name: 'John Smith',
        role: 'client',
        company: 'TechCorp Inc.',
        status: 'active',
        totalSpent: 5000
    },
    {
        email: 'sarah@gmail.com',
        password: 'demo123',
        name: 'Sarah Johnson',
        role: 'freelancer',
        title: 'Senior Full-Stack Developer',
        bio: 'Passionate full-stack developer with 8+ years of experience in building scalable web applications. Specialized in React, Node.js, and cloud technologies.',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB', 'GraphQL'],
        hourlyRate: 85,
        experience: '8 years',
        location: 'San Francisco, CA',
        completedJobs: 47,
        rating: 4.9,
        totalRatings: 42,
        totalEarnings: 45000,
        profileViews: 234,
        status: 'active'
    },
    {
        email: 'mike@gmail.com',
        password: 'demo123',
        name: 'Mike Chen',
        role: 'freelancer',
        title: 'UI/UX Designer',
        bio: 'Creative designer specializing in user-centered design and brand identity. I transform complex problems into beautiful, intuitive solutions.',
        skills: ['Figma', 'Adobe XD', 'Sketch', 'UI Design', 'Prototyping', 'User Research'],
        hourlyRate: 75,
        experience: '6 years',
        location: 'New York, NY',
        completedJobs: 32,
        rating: 4.8,
        totalRatings: 28,
        totalEarnings: 28000,
        profileViews: 189,
        status: 'active'
    },
    {
        email: 'emma@gmail.com',
        password: 'demo123',
        name: 'Emma Williams',
        role: 'freelancer',
        title: 'Content Writer & SEO Specialist',
        bio: 'Expert content strategist helping businesses grow through compelling content and data-driven SEO strategies.',
        skills: ['Content Writing', 'SEO', 'Copywriting', 'Blog Writing', 'Technical Writing', 'Marketing'],
        hourlyRate: 55,
        experience: '5 years',
        location: 'Austin, TX',
        completedJobs: 89,
        rating: 4.9,
        totalRatings: 75,
        totalEarnings: 35000,
        profileViews: 312,
        status: 'active'
    },
    {
        email: 'client2@company.com',
        password: 'demo123',
        name: 'Emily Davis',
        role: 'client',
        company: 'StartupXYZ',
        status: 'active',
        totalSpent: 2500
    }
];

// Sample jobs
const getJobs = (clientId, clientName, company) => [
    // --- Web Development (7) ---
    {
        title: 'Business Website Development',
        description: 'Build a responsive business website with 5–7 pages including Home, About, Services, Portfolio, and Contact pages.',
        category: 'Web Development',
        budget: 800,
        budgetType: 'fixed',
        duration: '2-3 weeks',
        experience: 'Intermediate',
        skills: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'E-commerce Website Setup',
        description: 'Develop a fully functional online store with product catalog, shopping cart, and secure checkout.',
        category: 'Web Development',
        budget: 1200,
        budgetType: 'fixed',
        duration: '1-2 months',
        experience: 'Expert',
        skills: ['React', 'Node.js', 'E-commerce', 'Payment Integration'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Portfolio Website for Artist',
        description: 'Create a clean, artistic portfolio website to showcase paintings and digital art.',
        category: 'Web Development',
        budget: 450,
        budgetType: 'fixed',
        duration: '1 week',
        experience: 'Entry',
        skills: ['HTML', 'CSS', 'Portfolio', 'Modern Design'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Real Estate Platform',
        description: 'Build a complex property listing site with map integration and filters.',
        category: 'Web Development',
        budget: 2500,
        budgetType: 'fixed',
        duration: '3 months',
        experience: 'Expert',
        skills: ['Next.js', 'MongoDB', 'Maps API', 'Auth'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Custom LMS System',
        description: 'Develop a Learning Management System for an online school.',
        category: 'Web Development',
        budget: 1800,
        budgetType: 'fixed',
        duration: '2 months',
        experience: 'Expert',
        skills: ['Node.js', 'React', 'LMS', 'Video Streaming'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Blog Site Redesign',
        description: 'Revamp an old WordPress blog into a modern headless CMS site.',
        category: 'Web Development',
        budget: 600,
        budgetType: 'fixed',
        duration: '2 weeks',
        experience: 'Intermediate',
        skills: ['WordPress', 'Headless CMS', 'SEO'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Dashboard for SaaS',
        description: 'Create an internal admin dashboard for a fintech startup.',
        category: 'Web Development',
        budget: 1100,
        budgetType: 'fixed',
        duration: '1 month',
        experience: 'Intermediate',
        skills: ['React', 'Chart.js', 'Tailwind', 'API Integration'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },

    // --- Mobile Development (7) ---
    {
        title: 'Flutter App Development',
        description: 'Build a cross-platform mobile application using Flutter framework.',
        category: 'Mobile Development',
        budget: 900,
        budgetType: 'fixed',
        duration: '1-2 months',
        experience: 'Intermediate',
        skills: ['Flutter', 'Dart', 'Firebase', 'REST API'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Food Delivery App',
        description: 'Create a fully functional food delivery app with tracking.',
        category: 'Mobile Development',
        budget: 3500,
        budgetType: 'fixed',
        duration: '4 months',
        experience: 'Expert',
        skills: ['React Native', 'Google Maps', 'Stripe', 'Node.js'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Fitness Tracker App',
        description: 'App to track daily steps, calories and water intake.',
        category: 'Mobile Development',
        budget: 1500,
        budgetType: 'fixed',
        duration: '2 months',
        experience: 'Intermediate',
        skills: ['iOS', 'Swift', 'HealthKit'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Meditation App',
        description: 'Simple app with audio player for guided meditations.',
        category: 'Mobile Development',
        budget: 800,
        budgetType: 'fixed',
        duration: '1 month',
        experience: 'Entry',
        skills: ['Flutter', 'Audio Player', 'UI UX'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Budget Planner',
        description: 'Mobile app for personal finance management.',
        category: 'Mobile Development',
        budget: 1200,
        budgetType: 'fixed',
        duration: '2 months',
        experience: 'Intermediate',
        skills: ['React Native', 'SQLite', 'Charts'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'E-learning Mobile App',
        description: 'Mobile companion for an online course platform.',
        category: 'Mobile Development',
        budget: 2000,
        budgetType: 'fixed',
        duration: '3 months',
        experience: 'Expert',
        skills: ['Kotlin', 'Android', 'Firebase'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Social Media App',
        description: 'Niche social network with photo sharing and chat.',
        category: 'Mobile Development',
        budget: 5000,
        budgetType: 'fixed',
        duration: '6 months',
        experience: 'Expert',
        skills: ['Flutter', 'Cloud Firestore', 'Push Notifications'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },

    // --- Design (7) ---
    {
        title: 'Logo Design',
        description: 'Create a modern, memorable logo for a startup.',
        category: 'Design',
        budget: 120,
        budgetType: 'fixed',
        duration: '3-5 days',
        experience: 'Entry',
        skills: ['Logo Design', 'Adobe Illustrator', 'Branding'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'UI/UX Design for SaaS',
        description: 'Design a clean and intuitive interface for a cloud management tool.',
        category: 'Design',
        budget: 1500,
        budgetType: 'fixed',
        duration: '1 month',
        experience: 'Expert',
        skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Mobile App Wireframes',
        description: 'Create low-fidelity wireframes for a new social app.',
        category: 'Design',
        budget: 300,
        budgetType: 'fixed',
        duration: '5 days',
        experience: 'Intermediate',
        skills: ['Figma', 'Skeching', 'UX'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Social Media Posts Design',
        description: 'Create 30 Instagram and Facebook posts for a clothing brand.',
        category: 'Design',
        budget: 250,
        budgetType: 'fixed',
        duration: '10 days',
        experience: 'Entry',
        skills: ['Canva', 'Photoshop', 'Social Media'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Pitch Deck Design',
        description: 'Professional presentation design for a startup investor pitch.',
        category: 'Design',
        budget: 400,
        budgetType: 'fixed',
        duration: '1 week',
        experience: 'Intermediate',
        skills: ['PowerPoint', 'Keynote', 'Graphic Design'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'E-book Cover and Layout',
        description: 'Design the cover and internal layout for a 50-page business e-book.',
        category: 'Design',
        budget: 350,
        budgetType: 'fixed',
        duration: '2 weeks',
        experience: 'Intermediate',
        skills: ['InDesign', 'Graphic Design', 'Layout'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Infographic Creation',
        description: 'Create 5 data-rich infographics for a medical website.',
        category: 'Design',
        budget: 500,
        budgetType: 'fixed',
        duration: '2 weeks',
        experience: 'Expert',
        skills: ['Illustrator', 'Data Visualization', 'Communication'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },

    // --- Marketing (7) ---
    {
        title: 'SEO Optimization',
        description: 'Improve website ranking on Google through comprehensive SEO strategies.',
        category: 'Marketing',
        budget: 500,
        budgetType: 'fixed',
        duration: '1 month',
        experience: 'Expert',
        skills: ['SEO', 'Technical SEO', 'Link Building', 'Analytics'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Instagram Growth Specialist',
        description: 'Manage and grow our business account through organic strategies.',
        category: 'Marketing',
        budget: 400,
        budgetType: 'fixed',
        duration: '1 month',
        experience: 'Intermediate',
        skills: ['Instagram', 'SMM', 'Growth Hacking'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Google Ads Manager',
        description: 'Set up and optimize PPC campaigns for an e-commerce store.',
        category: 'Marketing',
        budget: 600,
        budgetType: 'fixed',
        duration: '1 month',
        experience: 'Expert',
        skills: ['Google Ads', 'PPC', 'Conversions'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Email Marketing Campaign',
        description: 'Set up Mailchimp sequences for a product launch.',
        category: 'Marketing',
        budget: 300,
        budgetType: 'fixed',
        duration: '2 weeks',
        experience: 'Intermediate',
        skills: ['Mailchimp', 'Email Marketing', 'Copywriting'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'LinkedIn Lead Generation',
        description: 'Find and reach out to potential B2B clients on LinkedIn.',
        category: 'Marketing',
        budget: 700,
        budgetType: 'fixed',
        duration: '1 month',
        experience: 'Expert',
        skills: ['LinkedIn', 'Lead Gen', 'Sales'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'YouTube Channel Marketing',
        description: 'Optimize video tags, descriptions and thumbnails for a new channel.',
        category: 'Marketing',
        budget: 200,
        budgetType: 'fixed',
        duration: '2 weeks',
        experience: 'Entry',
        skills: ['YouTube SEO', 'Marketing', 'Video'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Influencer Outreach',
        description: 'Identify and contact 20 influencers in the fitness niche.',
        category: 'Marketing',
        budget: 450,
        budgetType: 'fixed',
        duration: '3 weeks',
        experience: 'Intermediate',
        skills: ['Influencer Marketing', 'Outreach', 'Negotiation'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },

    // --- Writing (7) ---
    {
        title: 'Technical Blog Post',
        description: 'Write a 1500-word article about AWS Lambda and Serverless.',
        category: 'Writing',
        budget: 200,
        budgetType: 'fixed',
        duration: '3 days',
        experience: 'Expert',
        skills: ['Technical Writing', 'AWS', 'JavaScript'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Product Description (50 items)',
        description: 'Write engaging descriptions for a new jewelry collection.',
        category: 'Writing',
        budget: 150,
        budgetType: 'fixed',
        duration: '5 days',
        experience: 'Entry',
        skills: ['Copywriting', 'Creative Writing', 'Product Description'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'White Paper on Blockchain',
        description: 'Create a 15-page white paper for a crypto startup.',
        category: 'Writing',
        budget: 1200,
        budgetType: 'fixed',
        duration: '3 weeks',
        experience: 'Expert',
        skills: ['White Paper', 'Crypto', 'Research'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Ghostwriting a Short Story',
        description: 'Write a 5000-word sci-fi short story based on a plot outline.',
        category: 'Writing',
        budget: 500,
        budgetType: 'fixed',
        duration: '2 weeks',
        experience: 'Expert',
        skills: ['Ghostwriting', 'Creative Writing', 'Storytelling'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Website Copy Overhaul',
        description: 'Rewrite Home, About, and Contact pages for a law firm.',
        category: 'Writing',
        budget: 400,
        budgetType: 'fixed',
        duration: '1 week',
        experience: 'Intermediate',
        skills: ['Website Copy', 'Law', 'Professional Writing'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Newsletter Content Creation',
        description: 'Write 4 weekly newsletters for a lifestyle brand.',
        category: 'Writing',
        budget: 250,
        budgetType: 'fixed',
        duration: '1 month',
        experience: 'Intermediate',
        skills: ['Newsletter', 'Email Copy', 'Content Strategy'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    },
    {
        title: 'Video Script Writing',
        description: 'Write a script for a 5-minute educational YouTube video.',
        category: 'Writing',
        budget: 300,
        budgetType: 'fixed',
        duration: '1 week',
        experience: 'Intermediate',
        skills: ['Script Writing', 'Video', 'Education'],
        client: clientId, clientName, company, status: 'open', location: 'Remote'
    }
];

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Job.deleteMany({});

        // Create users with hashed passwords
        console.log('👥 Creating users...');
        const createdUsers = [];

        for (const userData of users) {
            // Do NOT manually hash password here. 
            // The User model has a pre-save hook that handles hashing automatically.
            const user = await User.create(userData);

            createdUsers.push(user);
            console.log(`   ✅ Created ${user.role}: ${user.email}`);
        }

        // Get client user
        const clientUser = createdUsers.find(u => u.role === 'client' && u.email === 'john@company.com');

        // Create jobs
        console.log('💼 Creating jobs...');
        const jobs = getJobs(clientUser._id, clientUser.name, clientUser.company);

        for (const jobData of jobs) {
            const job = await Job.create(jobData);
            console.log(`   ✅ Created job: ${job.title}`);
        }

        console.log('\n🎉 Database seeded successfully!\n');
        console.log('Demo Accounts:');
        console.log('─'.repeat(50));
        console.log('Admin:      admin@freequo.com / admin123');
        console.log('Client:     john@company.com / demo123');
        console.log('Freelancer: sarah@gmail.com / demo123');
        console.log('Freelancer: mike@gmail.com / demo123');
        console.log('Freelancer: emma@gmail.com / demo123');
        console.log('─'.repeat(50));

        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
