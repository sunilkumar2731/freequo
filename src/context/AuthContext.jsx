import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, usersAPI } from '../services/api'
import { auth, googleProvider } from '../firebase'
import { signInWithPopup, signInWithPhoneNumber } from 'firebase/auth'

const AuthContext = createContext(null)

// Check if we're in API mode (backend available) or demo mode (localStorage)
const USE_API = import.meta.env.VITE_USE_API === 'true'

// Demo users for offline/demo mode
const demoUsers = [
    {
        id: 'admin-1',
        email: 'admin@freequo.com',
        password: 'admin123',
        role: 'admin',
        name: 'Admin User',
        status: 'active'
    },
    {
        id: 'client-1',
        email: 'john@company.com',
        password: 'demo123',
        role: 'client',
        name: 'John Smith',
        company: 'TechCorp Inc.',
        status: 'active'
    },
    {
        id: 'freelancer-1',
        email: 'sarah@gmail.com',
        password: 'demo123',
        role: 'freelancer',
        name: 'Sarah Johnson',
        title: 'Senior Full-Stack Developer',
        bio: 'Passionate full-stack developer with 8+ years of experience.',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
        hourlyRate: 85,
        experience: '8 years',
        location: 'San Francisco, CA',
        completedJobs: 47,
        rating: 4.9,
        status: 'active'
    },
    {
        id: 'freelancer-2',
        email: 'mike@gmail.com',
        password: 'demo123',
        role: 'freelancer',
        name: 'Mike Chen',
        title: 'UI/UX Designer',
        bio: 'Creative designer specializing in user-centered design.',
        skills: ['Figma', 'Adobe XD', 'UI Design', 'Prototyping'],
        hourlyRate: 75,
        experience: '6 years',
        location: 'New York, NY',
        completedJobs: 32,
        rating: 4.8,
        status: 'active'
    }
]

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [token, setToken] = useState(null)

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('freequo_token')
            const storedUser = localStorage.getItem('freequo_user')

            if (USE_API && storedToken) {
                try {
                    setToken(storedToken)
                    const response = await authAPI.getMe()
                    const userData = response.data?.user || response.user
                    if (!userData) {
                        throw new Error('User data not found in response')
                    }
                    const normalizedUser = userData._id ? { ...userData, id: userData._id } : userData
                    setUser(normalizedUser)
                    console.log('✅ Auth verified, user normalized:', normalizedUser.id)
                } catch (error) {
                    console.error('Token validation failed:', error)
                    localStorage.removeItem('freequo_token')
                    localStorage.removeItem('freequo_user')
                }
            } else if (storedUser) {
                // Demo mode - use localStorage
                setUser(JSON.parse(storedUser))
                const storedUsers = localStorage.getItem('freequo_demo_users')
                setUsers(storedUsers ? JSON.parse(storedUsers) : demoUsers)
            } else {
                // Initialize demo users
                setUsers(demoUsers)
                localStorage.setItem('freequo_demo_users', JSON.stringify(demoUsers))
            }

            setLoading(false)
        }

        initAuth()
    }, [])

    // Login function
    const login = useCallback(async (email, password) => {
        try {
            if (USE_API) {
                const response = await authAPI.login({ email, password })
                const { user: userData, token: authToken } = response.data || response

                if (!userData) {
                    throw new Error(response.message || 'Login failed: No user data received')
                }

                const normalizedUser = userData._id ? { ...userData, id: userData._id } : userData

                setUser(normalizedUser)
                setToken(authToken)
                localStorage.setItem('freequo_token', authToken)
                localStorage.setItem('freequo_user', JSON.stringify(normalizedUser))

                return { success: true, user: normalizedUser }
            } else {
                // Demo mode
                const foundUser = users.find(u => u.email === email && u.password === password)
                if (foundUser) {
                    if (foundUser.status === 'suspended') {
                        return { success: false, error: 'Your account has been suspended.' }
                    }
                    const { password: _, ...userWithoutPassword } = foundUser
                    setUser(userWithoutPassword)
                    localStorage.setItem('freequo_user', JSON.stringify(userWithoutPassword))
                    return { success: true, user: userWithoutPassword }
                }
                return { success: false, error: 'Invalid email or password' }
            }
        } catch (error) {
            return { success: false, error: error.message || 'Login failed' }
        }
    }, [users])

    // Firebase Google Login
    const loginWithGoogle = useCallback(async (role = 'freelancer') => {
        try {
            setLoading(true)
            console.log('🚀 Starting Google Login...')
            const result = await signInWithPopup(auth, googleProvider)
            const firebaseUser = result.user
            console.log('✅ Firebase Authenticated:', firebaseUser.email)

            // If using API, we should sync with backend
            if (USE_API) {
                try {
                    // Try to login/register with backend using firebase token
                    const token = await firebaseUser.getIdToken()
                    const response = await authAPI.login({
                        email: firebaseUser.email,
                        firebaseToken: token,
                        isSocial: true,
                        role // Default role if new user
                    })

                    const { user: userData, token: authToken } = response.data || response

                    if (!userData) {
                        throw new Error(response.message || 'Social login failed: No user data received')
                    }

                    const normalizedUser = userData._id ? { ...userData, id: userData._id } : userData

                    setUser(normalizedUser)
                    setToken(authToken)
                    localStorage.setItem('freequo_token', authToken)
                    localStorage.setItem('freequo_user', JSON.stringify(normalizedUser))

                    setLoading(false)
                    return { success: true, user: normalizedUser }
                } catch (apiError) {
                    console.error('API Sync failed, falling back to Firebase only:', apiError)
                    // If backend fails, we might still want to allow login if it's a demo or if we handle it client-side
                }
            }

            // demo mode or API fallback
            const newUser = {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                role: role,
                status: 'active'
            }
            setUser(newUser)
            localStorage.setItem('freequo_user', JSON.stringify(newUser))
            setLoading(false)
            return { success: true, user: newUser }
        } catch (error) {
            console.error('❌ Google Login Error:', error.code, error.message)
            setLoading(false)
            return { success: false, error: error.message || 'Google login failed' }
        }
    }, [])

    // Firebase Phone Auth
    const loginWithPhone = useCallback(async (phoneNumber, appVerifier) => {
        try {
            setLoading(true)
            console.log('🚀 Sending OTP to:', phoneNumber)
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier)
            console.log('✅ OTP Sent Successfully')
            setLoading(false)
            return { success: true, confirmationResult }
        } catch (error) {
            console.error('❌ Phone Auth Error:', error.code, error.message)
            setLoading(false)
            return { success: false, error: error.message || 'Phone authentication failed' }
        }
    }, [])

    const verifyOTP = useCallback(async (confirmationResult, otp, role = 'freelancer') => {
        try {
            setLoading(true)
            console.log('🚀 Verifying OTP...')
            const result = await confirmationResult.confirm(otp)
            const firebaseUser = result.user
            console.log('✅ OTP Verified:', firebaseUser.phoneNumber)

            // If using API, we should sync with backend
            if (USE_API) {
                try {
                    const token = await firebaseUser.getIdToken()
                    const response = await authAPI.login({
                        phoneNumber: firebaseUser.phoneNumber,
                        firebaseToken: token,
                        isPhone: true,
                        role // Default role if new user
                    })

                    const { user: userData, token: authToken } = response.data || response

                    if (!userData) {
                        throw new Error(response.message || 'Phone login failed: No user data received')
                    }

                    const normalizedUser = userData._id ? { ...userData, id: userData._id } : userData

                    setUser(normalizedUser)
                    setToken(authToken)
                    localStorage.setItem('freequo_token', authToken)
                    localStorage.setItem('freequo_user', JSON.stringify(normalizedUser))

                    setLoading(false)
                    return { success: true, user: normalizedUser }
                } catch (apiError) {
                    console.error('API Sync failed, falling back to Firebase only:', apiError)
                }
            }

            // demo mode or API fallback
            const newUser = {
                id: firebaseUser.uid,
                phoneNumber: firebaseUser.phoneNumber,
                role: role,
                status: 'active'
            }
            setUser(newUser)
            localStorage.setItem('freequo_user', JSON.stringify(newUser))
            setLoading(false)
            return { success: true, user: newUser }
        } catch (error) {
            console.error('❌ OTP Verification Error:', error.code, error.message)
            setLoading(false)
            return { success: false, error: error.message || 'Invalid OTP' }
        }
    }, [])

    // Signup function
    const signup = useCallback(async (userData) => {
        try {
            if (USE_API) {
                const response = await authAPI.register(userData)
                const { user: newUser, token: authToken } = response.data || response

                if (!newUser) {
                    throw new Error(response.message || 'Registration failed: No user data received')
                }

                const normalizedUser = newUser._id ? { ...newUser, id: newUser._id } : newUser

                setUser(normalizedUser)
                setToken(authToken)
                localStorage.setItem('freequo_token', authToken)
                localStorage.setItem('freequo_user', JSON.stringify(normalizedUser))

                return { success: true, user: normalizedUser }
            } else {
                // Demo mode
                const existingUser = users.find(u => u.email === userData.email)
                if (existingUser) {
                    return { success: false, error: 'Email already registered' }
                }

                const newUser = {
                    id: `${userData.role}-${Date.now()}`,
                    ...userData,
                    status: 'active',
                    ...(userData.role === 'freelancer' ? {
                        skills: [],
                        hourlyRate: 0,
                        experience: '',
                        bio: '',
                        title: '',
                        location: '',
                        completedJobs: 0,
                        rating: 0
                    } : {
                        company: ''
                    })
                }

                const updatedUsers = [...users, newUser]
                setUsers(updatedUsers)
                localStorage.setItem('freequo_demo_users', JSON.stringify(updatedUsers))

                const { password: _, ...userWithoutPassword } = newUser
                setUser(userWithoutPassword)
                localStorage.setItem('freequo_user', JSON.stringify(userWithoutPassword))

                return { success: true, user: userWithoutPassword }
            }
        } catch (error) {
            return { success: false, error: error.message || 'Registration failed' }
        }
    }, [users])

    // Logout function
    const logout = useCallback(() => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('freequo_token')
        localStorage.removeItem('freequo_user')
    }, [])

    // Update user profile
    const updateUser = useCallback(async (updatedData) => {
        try {
            if (USE_API) {
                const response = await usersAPI.updateProfile(updatedData)
                const updatedUser = response.data?.user || response.user

                if (!updatedUser) {
                    throw new Error(response.message || 'Update failed: No user data received')
                }

                setUser(updatedUser)
                localStorage.setItem('freequo_user', JSON.stringify(updatedUser))
                return { success: true, user: updatedUser }
            } else {
                // Demo mode
                const updatedUsers = users.map(u =>
                    u.id === user.id ? { ...u, ...updatedData } : u
                )
                setUsers(updatedUsers)
                localStorage.setItem('freequo_demo_users', JSON.stringify(updatedUsers))

                const updatedUser = { ...user, ...updatedData }
                setUser(updatedUser)
                localStorage.setItem('freequo_user', JSON.stringify(updatedUser))
                return { success: true, user: updatedUser }
            }
        } catch (error) {
            return { success: false, error: error.message || 'Update failed' }
        }
    }, [user, users])

    // Admin functions (demo mode)
    const updateUserStatus = useCallback((userId, status) => {
        const updatedUsers = users.map(u =>
            u.id === userId ? { ...u, status } : u
        )
        setUsers(updatedUsers)
        localStorage.setItem('freequo_demo_users', JSON.stringify(updatedUsers))
    }, [users])

    const removeUser = useCallback((userId) => {
        const updatedUsers = users.filter(u => u.id !== userId)
        setUsers(updatedUsers)
        localStorage.setItem('freequo_demo_users', JSON.stringify(updatedUsers))
    }, [users])

    // Helper functions
    const getAllUsers = useCallback(() => users.filter(u => u.role !== 'admin'), [users])
    const getFreelancers = useCallback(() => users.filter(u => u.role === 'freelancer'), [users])
    const getClients = useCallback(() => users.filter(u => u.role === 'client'), [users])
    const getUserById = useCallback((id) => users.find(u => u.id === id), [users])

    const value = {
        user,
        users,
        token,
        loading,
        isAuthenticated: !!user,
        isApiMode: USE_API,
        login,
        signup,
        loginWithGoogle,
        loginWithPhone,
        verifyOTP,
        logout,
        updateUser,
        updateUserStatus,
        removeUser,
        getAllUsers,
        getFreelancers,
        getClients,
        getUserById
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
