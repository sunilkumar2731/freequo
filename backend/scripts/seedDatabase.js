// Database Seed Script - Populate MongoDB with initial job data
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Job from '../models/Job.js';

dotenv.config();

// Sample job categories with jobs
const seedJobs = [
    // WEB DEVELOPMENT
    {
        title: 'Business Website Development',
        description: 'Build a responsive business website with 5–7 pages including Home, About, Services, Portfolio, and Contact pages.\n\nRequirements:\n- Modern, responsive design\n- Mobile-first approach\n- Contact form integration\n- SEO-friendly structure\n- Fast loading speed\n- Cross-browser compatibility',
        category: 'Web Development',
        budget: 800,
        budgetType: 'fixed',
        duration: '2-3 weeks',
        experience: 'Intermediate',
        skills: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
        location: 'Remote'
    },
    {
        title: 'Landing Page Design (HTML/CSS)',
        description: 'Create a clean, modern landing page for a product or startup launch.\n\nDeliverables:\n- Single page responsive design\n- Eye-catching hero section\n- Feature highlights\n- Call-to-action buttons\n- Social proof section\n- Newsletter signup form',
        category: 'Web Development',
        budget: 300,
        budgetType: 'fixed',
        duration: '1 week',
        experience: 'Entry',
        skills: ['HTML', 'CSS', 'Landing Page', 'UI Design'],
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
        location: 'Remote'
    },
    {
        title: 'React Frontend Development',
        description: 'Build a modern frontend UI using React and contemporary development tools.\n\nRequirements:\n- React 18+ with hooks\n- State management (Redux/Context)\n- Responsive design implementation\n- API integration\n- Unit testing\n- Clean, maintainable code',
        category: 'Web Development',
        budget: 900,
        budgetType: 'fixed',
        duration: '3-4 weeks',
        experience: 'Intermediate',
        skills: ['React', 'JavaScript', 'Redux', 'REST API'],
        location: 'Remote'
    },

    // MOBILE DEVELOPMENT
    {
        title: 'Android App UI Development',
        description: 'Design and implement beautiful Android app screens with modern UI patterns.\n\nScope:\n- 15+ app screens\n- Material Design implementation\n- Smooth animations\n- Dark mode support\n- Responsive layouts\n- Custom components',
        category: 'Mobile Development',
        budget: 700,
        budgetType: 'fixed',
        duration: '2-3 weeks',
        experience: 'Intermediate',
        skills: ['Android', 'Kotlin', 'Material Design', 'XML'],
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
        location: 'Remote'
    },

    // DESIGN
    {
        title: 'Logo Design',
        description: 'Create a modern, memorable logo for a startup or brand identity.\n\nDeliverables:\n- 3-5 initial concepts\n- Unlimited revisions\n- Final files (AI, EPS, PNG, SVG)\n- Color and B&W versions\n- Brand usage guidelines\n- Social media sizes',
        category: 'Design',
        budget: 120,
        budgetType: 'fixed',
        duration: '3-5 days',
        experience: 'Entry',
        skills: ['Logo Design', 'Adobe Illustrator', 'Branding', 'Creative Design'],
        location: 'Remote'
    },
    {
        title: 'UI/UX Design for Mobile App',
        description: 'Design complete mobile app UI using Figma with user experience best practices.\n\nDeliverables:\n- User research documentation\n- Wireframes\n- High-fidelity mockups (30+ screens)\n- Interactive prototype\n- Design system\n- Developer handoff',
        category: 'Design',
        budget: 500,
        budgetType: 'fixed',
        duration: '2-3 weeks',
        experience: 'Intermediate',
        skills: ['Figma', 'UI Design', 'UX Design', 'Mobile Design'],
        location: 'Remote'
    },

    // WRITING
    {
        title: 'Website Content Writing',
        description: 'Write professional, engaging website content that converts visitors into customers.\n\nPages:\n- Homepage copy\n- About us content\n- Services descriptions\n- Product pages\n- FAQ section\n- Call-to-action copy',
        category: 'Writing',
        budget: 200,
        budgetType: 'fixed',
        duration: '1 week',
        experience: 'Intermediate',
        skills: ['Content Writing', 'Copywriting', 'SEO', 'Web Content'],
        location: 'Remote'
    },
    {
        title: 'Blog Writing (SEO)',
        description: 'Write SEO-friendly blog articles that rank on Google and drive organic traffic.\n\nRequirements:\n- Keyword research integration\n- 1500-2000 words per article\n- Meta descriptions\n- Internal linking\n- Engaging headlines\n- 5 articles total',
        category: 'Writing',
        budget: 150,
        budgetType: 'fixed',
        duration: '1-2 weeks',
        experience: 'Intermediate',
        skills: ['Blog Writing', 'SEO Writing', 'Content Marketing', 'Research'],
        location: 'Remote'
    },

    // MARKETING
    {
        title: 'Social Media Marketing',
        description: 'Manage and grow social media presence across multiple platforms.\n\nServices:\n- Content calendar creation\n- Daily posting\n- Community engagement\n- Analytics reporting\n- Competitor analysis\n- Growth strategies',
        category: 'Marketing',
        budget: 400,
        budgetType: 'fixed',
        duration: '1 month',
        experience: 'Intermediate',
        skills: ['Social Media Marketing', 'Content Strategy', 'Analytics', 'Community Management'],
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
        location: 'Remote'
    },

    // DATA SCIENCE
    {
        title: 'Data Visualization Dashboard',
        description: 'Create interactive charts and dashboards for business insights.\n\nDeliverables:\n- Interactive dashboard\n- Multiple chart types\n- Filtering capabilities\n- Export functionality\n- Mobile responsive\n- Real-time updates',
        category: 'Data Science',
        budget: 400,
        budgetType: 'fixed',
        duration: '1-2 weeks',
        experience: 'Intermediate',
        skills: ['Tableau', 'Power BI', 'Data Visualization', 'Dashboard Design'],
        location: 'Remote'
    },
    {
        title: 'Machine Learning Model',
        description: 'Build a predictive machine learning model for business forecasting.\n\nScope:\n- Problem definition\n- Feature engineering\n- Model selection\n- Training and validation\n- Performance metrics\n- Deployment-ready code',
        category: 'Data Science',
        budget: 800,
        budgetType: 'fixed',
        duration: '2-3 weeks',
        experience: 'Expert',
        skills: ['Machine Learning', 'Python', 'Scikit-learn', 'TensorFlow'],
        location: 'Remote'
    },

    // VIDEO & ANIMATION
    {
        title: 'YouTube Video Editing',
        description: 'Edit YouTube videos with professional effects, transitions, and cuts.\n\nServices:\n- Color correction\n- Audio enhancement\n- Motion graphics\n- Transitions\n- Text overlays\n- Thumbnail creation',
        category: 'Video & Animation',
        budget: 150,
        budgetType: 'fixed',
        duration: '2-3 days',
        experience: 'Entry',
        skills: ['Video Editing', 'Premiere Pro', 'After Effects', 'YouTube'],
        location: 'Remote'
    },

    // MUSIC & AUDIO
    {
        title: 'Podcast Editing',
        description: 'Edit podcast episodes with professional audio quality.\n\nServices:\n- Noise removal\n- Audio leveling\n- Music & intro integration\n- Chapter markers\n- Multiple export formats\n- Show notes timestamps',
        category: 'Music & Audio',
        budget: 100,
        budgetType: 'fixed',
        duration: '1-2 days',
        experience: 'Entry',
        skills: ['Audio Editing', 'Adobe Audition', 'Podcast Production', 'Sound Design'],
        location: 'Remote'
    }
];

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seed...\n');

        // Connect to database
        await connectDB();
        console.log('✅ Connected to MongoDB\n');

        // Check if we have a client user, or create a demo one
        let client = await User.findOne({ role: 'client' });

        if (!client) {
            console.log('📝 Creating demo client user...');
            client = await User.create({
                name: 'Demo Client',
                email: 'client@freequo.com',
                password: 'password123',
                role: 'client',
                company: 'Freequo Demo',
                status: 'active'
            });
            console.log('✅ Demo client created: client@freequo.com\n');
        } else {
            console.log(`✅ Using existing client: ${client.email}\n`);
        }

        // Check existing jobs
        const existingJobsCount = await Job.countDocuments();
        console.log(`📊 Current jobs in database: ${existingJobsCount}`);

        if (existingJobsCount > 0) {
            console.log('\n⚠️  Database already has jobs. Skipping seed to avoid duplicates.');
            console.log('   To reset and re-seed, run: npm run db:reset\n');
        } else {
            // Create jobs with the client as owner
            console.log('\n📝 Creating seed jobs...\n');

            const jobsWithClient = seedJobs.map((job, index) => ({
                ...job,
                client: client._id,
                clientName: client.name,
                company: client.company || 'Independent Client',
                status: 'open',
                createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)) // Stagger dates
            }));

            const createdJobs = await Job.insertMany(jobsWithClient);
            console.log(`✅ Created ${createdJobs.length} jobs successfully!\n`);

            // Show summary by category
            const categoryCounts = {};
            createdJobs.forEach(job => {
                categoryCounts[job.category] = (categoryCounts[job.category] || 0) + 1;
            });

            console.log('📊 Jobs by category:');
            Object.entries(categoryCounts).forEach(([category, count]) => {
                console.log(`   • ${category}: ${count} jobs`);
            });
        }

        console.log('\n🎉 Database seed completed!\n');

        // Show demo credentials
        console.log('═══════════════════════════════════════════════');
        console.log('   Demo Login Credentials:');
        console.log('═══════════════════════════════════════════════');
        console.log('   📧 Email:    client@freequo.com');
        console.log('   🔑 Password: password123');
        console.log('═══════════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Seed error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📭 Database connection closed');
        process.exit(0);
    }
}

// Run the seed
seedDatabase();
