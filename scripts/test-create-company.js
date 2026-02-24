#!/usr/bin/env node
/**
 * Script de prueba para crear una empresa con logo
 * Uso: node test-create-company.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:4000/api';
const LOGO_PATH = process.argv[2] || '/home/jimmy/Descargas/izipay-logo.png';

async function testCreateCompany() {
  console.log('🧪 Testing Create Company API with logo upload\n');

  // 1. Read and encode logo
  console.log(`📷 Reading logo from: ${LOGO_PATH}`);
  
  if (!fs.existsSync(LOGO_PATH)) {
    console.error(`❌ Logo file not found: ${LOGO_PATH}`);
    process.exit(1);
  }

  const logoBuffer = fs.readFileSync(LOGO_PATH);
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  console.log(`   Logo size: ${(logoBuffer.length / 1024).toFixed(2)} KB`);
  console.log(`   Base64 length: ${logoBase64.length} chars\n`);

  // 2. Create company payload
  const companyData = {
    name: 'IziPay Perú',
    slug: 'izipay-peru',
    description: 'Empresa líder en soluciones de pago digital en Perú. Ofrecemos terminales POS, pasarelas de pago y servicios financieros para comercios de todos los tamaños.',
    industry: 'Fintech',
    size: '201-500',
    location: 'Lima, Perú',
    website: 'https://izipay.pe',
    culture: 'Innovación constante, enfoque en el cliente y trabajo en equipo.',
    benefits: ['Seguro de salud', 'Capacitaciones', 'Trabajo remoto', 'Bonos por desempeño'],
    logo: {
      data: logoBase64,
      fileName: 'izipay-logo.png',
    },
  };

  console.log('📤 Sending POST request to create company...\n');
  console.log('Payload (without logo data):');
  console.log(JSON.stringify({ ...companyData, logo: { ...companyData.logo, data: '[BASE64_DATA]' } }, null, 2));
  console.log('\n');

  try {
    const response = await fetch(`${API_URL}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyData),
    });

    const responseText = await response.text();
    
    console.log(`📥 Response Status: ${response.status} ${response.statusText}`);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    let result;
    try {
      result = JSON.parse(responseText);
      console.log('\n✅ Response Body:');
      console.log(JSON.stringify(result, null, 2));
    } catch {
      console.log('\nResponse Body (raw):');
      console.log(responseText);
    }

    if (response.ok) {
      console.log('\n🎉 SUCCESS! Company created.');
      if (result?.logoUrl) {
        console.log(`\n🖼️  Logo URL: ${result.logoUrl}`);
        console.log('\nVerify logo is accessible:');
        console.log(`   curl -I "${result.logoUrl}"`);
      }
    } else {
      console.log('\n❌ FAILED to create company.');
    }
  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
    console.log('\nMake sure the API is running:');
    console.log('   cd /home/jimmy/sueldos-organigrama/apps/api && npm run start:dev');
  }
}

testCreateCompany();
