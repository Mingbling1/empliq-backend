#!/usr/bin/env node
/**
 * Script para actualizar el logo de una empresa
 */

const fs = require('fs');

const API_URL = process.env.API_URL || 'http://localhost:4000/api';
const COMPANY_ID = process.argv[2];
const LOGO_PATH = process.argv[3];

if (!COMPANY_ID || !LOGO_PATH) {
  console.log('Usage: node update-logo.js <company-id> <logo-path>');
  console.log('Example: node update-logo.js deeda832-... /path/to/logo.png');
  process.exit(1);
}

async function updateLogo() {
  console.log(`🔄 Updating logo for company: ${COMPANY_ID}`);
  console.log(`📷 Logo: ${LOGO_PATH}`);

  if (!fs.existsSync(LOGO_PATH)) {
    console.error(`❌ Logo file not found: ${LOGO_PATH}`);
    process.exit(1);
  }

  const logoBuffer = fs.readFileSync(LOGO_PATH);
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  const fileName = LOGO_PATH.split('/').pop();

  const updateData = {
    logo: {
      data: logoBase64,
      fileName,
    },
  };

  try {
    const response = await fetch(`${API_URL}/companies/${COMPANY_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('\n✅ Logo updated successfully!');
      console.log(`🖼️  New URL: ${result.logoUrl}`);
      
      // Test if accessible
      console.log('\n🔍 Testing accessibility...');
      const testResponse = await fetch(result.logoUrl, { method: 'HEAD' });
      console.log(`   Status: ${testResponse.status} ${testResponse.statusText}`);
      
      if (testResponse.ok) {
        console.log('   ✅ Logo is accessible!');
      } else {
        console.log('   ⚠️ Logo may not be accessible');
      }
    } else {
      console.error('\n❌ Failed:', result);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

updateLogo();
