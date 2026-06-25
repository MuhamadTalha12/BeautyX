import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Review from './models/Review.js';
import Order from './models/Order.js';

dotenv.config();

const API_URL = 'http://localhost:5000';

// Simple Assertion Runner
let testCasesCount = 0;
let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  testCasesCount++;
  if (condition) {
    passedCount++;
    console.log(`\x1b[32m[PASS]\x1b[0m Test #${testCasesCount}: ${message}`);
  } else {
    failedCount++;
    console.error(`\x1b[31m[FAIL]\x1b[0m Test #${testCasesCount}: ${message}`);
  }
}

function assertEq(actual, expected, message) {
  testCasesCount++;
  if (actual === expected) {
    passedCount++;
    console.log(`\x1b[32m[PASS]\x1b[0m Test #${testCasesCount}: ${message}`);
  } else {
    failedCount++;
    console.error(`\x1b[31m[FAIL]\x1b[0m Test #${testCasesCount}: ${message} (Expected: ${expected}, Got: ${actual})`);
  }
}

// Cookie Store to mock browser behavior in Node fetch
let cookieStore = {};

function getCookieString() {
  return Object.entries(cookieStore).map(([k, v]) => `${k}=${v}`).join('; ');
}

function updateCookies(response) {
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    const cookies = typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : [setCookie];
    
    for (const cookie of cookies) {
      if (!cookie) continue;
      const parts = cookie.split(';')[0].split('=');
      if (parts.length >= 2) {
        cookieStore[parts[0].trim()] = parts[1].trim();
      }
    }
  }
}

// Custom request wrapper that automatically parses and sends cookies
async function request(urlPath, options = {}) {
  options.headers = options.headers || {};
  const cookieStr = getCookieString();
  if (cookieStr) {
    options.headers['Cookie'] = cookieStr;
  }
  const response = await fetch(`${API_URL}${urlPath}`, options);
  updateCookies(response);
  return response;
}

// Main Test Function
async function startTesting() {
  console.log('🚀 Initiating BeautyX 53 Automated Endpoint Integration Tests...\n');

  // Connect to DB directly for seeding & cleaning up
  await connectDB();

  // Test setup variables
  const testEmail = `integration_tester_${Math.floor(Math.random() * 100000)}@beautyx.com`;
  const testPassword = 'IntegrationPassword123';
  const testName = 'Integration Tester';

  let clientToken = null;
  let clientUserId = null;
  let adminToken = null;
  let sampleProductId = null;
  let createdProductId = null;
  let createdAddressId = null;
  let createdOrderId = null;

  try {
    // -----------------------------------------------------------------
    // SECTION 1: AUTHENTICATION & AUTHORIZATION (Tests 1-14)
    // -----------------------------------------------------------------

    // 1. Health check endpoint
    const healthRes = await request('/health');
    const healthData = await healthRes.json();
    assertEq(healthRes.status, 200, 'GET /health status code');
    assertEq(healthData.status, 'ok', 'GET /health data status');

    // 2. User Registration (Success)
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword
      })
    });
    const regData = await regRes.json();
    assertEq(regRes.status, 201, 'POST /api/auth/register status code');
    assert(regData.success === true && regData.token !== undefined, 'POST /api/auth/register returns token');
    clientToken = regData.token;
    clientUserId = regData.user._id;
    
    // Set user as verified in DB so they can checkout normally
    await User.findByIdAndUpdate(clientUserId, { isVerified: true });

    // 3. User Registration (Duplicate Email Fail)
    const regDupRes = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword
      })
    });
    assertEq(regDupRes.status, 400, 'POST /api/auth/register duplicate email error code');

    // 4. User Registration (Missing Name Fail)
    const regNoNameRes = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `tester_${Date.now()}@beautyx.com`,
        password: testPassword
      })
    });
    assertEq(regNoNameRes.status, 400, 'POST /api/auth/register missing name validation code');

    // 5. User Registration (Invalid Email Fail)
    const regBadEmailRes = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: 'invalid_email_format',
        password: testPassword
      })
    });
    assertEq(regBadEmailRes.status, 400, 'POST /api/auth/register invalid email validation code');

    // 6. User Registration (Short Password Fail)
    const regShortPassRes = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: `tester_${Date.now()}@beautyx.com`,
        password: '123'
      })
    });
    assertEq(regShortPassRes.status, 400, 'POST /api/auth/register short password validation code');

    // Clear cookie store to simulate logging in fresh
    cookieStore = {};

    // 7. User Login (Success)
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    const loginData = await loginRes.json();
    assertEq(loginRes.status, 200, 'POST /api/auth/login success code');
    assert(loginData.success === true && loginData.token !== undefined, 'POST /api/auth/login returns credentials');
    
    // Save fresh access token & cookie session
    clientToken = loginData.token;

    // 8. User Login (Incorrect Password Fail)
    const loginWrongPassRes = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword'
      })
    });
    assertEq(loginWrongPassRes.status, 401, 'POST /api/auth/login wrong password code');

    // 9. User Login (Unregistered Email Fail)
    const loginNoUserRes = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nobody_exists_here_2026@beautyx.com',
        password: testPassword
      })
    });
    assertEq(loginNoUserRes.status, 401, 'POST /api/auth/login non-existent user code');

    // 10. Google Authentication Mock (Success)
    const googleEmail = `google_tester_${Math.floor(Math.random() * 100000)}@gmail.com`;
    const googleRes = await request('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: googleEmail,
        name: 'Google User',
        googleId: 'g123456789',
        avatar: 'https://avatar.url'
      })
    });
    const googleData = await googleRes.json();
    assertEq(googleRes.status, 200, 'POST /api/auth/google success code');
    assert(googleData.success === true && googleData.user.email === googleEmail, 'POST /api/auth/google returns new user profile');

    // 11. Fetch Profile (No Token - Fail)
    const profileNoTokenRes = await request('/api/auth/profile');
    assertEq(profileNoTokenRes.status, 401, 'GET /api/auth/profile without authorization code');

    // 12. Fetch Profile (With Token - Success)
    const profileRes = await request('/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${clientToken}` }
    });
    const profileData = await profileRes.json();
    assertEq(profileRes.status, 200, 'GET /api/auth/profile with authorization code');
    assertEq(profileData.user.email, testEmail, 'GET /api/auth/profile matching email data');

    // 13. Update Profile (Success)
    const updateProfileRes = await request('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({
        name: 'Updated Tester Name',
        phone: '03001234567'
      })
    });
    const updateProfileData = await updateProfileRes.json();
    assertEq(updateProfileRes.status, 200, 'PUT /api/auth/profile update code');
    assertEq(updateProfileData.user.name, 'Updated Tester Name', 'PUT /api/auth/profile verified updated field');

    // 14. Session Refresh Rotation (Success)
    // Make sure we have the cookie set from request() automatically
    const refreshRes = await request('/api/auth/refresh', {
      method: 'POST'
    });
    const refreshData = await refreshRes.json();
    assertEq(refreshRes.status, 200, 'POST /api/auth/refresh rotation code');
    assert(refreshData.token !== undefined, 'POST /api/auth/refresh returns rotated access token');
    // Save updated token
    clientToken = refreshData.token;

    // 15. User Logout (Success)
    const logoutRes = await request('/api/auth/logout', {
      method: 'POST'
    });
    assertEq(logoutRes.status, 200, 'POST /api/auth/logout code');
    
    // Clear cookies & mock user login again for subsequent protected tests
    cookieStore = {};
    const reloginRes = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    const reloginData = await reloginRes.json();
    clientToken = reloginData.token;


    // -----------------------------------------------------------------
    // SECTION 2: USER ADDRESS MANAGEMENT (Tests 16-24)
    // -----------------------------------------------------------------

    // 16. Add Address (Success)
    const addAddrRes = await request('/api/auth/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({
        name: 'Tester Residence',
        street: '456 Olive Street',
        city: 'Lahore',
        province: 'Punjab',
        phone: '03009999999',
        isDefault: true
      })
    });
    const addAddrData = await addAddrRes.json();
    assertEq(addAddrRes.status, 201, 'POST /api/auth/addresses status code');
    assert(addAddrData.addresses.length > 0, 'POST /api/auth/addresses returned items');
    createdAddressId = addAddrData.addresses[0]._id;

    // 17. Add Address Validation (Missing Name Fail)
    const addAddrNoNameRes = await request('/api/auth/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({
        street: '456 Olive Street',
        city: 'Lahore',
        province: 'Punjab',
        phone: '03009999999'
      })
    });
    assertEq(addAddrNoNameRes.status, 400, 'POST /api/auth/addresses missing name code');

    // 18. Add Address Validation (Missing Street Fail)
    const addAddrNoStreetRes = await request('/api/auth/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({
        name: 'Tester',
        city: 'Lahore',
        province: 'Punjab',
        phone: '03009999999'
      })
    });
    assertEq(addAddrNoStreetRes.status, 400, 'POST /api/auth/addresses missing street code');

    // 19. Add Address Validation (Missing City Fail)
    const addAddrNoCityRes = await request('/api/auth/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({
        name: 'Tester',
        street: '456 Olive Street',
        province: 'Punjab',
        phone: '03009999999'
      })
    });
    assertEq(addAddrNoCityRes.status, 400, 'POST /api/auth/addresses missing city code');

    // 20. Add Address Validation (Missing Province Fail)
    const addAddrNoProvRes = await request('/api/auth/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({
        name: 'Tester',
        street: '456 Olive Street',
        city: 'Lahore',
        phone: '03009999999'
      })
    });
    assertEq(addAddrNoProvRes.status, 400, 'POST /api/auth/addresses missing province code');

    // 21. Add Address Validation (Missing Phone Fail)
    const addAddrNoPhoneRes = await request('/api/auth/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({
        name: 'Tester',
        street: '456 Olive Street',
        city: 'Lahore',
        province: 'Punjab'
      })
    });
    assertEq(addAddrNoPhoneRes.status, 400, 'POST /api/auth/addresses missing phone code');

    // 22. Update Address (Success)
    const updateAddrRes = await request(`/api/auth/addresses/${createdAddressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({
        name: 'Updated Tester Residence',
        street: '789 Pine Avenue',
        city: 'Islamabad',
        province: 'Federal',
        phone: '03008888888',
        isDefault: true
      })
    });
    const updateAddrData = await updateAddrRes.json();
    assertEq(updateAddrRes.status, 200, 'PUT /api/auth/addresses/:id code');
    assert(updateAddrData.addresses.find(a => a._id === createdAddressId).city === 'Islamabad', 'PUT /api/auth/addresses/:id verified modified field');

    // 23. Update Address (Validation Empty Street Fail)
    const updateAddrBadRes = await request(`/api/auth/addresses/${createdAddressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({
        name: 'Updated Tester Residence',
        street: '',
        city: 'Islamabad',
        province: 'Federal',
        phone: '03008888888'
      })
    });
    assertEq(updateAddrBadRes.status, 400, 'PUT /api/auth/addresses/:id empty street validation error');

    // 24. Delete Address (Success)
    const deleteAddrRes = await request(`/api/auth/addresses/${createdAddressId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${clientToken}`
      }
    });
    assertEq(deleteAddrRes.status, 200, 'DELETE /api/auth/addresses/:id success code');


    // -----------------------------------------------------------------
    // SECTION 3: CART & WISHLIST PERSISTENCE SYNC (Tests 25-30)
    // -----------------------------------------------------------------

    // Seed a product to reference in the cart
    const tempProduct = await Product.findOne();
    sampleProductId = tempProduct._id.toString();

    // 25. Get Cart (Success - Empty or Initial)
    const getCartRes = await request('/api/auth/cart', {
      headers: { 'Authorization': `Bearer ${clientToken}` }
    });
    assertEq(getCartRes.status, 200, 'GET /api/auth/cart code');

    // 26. Sync Cart (Success)
    const syncCartRes = await request('/api/auth/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({
        items: [
          {
            _id: sampleProductId,
            quantity: 2,
            color: '#1a1a1a',
            size: 'M'
          }
        ]
      })
    });
    assertEq(syncCartRes.status, 200, 'POST /api/auth/cart sync code');

    // 27. Verify Sync Cart contents persisted (Success)
    const verifyCartRes = await request('/api/auth/cart', {
      headers: { 'Authorization': `Bearer ${clientToken}` }
    });
    const verifyCartData = await verifyCartRes.json();
    assertEq(verifyCartRes.status, 200, 'GET /api/auth/cart retrieval code');
    assertEq(verifyCartData.cart.length, 1, 'GET /api/auth/cart items length matching');
    assertEq(verifyCartData.cart[0]._id, sampleProductId, 'GET /api/auth/cart matches synced product ID');

    // 28. Get Wishlist (Success - Empty or Initial)
    const getWishRes = await request('/api/auth/wishlist', {
      headers: { 'Authorization': `Bearer ${clientToken}` }
    });
    assertEq(getWishRes.status, 200, 'GET /api/auth/wishlist code');

    // 29. Sync Wishlist (Success)
    const syncWishRes = await request('/api/auth/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({
        items: [sampleProductId]
      })
    });
    assertEq(syncWishRes.status, 200, 'POST /api/auth/wishlist sync code');

    // 30. Verify Sync Wishlist contents persisted (Success)
    const verifyWishRes = await request('/api/auth/wishlist', {
      headers: { 'Authorization': `Bearer ${clientToken}` }
    });
    const verifyWishData = await verifyWishRes.json();
    assertEq(verifyWishRes.status, 200, 'GET /api/auth/wishlist retrieval code');
    assertEq(verifyWishData.wishlist.length, 1, 'GET /api/auth/wishlist products count matching');
    assertEq(verifyWishData.wishlist[0]._id, sampleProductId, 'GET /api/auth/wishlist matches synced product ID');


    // -----------------------------------------------------------------
    // SECTION 4: PRODUCT CATALOG ADMINISTRATION & REVIEWS (Tests 31-44)
    // -----------------------------------------------------------------

    // Log in as seeded Admin to get admin credentials
    const adminLoginRes = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@beautyx.com',
        password: 'Admin1234'
      })
    });
    const adminLoginData = await adminLoginRes.json();
    adminToken = adminLoginData.token;

    // 31. Get All Products (Success)
    const getProductsRes = await request('/api/products');
    const getProductsData = await getProductsRes.json();
    assertEq(getProductsRes.status, 200, 'GET /api/products code');
    assert(getProductsData.data.products.length > 0, 'GET /api/products returns products');

    // 32. Get Product By Slug (Success)
    const sampleSlug = tempProduct.slug;
    const getProductSlugRes = await request(`/api/products/${sampleSlug}`);
    assertEq(getProductSlugRes.status, 200, 'GET /api/products/:slug code');

    // 33. Get Product By Non-Existent Slug (Fail)
    const getProductBadSlugRes = await request('/api/products/some-impossible-slug-name-xyz-2026');
    assertEq(getProductBadSlugRes.status, 404, 'GET /api/products/:slug non-existent slug returns 404');

    // 34. Create Product (Admin Only - Success)
    const testProductBody = {
      name: 'Integration Test Bra',
      slug: `test-bra-${Date.now()}`,
      price: 1999,
      category: 'bras',
      colors: ['#000000'],
      sizes: ['M'],
      description: 'Test product for automated endpoint assertions.',
      fabric: 'Nylon power mesh',
      images: [{ url: 'https://images.unsplash.com/photo-1594913785162-e6785b423cb1' }],
      stock: 10,
      bg: 'from-[#b88a8f] to-[#8a5a62]'
    };
    const createProdRes = await request('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(testProductBody)
    });
    const createProdData = await createProdRes.json();
    assertEq(createProdRes.status, 201, 'POST /api/products code');
    if (createProdRes.status !== 201) {
      console.error('Create product fail response:', createProdData);
    }
    createdProductId = createProdData.product?._id;

    // 35. Create Product (Non-Admin - Blocked)
    const createProdUserRes = await request('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify(testProductBody)
    });
    assertEq(createProdUserRes.status, 403, 'POST /api/products non-admin blocked with 403');

    // 36. Create Product Validation (Missing Name Fail)
    const createProdNoNameRes = await request('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        ...testProductBody,
        name: '',
        slug: `test-bra-no-name-${Date.now()}`
      })
    });
    assertEq(createProdNoNameRes.status, 400, 'POST /api/products validation empty name code');

    // 37. Create Product Validation (Bad Category Fail)
    const createProdBadCatRes = await request('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        ...testProductBody,
        category: 'electronics',
        slug: `test-bra-bad-cat-${Date.now()}`
      })
    });
    assertEq(createProdBadCatRes.status, 400, 'POST /api/products validation invalid category code');

    // 38. Create Product Validation (Bad Price Fail)
    const createProdBadPriceRes = await request('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        ...testProductBody,
        price: 'not-a-number',
        slug: `test-bra-bad-price-${Date.now()}`
      })
    });
    assertEq(createProdBadPriceRes.status, 400, 'POST /api/products validation bad price code');

    // 39. Create Product Validation (Missing Images Fail)
    const createProdNoImgRes = await request('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        ...testProductBody,
        images: [],
        slug: `test-bra-no-img-${Date.now()}`
      })
    });
    assertEq(createProdNoImgRes.status, 400, 'POST /api/products validation missing images code');

    // 40. Update Product (Admin Only - Success)
    const updateProdRes = await request(`/api/products/${createdProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        ...testProductBody,
        name: 'Updated Integration Test Bra Name'
      })
    });
    const updateProdData = await updateProdRes.json();
    assertEq(updateProdRes.status, 200, 'PUT /api/products/:id code');
    assertEq(updateProdData.product.name, 'Updated Integration Test Bra Name', 'PUT /api/products/:id verified name update');

    // 41. Update Product (Non-Admin - Blocked)
    const updateProdUserRes = await request(`/api/products/${createdProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({
        ...testProductBody,
        name: 'Updated By User'
      })
    });
    assertEq(updateProdUserRes.status, 403, 'PUT /api/products/:id non-admin blocked with 403');

    // 42. Delete Product (Non-Admin - Blocked)
    const deleteProdUserRes = await request(`/api/products/${createdProductId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${clientToken}`
      }
    });
    assertEq(deleteProdUserRes.status, 403, 'DELETE /api/products/:id non-admin blocked with 403');

    // Seed a mock delivered order for this product so the review is allowed
    await Order.create({
      user: clientUserId,
      items: [{
        product: sampleProductId,
        name: 'Sample Seeded Product',
        price: 1000,
        quantity: 1,
        color: '#000000',
        size: 'M'
      }],
      total: 1000,
      shippingAddress: {
        name: 'Tester',
        street: 'Street',
        city: 'City',
        province: 'Province',
        phone: '123456'
      },
      paymentMethod: 'cod',
      paymentStatus: 'paid',
      orderStatus: 'delivered'
    });

    // 43. Add Product Review (Success)
    // We add a review to the sample product seeded previously
    const reviewRes = await request(`/api/products/${sampleProductId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({
        rating: 5,
        comment: 'Absolutely stunning fit and design!'
      })
    });
    assertEq(reviewRes.status, 201, 'POST /api/products/:id/reviews code');

    // 44. Add Product Review Validation (Out of Bounds Rating Fail)
    const reviewBadRes = await request(`/api/products/${sampleProductId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({
        rating: 6,
        comment: 'Too high rating'
      })
    });
    assertEq(reviewBadRes.status, 400, 'POST /api/products/:id/reviews out-of-bounds rating validation error');

    // 45. Add Product Review Validation (Missing Comment Fail)
    const reviewNoCommentRes = await request(`/api/products/${sampleProductId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({
        rating: 4,
        comment: ''
      })
    });
    assertEq(reviewNoCommentRes.status, 400, 'POST /api/products/:id/reviews empty comment validation error');


    // -----------------------------------------------------------------
    // SECTION 5: ORDERS & CHECKOUT (Tests 46-53)
    // -----------------------------------------------------------------

    const sampleOrderBody = {
      items: [
        {
          product: sampleProductId,
          name: tempProduct.name,
          price: tempProduct.price,
          quantity: 1,
          color: '#000000',
          size: 'M'
        }
      ],
      shippingAddress: {
        name: 'Order Recipient',
        street: '123 Test Boulevard',
        city: 'Karachi',
        province: 'Sindh',
        phone: '03215551234'
      },
      paymentMethod: 'cod',
      total: tempProduct.price
    };

    // 46. Create Order (Success)
    const createOrderRes = await request('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify(sampleOrderBody)
    });
    const createOrderData = await createOrderRes.json();
    assertEq(createOrderRes.status, 201, 'POST /api/orders code');
    assert(createOrderData.success === true, 'POST /api/orders success body parameter');
    createdOrderId = createOrderData.order._id;

    // 47. Create Order Validation (Empty items Fail)
    const orderNoItemsRes = await request('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({
        ...sampleOrderBody,
        items: []
      })
    });
    assertEq(orderNoItemsRes.status, 400, 'POST /api/orders empty items validation');

    // 48. Create Order Validation (Invalid Product ID Fail)
    const orderBadIdRes = await request('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({
        ...sampleOrderBody,
        items: [
          {
            ...sampleOrderBody.items[0],
            product: 'non-mongo-id'
          }
        ]
      })
    });
    assertEq(orderBadIdRes.status, 400, 'POST /api/orders invalid product ID validation');

    // 49. Create Order Validation (Bad Shipping Address Fail)
    const orderBadAddressRes = await request('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({
        ...sampleOrderBody,
        shippingAddress: {
          name: 'Name'
          // missing rest
        }
      })
    });
    assertEq(orderBadAddressRes.status, 400, 'POST /api/orders incomplete address validation');

    // 50. Get My Orders (Success)
    const getMyOrdersRes = await request('/api/orders/my-orders', {
      headers: { 'Authorization': `Bearer ${clientToken}` }
    });
    const getMyOrdersData = await getMyOrdersRes.json();
    assertEq(getMyOrdersRes.status, 200, 'GET /api/orders/my-orders code');
    assert(getMyOrdersData.orders.length > 0, 'GET /api/orders/my-orders items count matching');

    // 51. Get Order By ID (Success)
    const getOrderByIdRes = await request(`/api/orders/${createdOrderId}`, {
      headers: { 'Authorization': `Bearer ${clientToken}` }
    });
    assertEq(getOrderByIdRes.status, 200, 'GET /api/orders/:id code');

    // 52. Get All Orders (Admin Only - Success)
    const getOrdersAdminRes = await request('/api/orders', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assertEq(getOrdersAdminRes.status, 200, 'GET /api/orders with admin token code');

    // 53. Get All Orders (Non-Admin - Blocked)
    const getOrdersUserRes = await request('/api/orders', {
      headers: { 'Authorization': `Bearer ${clientToken}` }
    });
    assertEq(getOrdersUserRes.status, 403, 'GET /api/orders with non-admin token code (blocked)');


    // -----------------------------------------------------------------
    // SECTION 6: ADMIN USER MANAGEMENT & SUSPENSION (Tests 71-76)
    // -----------------------------------------------------------------

    // 71. Admin Get All Users (Success)
    const getUsersRes = await request('/api/auth/users', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const getUsersData = await getUsersRes.json();
    assertEq(getUsersRes.status, 200, 'GET /api/auth/users status code');
    assert(getUsersData.users.length > 0, 'GET /api/auth/users returns users list');

    // 72. Admin Suspend User (Success)
    const suspendRes = await request(`/api/auth/users/${clientUserId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'suspended' })
    });
    assertEq(suspendRes.status, 200, 'PUT /api/auth/users/:id/status suspend code');

    // 73. Access Protected Route as Suspended User (Fail - 403)
    const suspendedAccessRes = await request('/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${clientToken}` }
    });
    assertEq(suspendedAccessRes.status, 403, 'GET /api/auth/profile as suspended user returns 403');

    // 74. Login as Suspended User (Fail - 403)
    const suspendedLoginRes = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    assertEq(suspendedLoginRes.status, 403, 'POST /api/auth/login as suspended user returns 403');

    // 75. Admin Reactivate User (Success)
    const reactivateRes = await request(`/api/auth/users/${clientUserId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'active' })
    });
    assertEq(reactivateRes.status, 200, 'PUT /api/auth/users/:id/status reactivate code');

    // 76. Login as Reactivated User (Success)
    const reactivatedLoginRes = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    assertEq(reactivatedLoginRes.status, 200, 'POST /api/auth/login as reactivated user returns 200');


    // Cleanup test product created in POST test
    if (createdProductId) {
      await Product.findByIdAndDelete(createdProductId);
      console.log('🧹 Cleaned up created test product ID:', createdProductId);
    }
    // Delete newly created order
    if (createdOrderId) {
      await Order.findByIdAndDelete(createdOrderId);
      console.log('🧹 Cleaned up created test order ID:', createdOrderId);
    }

    // Clean up created reviews
    await Review.deleteMany({ user: clientUserId });
    console.log('🧹 Cleaned up reviews for test user.');

    // Cleanup integration test user
    await User.findByIdAndDelete(clientUserId);
    console.log('🧹 Cleaned up registered integration test user.');

    console.log('\n======================================');
    console.log(`🎉 Tests completed. Passed: ${passedCount}, Failed: ${failedCount}`);
    console.log('======================================');

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Execution interrupted due to runtime error:', error);
    process.exit(1);
  }
}

startTesting();
