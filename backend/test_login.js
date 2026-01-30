import axios from 'axios';

async function testAdminLogin() {
    try {
        const response = await axios.post('http://localhost:5001/api/auth/admin-login', {
            password: 'Admin@27'
        });
        console.log('Login Result:', response.data);
    } catch (error) {
        console.error('Login Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testAdminLogin();
