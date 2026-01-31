const jwt = require('jsonwebtoken');
require('dotenv').config();

const API_URL = 'http://localhost:3001/api';
const SECRET_KEY = process.env.JWT_SECRET || 'your_jwt_secret_key';

async function testForms() {
  try {
    // 1. Generate Token for existing user (ID 1)
    const token = jwt.sign({ id: 1, username: 'testuser', role: 'EMPLOYEE' }, SECRET_KEY, { expiresIn: '1h' });
    console.log('Token generated');

    // 2. Test Auto-Fill Endpoint
    const employeeId = 1; 

    console.log(`Fetching auto-fill data for Employee ID ${employeeId}...`);
    
    const response = await fetch(`${API_URL}/forms/auto-fill/${employeeId}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    });

    console.log('Response Status:', response.status);
    
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    console.log('Auto-Fill Data:', JSON.stringify(data, null, 2));

    if (data.fullName) {
        console.log('✅ TEST PASSED: Auto-fill data received.');
    } else {
        console.log('❌ TEST FAILED: Data missing keys.');
    }

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
  }
}

testForms();
