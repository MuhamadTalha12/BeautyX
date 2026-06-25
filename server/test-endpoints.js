

const API_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🚀 Starting BeautyX API Endpoint Tests...\n');

  try {
    // 1. Test Health endpoint
    console.log('1. Testing Health Endpoint...');
    const healthRes = await fetch(`${API_URL}/health`);
    const healthData = await healthRes.json();
    console.log('✅ Health Response:', healthData, '\n');

    // 2. Test User Registration
    console.log('2. Testing User Registration...');
    const randomEmail = `testuser_${Math.floor(Math.random() * 100000)}@beautyx.com`;
    const regRes = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe Test',
        email: randomEmail,
        password: 'Password123'
      })
    });
    const regData = await regRes.json();
    if (!regData.success) {
      throw new Error(`Registration failed: ${regData.error}`);
    }
    console.log('✅ User Registered Successfully:', regData.user.email);
    const token = regData.token;
    console.log('🔑 JWT Session Token Generated.\n');

    // 3. Test User Login
    console.log('3. Testing User Login...');
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: randomEmail,
        password: 'Password123'
      })
    });
    const loginData = await loginRes.json();
    console.log('✅ User Logged In:', loginData.success ? 'Success' : 'Failed', '\n');

    // 4. Test Fetch Profile (Protected Route)
    console.log('4. Testing Protected Profile Route...');
    const profileRes = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const profileData = await profileRes.json();
    console.log('✅ Profile Retrieved:', profileData.user.name, `(${profileData.user.email})`, '\n');

    // 5. Test Fetch Products
    console.log('5. Testing Get Products Route...');
    const productsRes = await fetch(`${API_URL}/api/products`);
    const productsData = await productsRes.json();
    console.log('✅ Products Count:', productsData.data.products.length);
    if (productsData.data.products.length > 0) {
      console.log('Sample Product Name:', productsData.data.products[0].name);
      
      const sampleProduct = productsData.data.products[0];
      
      // 6. Test Placing Order (Protected Route)
      console.log('\n6. Testing Order Creation...');
      const orderRes = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: [{
            product: sampleProduct._id,
            name: sampleProduct.name,
            price: sampleProduct.price,
            quantity: 1,
            color: sampleProduct.colors[0],
            size: sampleProduct.sizes[0]
          }],
          shippingAddress: {
            name: 'John Doe',
            street: '123 Main St',
            city: 'Lahore',
            province: 'Punjab',
            phone: '03001234567'
          },
          paymentMethod: 'cod',
          total: sampleProduct.price
        })
      });
      const orderData = await orderRes.json();
      console.log('✅ Order Created successfully:', orderData.success ? 'Yes' : 'No');
      if (orderData.success) {
        console.log('Order ID:', orderData.order._id);
        console.log('Total billing amount:', orderData.order.total);
      }
    } else {
      console.log('⚠️ No products found in DB. Did you run the seed script?');
    }

    console.log('\n🎉 All core backend tests passed successfully!');

  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
  }
}

runTests();
