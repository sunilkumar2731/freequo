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
    {
        title: 'Business Website Development',
        description: 'Build a responsive business website with 5–7 pages including Home, About, Services, Portfolio, and Contact pages.\n\nRequirements:\n- Modern, responsive design\n- Mobile-first approach\n- Contact form integration\n- SEO-friendly structure\n- Fast loading speed\n- Cross-browser compatibility',
        category: 'Web Development',
        budget: 800,
        budgetType: 'fixed',
        duration: '2-3 weeks',
        experience: 'Intermediate',
        skills: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
        client: clientId,
        clientName,
        company,
        status: 'open',
        location: 'Remote'
    },
    {
        title: 'E-commerce Website Setup',
        description: 'Develop a fully functional online store with product catalog, shopping cart, and secure checkout.\n\nFeatures needed:\n- Product listing with categories\n- Shopping cart functionality\n- Secure payment gateway integration\n- Order management system\n- Customer accounts\n- Inventory tracking',
        category: 'Web Development',
        budget: 1200,
        budgetType: 'fixed',
        duration: '1-2 months',
        experience: 'Expert',
        skills: ['React', 'Node.js', 'E-commerce', 'Payment Integration'],
        client: clientId,
        clientName,
        company,
        status: 'open',
        location: 'Remote'
    },
    {
        title: 'Flutter App Development',
        description: 'Build a cross-platform mobile application using Flutter framework.\n\nFeatures:\n- Cross-platform (iOS & Android)\n- Modern UI with animations\n- State management\n- API integration\n- Push notifications\n- Offline support',
        category: 'Mobile Development',
        budget: 900,
        budgetType: 'fixed',
        duration: '1-2 months',
        experience: 'Intermediate',
        skills: ['Flutter', 'Dart', 'Firebase', 'REST API'],
        client: clientId,
        clientName,
        company,
        status: 'open',
        location: 'Remote'
    },
    {
        title: 'Logo Design',
        description: 'Create a modern, memorable logo for a startup or brand identity.\n\nDeliverables:\n- 3-5 initial concepts\n- Unlimited revisions\n- Final files (AI, EPS, PNG, SVG)\n- Color and B&W versions\n- Brand usage guidelines\n- Social media sizes',
        category: 'Design',
        budget: 120,
        budgetType: 'fixed',
        duration: '3-5 days',
        experience: 'Entry',
        skills: ['Logo Design', 'Adobe Illustrator', 'Branding', 'Creative Design'],
        client: clientId,
        clientName,
        company,
        status: 'open',
        location: 'Remote'
    },
    {
        title: 'SEO Optimization',
        description: 'Improve website ranking on Google through comprehensive SEO strategies.\n\nServices:\n- Technical SEO audit\n- On-page optimization\n- Keyword strategy\n- Backlink analysis\n- Content recommendations\n- Monthly reporting',
        category: 'Marketing',
        budget: 500,
        budgetType: 'fixed',
        duration: '1 month',
        experience: 'Expert',
        skills: ['SEO', 'Technical SEO', 'Link Building', 'Analytics'],
        client: clientId,
        clientName,
        company,
        status: 'open',
        location: 'Remote'
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
