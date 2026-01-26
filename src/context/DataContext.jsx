import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { jobsAPI } from '../services/api'
import { initialJobs } from '../data/jobsData'
import { useAuth } from './AuthContext'

const DataContext = createContext(null)

// Check if we're in API mode
const USE_API = import.meta.env.VITE_USE_API === 'true'

const initialCategories = [
    { name: 'Web Development', icon: 'Code', count: 0 },
    { name: 'Mobile Development', icon: 'Smartphone', count: 0 },
    { name: 'Design', icon: 'Palette', count: 0 },
    { name: 'Writing', icon: 'PenTool', count: 0 },
    { name: 'Marketing', icon: 'TrendingUp', count: 0 },
    { name: 'Data Science', icon: 'BarChart', count: 0 },
    { name: 'Video & Animation', icon: 'Video', count: 0 },
    { name: 'Music & Audio', icon: 'Music', count: 0 }
]

export function DataProvider({ children }) {
    const [jobs, setJobs] = useState([])
    const [categories, setCategories] = useState(initialCategories)
    const [loading, setLoading] = useState(true)
    const { token, isAuthenticated } = useAuth() || {}

    // Initialize data - fetch jobs on page load
    useEffect(() => {
        const initData = async () => {
            if (USE_API) {
                try {
                    console.log('🔄 Fetching data from API...')

                    // Fetch Jobs
                    const jobsResponse = await jobsAPI.getJobs({ limit: 100 })
                    const jobsData = jobsResponse?.data?.jobs || jobsResponse?.jobs || []
                    setJobs(jobsData)
                    console.log(`✅ Loaded ${jobsData.length} jobs from API`)

                    // Fetch Categories
                    try {
                        const catResponse = await jobsAPI.getCategories()
                        const catData = catResponse?.data?.categories || catResponse?.categories || []
                        if (catData.length > 0) {
                            setCategories(catData)
                            console.log(`✅ Loaded ${catData.length} categories from API`)
                        }
                    } catch (catError) {
                        console.warn('⚠️ Failed to fetch categories, using defaults:', catError)
                    }

                } catch (error) {
                    console.error('❌ Failed to fetch jobs from API:', error)
                    console.log('⚠️ Falling back to demo data')
                    setJobs(initialJobs)
                }
            } else {
                // Demo mode - use local static data
                console.log('📦 Using demo mode with static data')
                setJobs(initialJobs)
            }
            setLoading(false)
        }

        initData()
    }, [])

    // Re-fetch jobs when token changes (login/logout) to ensure private data/proposals are loaded
    useEffect(() => {
        if (USE_API && token) {
            console.log('🔑 Authentication changed, refreshing jobs...')
            refreshJobs()
        }
    }, [token, USE_API])

    // Create job
    const createJob = useCallback(async (jobData) => {
        try {
            if (USE_API) {
                const response = await jobsAPI.createJob(jobData)
                const newJob = response?.data?.job || response?.job
                setJobs(prev => [newJob, ...prev])
                return { success: true, job: newJob }
            } else {
                // Demo mode
                const newJob = {
                    id: `job-${Date.now()}`,
                    ...jobData,
                    status: 'open',
                    applicants: [],
                    createdAt: new Date().toISOString()
                }
                const updatedJobs = [newJob, ...jobs]
                setJobs(updatedJobs)
                return { success: true, job: newJob }
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }, [jobs])

    // Update job
    const updateJob = useCallback(async (jobId, updates) => {
        try {
            if (USE_API) {
                const response = await jobsAPI.updateJob(jobId, updates)
                const updatedJob = response?.data?.job || response?.job
                setJobs(prev => prev.map(job =>
                    job._id === jobId || job.id === jobId ? updatedJob : job
                ))
                return { success: true, job: updatedJob }
            } else {
                // Demo mode
                const updatedJobs = jobs.map(job =>
                    job.id === jobId ? { ...job, ...updates } : job
                )
                setJobs(updatedJobs)
                return { success: true }
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }, [jobs])

    // Delete job
    const deleteJob = useCallback(async (jobId) => {
        try {
            if (USE_API) {
                await jobsAPI.deleteJob(jobId)
                setJobs(prev => prev.filter(job => job._id !== jobId && job.id !== jobId))
                return { success: true }
            } else {
                // Demo mode
                const updatedJobs = jobs.filter(job => job.id !== jobId)
                setJobs(updatedJobs)
                return { success: true }
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }, [jobs])

    // Apply to job
    const applyToJob = useCallback(async (jobId, freelancerId) => {
        try {
            if (USE_API) {
                // This is handled by proposals API now
                return { success: true }
            } else {
                // Demo mode
                const updatedJobs = jobs.map(job => {
                    if (job.id === jobId && !job.applicants.includes(freelancerId)) {
                        return { ...job, applicants: [...job.applicants, freelancerId] }
                    }
                    return job
                })
                setJobs(updatedJobs)
                return { success: true }
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }, [jobs])

    // Refresh jobs from API
    const refreshJobs = useCallback(async (params = {}) => {
        if (USE_API) {
            try {
                const response = await jobsAPI.getJobs({ limit: 100, ...params })
                const jobsData = response?.data?.jobs || response?.jobs || []
                setJobs(jobsData)
                return { success: true, jobs: jobsData }
            } catch (error) {
                return { success: false, error: error.message }
            }
        }
        return { success: true, jobs }
    }, [jobs])

    // Helper functions
    const getJobById = useCallback((id) => {
        return jobs.find(job => {
            const jobId = job._id?.toString() || job.id?.toString();
            return jobId === id?.toString();
        });
    }, [jobs]);

    const getJobsByClient = useCallback((clientId) => {
        if (!clientId) return []
        return jobs.filter(job =>
            job.clientId === clientId ||
            job.client === clientId ||
            (job.client && (job.client._id === clientId || job.client.id === clientId))
        )
    }, [jobs])

    const getAppliedJobs = useCallback((freelancerId) => {
        if (!freelancerId) return []
        return jobs.filter(job =>
            Array.isArray(job.applicants) &&
            job.applicants.some(app =>
                app === freelancerId ||
                (typeof app === 'object' && (app?._id === freelancerId || app?.id === freelancerId))
            )
        )
    }, [jobs])

    const getOpenJobs = useCallback(() =>
        jobs.filter(job => job.status === 'open')
        , [jobs])

    const value = {
        jobs,
        categories,
        loading,
        isApiMode: USE_API,
        createJob,
        updateJob,
        deleteJob,
        applyToJob,
        refreshJobs,
        getJobById,
        getJobsByClient,
        getAppliedJobs,
        getOpenJobs
    }

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    )
}

export function useData() {
    const context = useContext(DataContext)
    if (!context) {
        throw new Error('useData must be used within a DataProvider')
    }
    return context
}
