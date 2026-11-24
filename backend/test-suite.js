// SECURE GRIEVANCE MANAGEMENT SYSTEM
// Comprehensive End-to-End Automated Verification Script

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('   SECURE GRIEVANCE MANAGEMENT SYSTEM - TEST SUITE   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Health Check
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    assert(res.ok && data.status === 'online', '1. System Health API is online');
  } catch (err) {
    assert(false, `1. System Health API failed: ${err.message}`);
  }

  // 2. Student Registration
  let newStudentToken = '';
  const testEmail = `test.student.${Date.now()}@university.edu`;
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test Student',
        email: testEmail,
        password: 'Password@123',
        student_id: 'TEST-2026-9999',
        phone: '+1-555-0999',
        department_id: 1
      })
    });
    const data = await res.json();
    newStudentToken = data.token;
    assert(res.status === 201 && data.success && data.token, '2. Student registration endpoint');
  } catch (err) {
    assert(false, `2. Student registration failed: ${err.message}`);
  }

  // 3. User Login (Role Verification)
  let adminToken = '';
  let officerToken = '';
  try {
    // Admin login
    const adminRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@university.edu', password: 'Password@123' })
    });
    const adminData = await adminRes.json();
    adminToken = adminData.token;
    assert(adminData.success && adminData.user.role === 'admin', '3. Admin authentication & role check');

    // Officer login
    const offRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'officer.academics@university.edu', password: 'Password@123' })
    });
    const offData = await offRes.json();
    officerToken = offData.token;
    assert(offData.success && offData.user.role === 'officer', '4. Department officer authentication');
  } catch (err) {
    assert(false, `3-4. Login failed: ${err.message}`);
  }

  // 5. Anonymous Complaint Submission & Auto-routing
  let anonRefId = '';
  let anonToken = '';
  try {
    const res = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'Mess & Food Quality',
        subject: 'Canteen oil quality and stale sandwich delivery',
        description: 'Vegetables used in sandwich preparations were expired and bread packaging had mould. Immediate audit needed.',
        anonymous: true,
        priority: 'High'
      })
    });
    const data = await res.json();
    anonRefId = data.data.referenceId;
    anonToken = data.data.trackingToken;
    assert(
      data.success && data.data.anonymous === true && data.data.departmentName.includes('Mess') && anonRefId.startsWith('GRV-'),
      `5. Anonymous complaint submission & auto-routing (Ref: ${anonRefId})`
    );
  } catch (err) {
    assert(false, `5. Anonymous submission failed: ${err.message}`);
  }

  // 6. Identified Complaint Submission
  let identifiedRefId = '';
  let identifiedComplaintId = null;
  try {
    const res = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newStudentToken}`
      },
      body: JSON.stringify({
        category: 'Hostel Facilities',
        subject: 'Faulty geyser and heater circuit on floor 2',
        description: 'Water heater circuit tripping every 10 minutes in Room 208 Block B.',
        anonymous: false,
        priority: 'Medium'
      })
    });
    const data = await res.json();
    identifiedRefId = data.data.referenceId;
    identifiedComplaintId = data.data.id;
    assert(
      data.success && data.data.anonymous === false && data.data.departmentName.includes('Hostel'),
      `6. Identified complaint submission (Ref: ${identifiedRefId})`
    );
  } catch (err) {
    assert(false, `6. Identified submission failed: ${err.message}`);
  }

  // 7. Reference-based Tracking (Public vs Token Verified)
  try {
    // Unverified public call (no token)
    const pubRes = await fetch(`${BASE_URL}/complaints/track/${anonRefId}`);
    const pubData = await pubRes.json();
    assert(pubData.success && pubData.verified === false && !pubData.complaint.description, '7a. Public tracking protects private details without token');

    // Verified call with secret tracking token
    const verRes = await fetch(`${BASE_URL}/complaints/track/${anonRefId}?token=${anonToken}`);
    const verData = await verRes.json();
    assert(verData.success && verData.verified === true && verData.complaint.description.length > 0, '7b. Tracking with secret token unlocks full notes & details');
  } catch (err) {
    assert(false, `7. Tracking lookup failed: ${err.message}`);
  }

  // 8. Role-based Access Control (Students cannot modify status)
  try {
    const res = await fetch(`${BASE_URL}/complaints/${identifiedComplaintId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newStudentToken}`
      },
      body: JSON.stringify({ status: 'Resolved' })
    });
    assert(res.status === 403, '8. RBAC security: student blocked from changing complaint status (HTTP 403)');
  } catch (err) {
    assert(false, `8. RBAC test failed: ${err.message}`);
  }

  // 9. Status Update by Authorized Staff
  try {
    const res = await fetch(`${BASE_URL}/complaints/${identifiedComplaintId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'In Progress',
        message: 'Hostel electrician dispatched to check heating coil and breaker.',
        is_internal: false
      })
    });
    const data = await res.json();
    assert(data.success && data.message.includes('In Progress'), '9. Authorized staff successfully transitioned workflow status');
  } catch (err) {
    assert(false, `9. Status update failed: ${err.message}`);
  }

  // 10. Manual Escalation to Grievance Committee
  try {
    const res = await fetch(`${BASE_URL}/complaints/${identifiedComplaintId}/escalate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newStudentToken}`
      },
      body: JSON.stringify({
        reason: 'Repeated delays with no resolution and winter temperatures dropping rapidly.'
      })
    });
    const data = await res.json();
    assert(data.success && data.message.includes('escalated'), '10. Student manual escalation forwarded case to Grievance Committee');
  } catch (err) {
    assert(false, `10. Escalation failed: ${err.message}`);
  }

  // 11. Admin Dashboard Analytics (Real Database Queries)
  try {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    assert(
      data.success && data.stats.total >= 7 && data.categoryStats.length > 0 && data.departmentStats.length > 0,
      '11. Real MySQL analytics aggregated by Admin Dashboard'
    );
  } catch (err) {
    assert(false, `11. Admin dashboard query failed: ${err.message}`);
  }

  // 12. Public Departments Dropdown
  try {
    const res = await fetch(`${BASE_URL}/public/departments`);
    const data = await res.json();
    assert(data.success && data.departments.length >= 8, '12. Public departments dropdown API');
  } catch (err) {
    assert(false, `12. Public departments failed: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed === 0) {
    console.log('🎉 ALL 12 END-TO-END AUTOMATED VERIFICATION TESTS PASSED!');
  } else {
    process.exit(1);
  }
}

runTests();
