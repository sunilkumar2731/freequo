import axios from 'axios';

async function testUserLogin() {
    try {
        const response = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'viswanathpaarthiban1@gmail.com',
            password: '123456'
        });
        console.log('User Login Result:', response.data);
    } catch (error) {
        console.error('User Login Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testUserLogin();
