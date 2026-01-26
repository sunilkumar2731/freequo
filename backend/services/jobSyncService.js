import axios from 'axios';
import Job from '../models/Job.js';

// Remotive API configuration
const REMOTIVE_API_URL = 'https://remotive.com/api/remote-jobs';

// Category mapping from Remotive to our platform
const CATEGORY_MAP = {
    'software-dev': 'Web Development',
    'design': 'Design',
    'marketing': 'Marketing',
    'data': 'Data Science',
    'writing': 'Writing',
    'customer-support': 'Writing',
    'sales': 'Marketing',
    'product': 'Web Development',
    'devops': 'Web Development',
    'mobile': 'Mobile Development'
};

class JobSyncService {
    /**
     * Fetch jobs from Remotive API
     */
    async fetchRemoteJobs(category = null, limit = 100) {
        try {
            console.log('🔄 Fetching jobs from Remotive API...');

            const url = category
                ? `${REMOTIVE_API_URL}?category=${category}&limit=${limit}`
                : `${REMOTIVE_API_URL}?limit=${limit}`;

            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Freequo-Platform/1.0'
                }
            });

            if (response.data && response.data.jobs) {
                console.log(`✅ Fetched ${response.data.jobs.length} jobs from Remotive`);
                return response.data.jobs;
            }

            return [];
        } catch (error) {
            console.error('❌ Error fetching from Remotive API:', error.message);
            return [];
        }
    }

    /**
     * Transform Remotive job to our schema
     */
    transformJob(remoteJob) {
        // Extract skills from description (simple keyword matching)
        const description = remoteJob.description || '';
        const skillKeywords = ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Vue', 'Angular',
            'Java', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter',
            'Figma', 'Photoshop', 'Illustrator', 'UI/UX', 'Sketch',
            'SEO', 'Content Writing', 'Copywriting', 'Social Media',
            'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'];

        const skills = skillKeywords.filter(skill =>
            description.toLowerCase().includes(skill.toLowerCase())
        ).slice(0, 5);

        // Determine experience level from title
        const title = (remoteJob.title || '').toLowerCase();
        let experience = 'Intermediate';
        if (title.includes('junior') || title.includes('entry')) {
            experience = 'Entry';
        } else if (title.includes('senior') || title.includes('lead') || title.includes('principal')) {
            experience = 'Expert';
        }

        // Extract budget from salary string
        let budget = 0;
        let budgetType = 'fixed';
        if (remoteJob.salary) {
            const salaryMatch = remoteJob.salary.match(/\$?([\d,]+)k?/i);
            if (salaryMatch) {
                budget = parseInt(salaryMatch[1].replace(/,/g, ''));
                if (remoteJob.salary.toLowerCase().includes('hour')) {
                    budgetType = 'hourly';
                    budget = Math.min(budget, 200); // Cap hourly rate
                } else {
                    budget = Math.min(budget * 1000, 150000); // Annual to project budget
                }
            }
        }

        // Default budget if not found
        if (budget === 0) {
            budget = experience === 'Entry' ? 500 : experience === 'Intermediate' ? 1000 : 2000;
        }

        return {
            title: remoteJob.title || 'Untitled Job',
            description: this.cleanDescription(description),
            category: CATEGORY_MAP[remoteJob.category] || 'Web Development',
            budget: budget,
            budgetType: budgetType,
            duration: this.estimateDuration(budget, budgetType),
            experience: experience,
            skills: skills.length > 0 ? skills : ['Remote Work', 'Communication'],
            location: remoteJob.candidate_required_location || 'Remote',
            company: remoteJob.company_name || 'Remote Company',
            clientName: remoteJob.company_name || 'Remote Company',
            status: 'open',
            source: 'remotive',
            externalUrl: remoteJob.url,
            externalId: remoteJob.id?.toString(),
            isVerified: true,
            isFeatured: false,
            applicantsCount: 0,
            createdAt: new Date(remoteJob.publication_date || Date.now()),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        };
    }

    /**
     * Clean and truncate description
     */
    cleanDescription(html) {
        // Remove HTML tags
        let text = html.replace(/<[^>]*>/g, ' ');
        // Remove extra whitespace
        text = text.replace(/\s+/g, ' ').trim();
        // Truncate to reasonable length
        if (text.length > 500) {
            text = text.substring(0, 500) + '...';
        }
        return text || 'No description available.';
    }

    /**
     * Estimate project duration based on budget
     */
    estimateDuration(budget, budgetType) {
        if (budgetType === 'hourly') {
            return '1-2 weeks';
        }
        if (budget < 1000) return '1-2 weeks';
        if (budget < 3000) return '2-4 weeks';
        if (budget < 10000) return '1-2 months';
        return '2-3 months';
    }

    /**
     * Sync jobs to database
     */
    async syncJobs(options = {}) {
        const {
            categories = null,
            limit = 100,
            removeOld = true
        } = options;

        try {
            console.log('🚀 Starting job sync...');

            // Fetch jobs from Remotive
            const remoteJobs = await this.fetchRemoteJobs(categories, limit);

            if (remoteJobs.length === 0) {
                console.log('⚠️ No jobs fetched from API');
                return { success: false, message: 'No jobs fetched', count: 0 };
            }

            // Transform jobs
            const transformedJobs = remoteJobs.map(job => this.transformJob(job));

            // Remove old Remotive jobs if requested
            if (removeOld) {
                const deleteResult = await Job.deleteMany({
                    source: 'remotive',
                    expiresAt: { $lt: new Date() }
                });
                console.log(`🗑️ Removed ${deleteResult.deletedCount} expired jobs`);
            }

            // Insert new jobs (avoid duplicates by externalId)
            let insertedCount = 0;
            let updatedCount = 0;

            for (const jobData of transformedJobs) {
                try {
                    const existing = await Job.findOne({
                        externalId: jobData.externalId,
                        source: 'remotive'
                    });

                    if (existing) {
                        // Update existing job
                        await Job.findByIdAndUpdate(existing._id, jobData);
                        updatedCount++;
                    } else {
                        // Insert new job
                        await Job.create(jobData);
                        insertedCount++;
                    }
                } catch (err) {
                    console.error('Error saving job:', err.message);
                }
            }

            console.log(`✅ Job sync complete: ${insertedCount} inserted, ${updatedCount} updated`);

            return {
                success: true,
                message: 'Jobs synced successfully',
                inserted: insertedCount,
                updated: updatedCount,
                total: insertedCount + updatedCount
            };

        } catch (error) {
            console.error('❌ Job sync failed:', error.message);
            return {
                success: false,
                message: error.message,
                count: 0
            };
        }
    }

    /**
     * Get sync statistics
     */
    async getSyncStats() {
        try {
            const totalJobs = await Job.countDocuments();
            const remoteJobs = await Job.countDocuments({ source: 'remotive' });
            const platformJobs = await Job.countDocuments({ source: { $ne: 'remotive' } });
            const expiredJobs = await Job.countDocuments({
                source: 'remotive',
                expiresAt: { $lt: new Date() }
            });

            return {
                total: totalJobs,
                remote: remoteJobs,
                platform: platformJobs,
                expired: expiredJobs
            };
        } catch (error) {
            console.error('Error getting sync stats:', error);
            return null;
        }
    }

    /**
     * Clean up expired jobs
     */
    async cleanupExpiredJobs() {
        try {
            const result = await Job.deleteMany({
                source: 'remotive',
                expiresAt: { $lt: new Date() }
            });
            console.log(`🧹 Cleaned up ${result.deletedCount} expired jobs`);
            return result.deletedCount;
        } catch (error) {
            console.error('Error cleaning up jobs:', error);
            return 0;
        }
    }
}

export default new JobSyncService();
