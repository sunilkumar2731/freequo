import axios from 'axios';

async function testAdminAPIs() {
    const baseURL = 'http://localhost:5000/api';
    try {
        console.log('--- Testing Admin APIs ---');

        // 1. Login as Admin
        console.log('Logging in...');
        const loginRes = await axios.post(`${baseURL}/auth/admin-login`, {
            email: 'freequoo@gmail.com',
            password: 'Admin@27'
        });

        const token = loginRes.data.token;
        console.log('Login Successful, token obtained.');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Test Get Admin Dashboard
        console.log('Fetching /dashboard/admin...');
        const dashRes = await axios.get(`${baseURL}/dashboard/admin`, config);
        console.log('Dashboard Data Summary:', {
            success: dashRes.data.success,
            statsFound: !!dashRes.data.data?.stats,
            totalUsers: dashRes.data.data?.stats?.totalUsers,
            userCount: dashRes.data.data?.users?.length
        });

        // 3. Test Get Admin Stats
        console.log('Fetching /admin/stats...');
        const statsRes = await axios.get(`${baseURL}/admin/stats`, config);
        console.log('Platform Stats Summary:', {
            success: statsRes.data.success,
            activityStats: statsRes.data.data?.activityStats,
            recentlyActive: statsRes.data.data?.recentlyActive?.length
        });

    } catch (error) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
    }
}

testAdminAPIs();
