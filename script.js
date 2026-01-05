// Utility to get data from localStorage
function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

// Utility to save data to localStorage
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Show notification
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
}

// Registration functions
async function registerDonor(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const name = formData.get('name');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const password = formData.get('password');
  const confirm = formData.get('confirm');
  const blood = formData.get('blood');
  const location = formData.get('location');

  // Validation
  if (!name || !email || !phone || !password || !confirm || !blood || !location) {
    showNotification("Please fill in all fields.", "error");
    return;
  }

  if (password !== confirm) {
    showNotification("Passwords do not match.", "error");
    return;
  }

  if (password.length < 6) {
    showNotification("Password must be at least 6 characters long.", "error");
    return;
  }

  try {
    // Use API to register donor
    const userData = {
      name,
      email,
      phone,
      password,
      bloodType: blood,
      address: location,
      longitude: 90.3563, // Default coordinates for Dhaka
      latitude: 23.8103
    };

    const response = await api.registerDonor(userData);
    
    if (response.token) {
      showNotification("Registration successful! Please login.", "success");
      setTimeout(() => window.location.href = "login.html", 1500);
    } else {
      showNotification("Registration failed. Please try again.", "error");
    }
  } catch (error) {
    console.error('Registration error:', error);
    showNotification(error.message || "Registration failed. Please try again.", "error");
  }
}

async function registerRecipient(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const name = formData.get('name');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const password = formData.get('password');
  const confirm = formData.get('confirm');
  const blood = formData.get('blood');
  const location = formData.get('location');

  // Validation
  if (!name || !email || !phone || !password || !confirm || !blood || !location) {
    showNotification("Please fill in all fields.", "error");
    return;
  }

  if (password !== confirm) {
    showNotification("Passwords do not match.", "error");
    return;
  }

  if (password.length < 6) {
    showNotification("Password must be at least 6 characters long.", "error");
    return;
  }

  try {
    // Use API to register recipient
    const userData = {
      name,
      email,
      phone,
      password,
      bloodType: blood,
      address: location,
      longitude: 90.3563, // Default coordinates for Dhaka
      latitude: 23.8103
    };

    const response = await api.registerRecipient(userData);
    
    if (response.token) {
      showNotification("Registration successful! Please login.", "success");
      setTimeout(() => window.location.href = "login.html", 1500);
    } else {
      showNotification("Registration failed. Please try again.", "error");
    }
  } catch (error) {
    console.error('Registration error:', error);
    showNotification(error.message || "Registration failed. Please try again.", "error");
  }
}

// Login function
async function loginUser(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const loginType = document.getElementById('loginType').value;

  if (!email || !password || !loginType) {
    showNotification("Please fill in all fields.", "error");
    return;
  }

  try {
    let user;
    
    if (loginType === 'admin') {
      // Admin login - keep local for demo
      if (email === 'admin@rapidblood.com' && password === 'admin123') {
        user = { 
          name: 'Admin', 
          email, 
          role: 'admin',
          loginTime: new Date().toISOString()
        };
      }
    } else {
      // Use API for donor/recipient login
      const response = await api.login(email, password);
      if (response.user && response.user.userType === loginType) {
        user = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.userType,
          blood: response.user.bloodType,
          location: response.user.location?.address || 'Unknown Location',
          phone: response.user.phone,
          loginTime: new Date().toISOString(),
          lastActive: new Date().toISOString()
        };
      }
    }

    if (user) {
      // Store user data
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Initialize Socket.IO for real-time features
      if (user.id && user.role !== 'admin') {
        socketService.connect(user.id);
      }
      
      showNotification(`Welcome back, ${user.name}!`, "success");
      
      setTimeout(() => {
        let redirectUrl;
        switch (user.role) {
          case 'donor':
            redirectUrl = 'donor-dashboard.html';
            break;
          case 'recipient':
            redirectUrl = 'recipient-dashboard.html';
            break;
          case 'admin':
            redirectUrl = 'admin-dashboard.html';
            break;
          default:
            redirectUrl = 'index.html';
        }
        window.location.href = redirectUrl;
      }, 1000);
    } else {
      showNotification("Invalid email or password.", "error");
    }
  } catch (error) {
    console.error('Login error:', error);
    showNotification(error.message || "Login failed. Please try again.", "error");
  }
}

// Logout function
function logout() {
  // Disconnect Socket.IO if connected
  if (typeof socketService !== 'undefined') {
    socketService.disconnect();
  }
  
  // Clear API token
  if (typeof api !== 'undefined') {
    api.clearToken();
  }
  
  localStorage.removeItem('currentUser');
  showNotification("Logged out successfully.", "success");
  setTimeout(() => window.location.href = "index.html", 1000);
}

// Donor Dashboard functions
function loadDonorDashboard() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user || user.role !== 'donor') {
    window.location.href = 'login.html';
    return;
  }

  const donors = getData('donors');
  const donor = donors.find(d => d.email === user.email);
  if (!donor) return;

  // Update profile information
  document.getElementById('donorName').textContent = donor.name;
  document.getElementById('donorEmail').textContent = donor.email;
  document.getElementById('donorPhone').textContent = donor.phone;
  document.getElementById('donorBlood').textContent = donor.blood;
  document.getElementById('donorLocation').textContent = donor.location;

  // Set availability status
  const availabilitySelect = document.getElementById('availabilitySelect');
  if (availabilitySelect) {
    availabilitySelect.value = donor.available ? 'available' : 'unavailable';
  }

  // Load blood requests
  loadBloodRequests(donor.name);
}

function updateAvailability(status) {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user) return;

  const donors = getData('donors');
  const donorIndex = donors.findIndex(d => d.email === user.email);
  
  if (donorIndex !== -1) {
    donors[donorIndex].available = status === 'available';
    saveData('donors', donors);
    
    const message = status === 'available' ? 
      'You are now available for blood donation.' : 
      'You are now unavailable for blood donation.';
    showNotification(message, 'success');
  }
}

function loadBloodRequests(donorName) {
  const requests = getData('requests') || [];
  const recipients = getData('recipients') || [];
  const myRequests = requests.filter(r => r.to === donorName);
  const requestList = document.getElementById('requestList');

  if (myRequests.length === 0) {
    requestList.innerHTML = `
      <div class="no-requests">
        <i class="fas fa-inbox"></i>
        <p>No blood requests at the moment</p>
        <span>You'll be notified when someone needs your blood type</span>
      </div>
    `;
  } else {
    requestList.innerHTML = myRequests.map(request => {
      // Find recipient details to get phone number
      const recipient = recipients.find(r => r.name === request.from);
      const recipientPhone = recipient ? recipient.phone : 'Not available';
      
      return `
        <div class="request-card">
          <div class="request-header">
            <h4><i class="fas fa-user"></i> ${request.from}</h4>
            <span class="request-date">${new Date(request.date).toLocaleDateString()}</span>
          </div>
          <div class="request-body">
            <p><i class="fas fa-tint"></i> <strong>Blood Type:</strong> ${request.bloodType}</p>
            <p><i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> ${request.location}</p>
            <p><i class="fas fa-phone"></i> <strong>Phone:</strong> ${recipientPhone}</p>
            <p><i class="fas fa-comment"></i> <strong>Message:</strong> ${request.message}</p>
          </div>
          <div class="request-actions">
            <button onclick="respondToRequest('${request.id}', 'accept')" class="btn-accept">
              <i class="fas fa-check"></i> Accept
            </button>
            <button onclick="respondToRequest('${request.id}', 'decline')" class="btn-decline">
              <i class="fas fa-times"></i> Decline
            </button>
            <button onclick="reachRecipient('${recipientPhone}', '${request.from}')" class="btn-reach">
              <i class="fas fa-phone"></i> Reach
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Recipient Dashboard functions
function loadRecipientDashboard() {
  const user = getCurrentUser();
  if (!user || user.role !== 'recipient') {
    console.log('User not found or not a recipient:', user);
    return;
  }

  const recipients = getData('recipients');
  const recipient = recipients.find(r => r.email === user.email);
  
  // If recipient not found in data, use user data
  const recipientData = recipient || user;
  
  // Update profile information
  const nameElement = document.getElementById('recipientName');
  const emailElement = document.getElementById('recipientEmail');
  const phoneElement = document.getElementById('recipientPhone');
  const bloodElement = document.getElementById('recipientBlood');
  const locationElement = document.getElementById('recipientLocation');
  
  if (nameElement) nameElement.textContent = recipientData.name || 'Recipient';
  if (emailElement) emailElement.textContent = recipientData.email || 'N/A';
  if (phoneElement) phoneElement.textContent = recipientData.phone || 'N/A';
  if (bloodElement) bloodElement.textContent = recipientData.blood || 'N/A';
  if (locationElement) locationElement.textContent = recipientData.location || 'N/A';
  
  // Update debug panel
  updateDebugPanel();
  
  console.log('Recipient dashboard loaded for:', recipientData);
}

function searchDonors() {
  const searchLocation = document.getElementById('searchLocation').value;
  const user = JSON.parse(localStorage.getItem('currentUser'));
  
  if (!searchLocation.trim()) {
    showNotification("Please enter a location to search.", "error");
    return;
  }

  const recipients = getData('recipients');
  const recipient = recipients.find(r => r.email === user?.email);
  const recipientData = recipient || user || {};
  const donors = getData('donors');
  
  // Filter donors by location and blood type compatibility
  const compatibleDonors = donors.filter(donor => 
    donor.available &&
    (donor.location || '').toLowerCase().includes(searchLocation.toLowerCase()) &&
    isBloodCompatible(recipientData.blood, donor.blood)
  );

  displayDonors(compatibleDonors, recipientData);
}

function isBloodCompatible(recipientBlood, donorBlood) {
  // Map recipient blood type -> list of acceptable donor blood types
  const compatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'], // universal recipient
    'AB-': ['AB-', 'A-', 'B-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  };

  if (!recipientBlood || !donorBlood) return false;
  return compatibility[recipientBlood]?.includes(donorBlood) || false;
}

function displayDonors(donors, recipient) {
  const donorList = document.getElementById('donorsList');
  
  if (donors.length === 0) {
    donorList.innerHTML = `
      <div class="no-donors">
        <i class="fas fa-search"></i>
        <p>No compatible donors found in this location</p>
        <span>Try searching for a different location or check back later</span>
      </div>
    `;
  } else {
    donorList.innerHTML = donors.map(donor => `
      <div class="donor-card">
        <div class="donor-header">
          <h4><i class="fas fa-user"></i> ${donor.name}</h4>
          <span class="blood-type ${donor.blood.toLowerCase().replace('+', '-positive').replace('-', '-negative')}">${donor.blood}</span>
        </div>
        <div class="donor-body">
          <p><i class="fas fa-tint"></i> <strong>Blood Group:</strong> ${donor.blood}</p>
          <p><i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> ${donor.location}</p>
          <p><i class="fas fa-phone"></i> <strong>Phone:</strong> ${donor.phone}</p>
          <p><i class="fas fa-clock"></i> <strong>Available:</strong> <span class="status-available">Available for donation</span></p>
        </div>
        <div class="donor-actions">
          <button onclick="sendBloodRequest('${donor.name}', '${recipient.name}', '${donor.blood}', '${donor.location}')" class="btn-request">
            <i class="fas fa-heart"></i> Request Blood
          </button>
          <button onclick="reachDonor('${donor.phone}', '${donor.name}')" class="btn-reach">
            <i class="fas fa-phone"></i> Reach
          </button>
        </div>
      </div>
    `).join('');
  }
}

function sendBloodRequest(donorName, recipientName, bloodType, location) {
  const message = prompt("Please enter a message for the donor (optional):");
  
  const requests = getData('requests') || [];
  const newRequest = {
    id: Date.now().toString(),
    to: donorName,
    from: recipientName,
    bloodType,
    location,
    message: message || 'Urgent blood donation needed',
    date: new Date().toISOString(),
    status: 'pending'
  };
  
  requests.push(newRequest);
  saveData('requests', requests);
  
  showNotification("Blood request sent successfully!", "success");
}

function respondToRequest(requestId, response) {
  const requests = getData('requests');
  const requestIndex = requests.findIndex(r => r.id === requestId);
  
  if (requestIndex !== -1) {
    requests[requestIndex].status = response;
    requests[requestIndex].respondedAt = new Date().toISOString();
    saveData('requests', requests);
    
    const message = response === 'accept' ? 
      'You accepted the blood request. Please contact the recipient.' : 
      'You declined the blood request.';
    showNotification(message, 'success');
    
    // Reload requests
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const donors = getData('donors');
    const donor = donors.find(d => d.email === user.email);
    if (donor) {
      loadBloodRequests(donor.name);
    }
  }
}

function reachRecipient(phone, name) {
  if (phone && phone !== 'Not available') {
    if (confirm(`Do you want to call ${name} at ${phone}?`)) {
      window.open(`tel:${phone}`, '_self');
    }
  } else {
    showNotification('Phone number not available for this recipient', 'error');
  }
}

function reachDonor(phone, name) {
  if (phone) {
    if (confirm(`Do you want to call ${name} at ${phone}?`)) {
      window.open(`tel:${phone}`, '_self');
    }
  } else {
    showNotification('Phone number not available for this donor', 'error');
  }
}

// Admin Dashboard functions
function loadAdminDashboard() {
  console.log('=== LOADING ADMIN DASHBOARD ===');
  
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user || user.role !== 'admin') {
    console.log('User not admin, redirecting to login');
    window.location.href = 'login.html';
    return;
  }

  console.log('Admin user found:', user);

  const donors = getData('donors') || [];
  const recipients = getData('recipients') || [];
  const requests = getData('requests') || [];

  console.log('=== DEBUG: Admin Dashboard Data ===');
  console.log('Raw donors data:', donors);
  console.log('Raw recipients data:', recipients);
  console.log('Number of donors:', donors.length);
  console.log('Number of recipients:', recipients.length);
  
  // Log each donor's blood group data
  donors.forEach((donor, index) => {
    console.log(`Donor ${index + 1}:`, {
      name: donor.name,
      blood: donor.blood,
      bloodGroup: donor.bloodGroup,
      bloodType: donor.bloodType,
      allProperties: Object.keys(donor)
    });
  });
  
  // Log each recipient's blood group data
  recipients.forEach((recipient, index) => {
    console.log(`Recipient ${index + 1}:`, {
      name: recipient.name,
      blood: recipient.blood,
      bloodGroup: recipient.bloodGroup,
      bloodType: recipient.bloodType,
      allProperties: Object.keys(recipient)
    });
  });

  // Check and fix data inconsistencies
  fixBloodGroupData(donors, recipients);

  // Update statistics
  document.getElementById('totalDonors').textContent = donors.length;
  document.getElementById('totalRecipients').textContent = recipients.length;

  // Load donor table
  const donorTable = document.getElementById('donorTable').querySelector('tbody');
  donorTable.innerHTML = donors.map(donor => {
    // Enhanced blood group detection with more aggressive fallbacks
    let bloodGroup = donor.blood || donor.bloodGroup || donor.bloodType || 'N/A';
    
    // If still N/A, try to extract from any property that might contain blood info
    if (bloodGroup === 'N/A') {
      // Check all properties for any blood-related data
      const allProps = Object.values(donor).join(' ').toLowerCase();
      if (allProps.includes('a+') || allProps.includes('a positive')) bloodGroup = 'A+';
      else if (allProps.includes('a-') || allProps.includes('a negative')) bloodGroup = 'A-';
      else if (allProps.includes('b+') || allProps.includes('b positive')) bloodGroup = 'B+';
      else if (allProps.includes('b-') || allProps.includes('b negative')) bloodGroup = 'B-';
      else if (allProps.includes('ab+') || allProps.includes('ab positive')) bloodGroup = 'AB+';
      else if (allProps.includes('ab-') || allProps.includes('ab negative')) bloodGroup = 'AB-';
      else if (allProps.includes('o+') || allProps.includes('o positive')) bloodGroup = 'O+';
      else if (allProps.includes('o-') || allProps.includes('o negative')) bloodGroup = 'O-';
    }
    
    // Debug individual donor
    console.log(`Donor ${donor.name}:`, {
      blood: donor.blood,
      bloodGroup: donor.bloodGroup,
      bloodType: donor.bloodType,
      final: bloodGroup,
      allProperties: Object.keys(donor)
    });
    
    const bloodClass = bloodGroup !== 'N/A' ? 
      `blood-type ${bloodGroup.toLowerCase().replace('+', '-positive').replace('-', '-negative')}` : 
      'blood-type unknown';
    
    return `
      <tr>
        <td><i class="fas fa-user"></i> ${donor.name || 'N/A'}</td>
        <td><span class="${bloodClass}">${bloodGroup}</span></td>
        <td><i class="fas fa-map-marker-alt"></i> ${donor.location || 'N/A'}</td>
        <td><i class="fas fa-phone"></i> ${donor.phone || 'N/A'}</td>
      </tr>
    `;
  }).join('');

  // Load recipient table
  const recipientTable = document.getElementById('recipientTable').querySelector('tbody');
  recipientTable.innerHTML = recipients.map(recipient => {
    // Enhanced blood group detection with more aggressive fallbacks
    let bloodGroup = recipient.blood || recipient.bloodGroup || recipient.bloodType || 'N/A';
    
    // If still N/A, try to extract from any property that might contain blood info
    if (bloodGroup === 'N/A') {
      // Check all properties for any blood-related data
      const allProps = Object.values(recipient).join(' ').toLowerCase();
      if (allProps.includes('a+') || allProps.includes('a positive')) bloodGroup = 'A+';
      else if (allProps.includes('a-') || allProps.includes('a negative')) bloodGroup = 'A-';
      else if (allProps.includes('b+') || allProps.includes('b positive')) bloodGroup = 'B+';
      else if (allProps.includes('b-') || allProps.includes('b negative')) bloodGroup = 'B-';
      else if (allProps.includes('ab+') || allProps.includes('ab positive')) bloodGroup = 'AB+';
      else if (allProps.includes('ab-') || allProps.includes('ab negative')) bloodGroup = 'AB-';
      else if (allProps.includes('o+') || allProps.includes('o positive')) bloodGroup = 'O+';
      else if (allProps.includes('o-') || allProps.includes('o negative')) bloodGroup = 'O-';
    }
    
    // Debug individual recipient
    console.log(`Recipient ${recipient.name}:`, {
      blood: recipient.blood,
      bloodGroup: recipient.bloodGroup,
      bloodType: recipient.bloodType,
      final: bloodGroup,
      allProperties: Object.keys(recipient)
    });
    
    const bloodClass = bloodGroup !== 'N/A' ? 
      `blood-type ${bloodGroup.toLowerCase().replace('+', '-positive').replace('-', '-negative')}` : 
      'blood-type unknown';
    
    return `
      <tr>
        <td><i class="fas fa-user"></i> ${recipient.name || 'N/A'}</td>
        <td><span class="${bloodClass}">${bloodGroup}</span></td>
        <td><i class="fas fa-map-marker-alt"></i> ${recipient.location || 'N/A'}</td>
        <td><i class="fas fa-phone"></i> ${recipient.phone || 'N/A'}</td>
      </tr>
    `;
  }).join('');
}

// Function to fix blood group data inconsistencies
function fixBloodGroupData(donors, recipients) {
  let donorsUpdated = false;
  let recipientsUpdated = false;

  // Fix donors data
  donors.forEach(donor => {
    if (!donor.blood && !donor.bloodGroup && !donor.bloodType) {
      // If no blood group data exists, try to get it from registration form
      console.log(`Donor ${donor.name} has no blood group data`);
      
      // You can add a prompt here to ask admin to input blood group
      // For now, we'll set a default value
      donor.blood = 'Unknown';
      donorsUpdated = true;
    } else if (donor.bloodGroup && !donor.blood) {
      // If bloodGroup exists but blood doesn't, copy it
      donor.blood = donor.bloodGroup;
      donorsUpdated = true;
    } else if (donor.bloodType && !donor.blood) {
      // If bloodType exists but blood doesn't, copy it
      donor.blood = donor.bloodType;
      donorsUpdated = true;
    }
  });

  // Fix recipients data
  recipients.forEach(recipient => {
    if (!recipient.blood && !recipient.bloodGroup && !recipient.bloodType) {
      // If no blood group data exists, try to get it from registration form
      console.log(`Recipient ${recipient.name} has no blood group data`);
      
      // You can add a prompt here to ask admin to input blood group
      // For now, we'll set a default value
      recipient.blood = 'Unknown';
      recipientsUpdated = true;
    } else if (recipient.bloodGroup && !recipient.blood) {
      // If bloodGroup exists but blood doesn't, copy it
      recipient.blood = recipient.bloodGroup;
      recipientsUpdated = true;
    } else if (recipient.bloodType && !recipient.blood) {
      // If bloodType exists but blood doesn't, copy it
      recipient.blood = recipient.bloodType;
      recipientsUpdated = true;
    }
  });

  // Save updated data if any changes were made
  if (donorsUpdated) {
    saveData('donors', donors);
    console.log('Donors data updated');
  }
  
  if (recipientsUpdated) {
    saveData('recipients', recipients);
    console.log('Recipients data updated');
  }
}

// Function to manually fix blood group data (can be called from browser console)
function manualFixBloodGroups() {
  const donors = getData('donors');
  const recipients = getData('recipients');
  
  console.log('Current donors:', donors);
  console.log('Current recipients:', recipients);
  
  // Ask admin to input blood groups for users without them
  donors.forEach(donor => {
    if (!donor.blood && !donor.bloodGroup && !donor.bloodType) {
      const bloodGroup = prompt(`Please enter blood group for donor ${donor.name}:`);
      if (bloodGroup) {
        donor.blood = bloodGroup;
      }
    }
  });
  
  recipients.forEach(recipient => {
    if (!recipient.blood && !recipient.bloodGroup && !recipient.bloodType) {
      const bloodGroup = prompt(`Please enter blood group for recipient ${recipient.name}:`);
      if (bloodGroup) {
        recipient.blood = bloodGroup;
      }
    }
  });
  
  saveData('donors', donors);
  saveData('recipients', recipients);
  
  console.log('Blood groups updated. Please refresh the admin dashboard.');
  showNotification('Blood groups updated. Please refresh the page.', 'success');
}

// Quick test function to check and fix blood groups immediately
function quickFixBloodGroups() {
  console.log('=== QUICK FIX: Blood Groups ===');
  
  const donors = getData('donors');
  const recipients = getData('recipients');
  
  // Show current state
  console.log('Donors before fix:', donors.map(d => ({name: d.name, blood: d.blood})));
  console.log('Recipients before fix:', recipients.map(r => ({name: r.name, blood: r.blood})));
  
  // Force set blood groups for testing (you can modify these)
  donors.forEach((donor, index) => {
    if (!donor.blood) {
      // Set some default blood groups for testing
      const defaultGroups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'];
      donor.blood = defaultGroups[index % defaultGroups.length];
    }
  });
  
  recipients.forEach((recipient, index) => {
    if (!recipient.blood) {
      // Set some default blood groups for testing
      const defaultGroups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'];
      recipient.blood = defaultGroups[index % defaultGroups.length];
    }
  });
  
  // Save the changes
  saveData('donors', donors);
  saveData('recipients', recipients);
  
  console.log('Donors after fix:', donors.map(d => ({name: d.name, blood: d.blood})));
  console.log('Recipients after fix:', recipients.map(r => ({name: r.name, blood: r.blood})));
  
  // Reload the admin dashboard
  if (window.location.pathname.includes('admin-dashboard.html')) {
    loadAdminDashboard();
  }
  
  showNotification('Blood groups fixed! Check the admin dashboard.', 'success');
}

// Function to completely reset and test blood group data
function resetBloodGroupData() {
  console.log('=== RESET: Blood Group Data ===');
  
  // Clear existing data
  localStorage.removeItem('donors');
  localStorage.removeItem('recipients');
  
  // Create test data with proper blood groups
  const testDonors = [
    {name: 'Rudra', email: 'rudra@test.com', phone: '01945387171', blood: 'A+', location: 'Dhaka'},
    {name: 'Aurisha', email: 'aurisha@test.com', phone: '01945387173', blood: 'O-', location: 'Bikrumpur'},
    {name: 'Nerob', email: 'nerob@test.com', phone: '01945387174', blood: 'B+', location: 'Dhaka'}
  ];
  
  const testRecipients = [
    {name: 'Sameerah', email: 'sameerah@test.com', phone: '01945387172', blood: 'AB+', location: 'Dhaka'}
  ];
  
  // Save test data
  saveData('donors', testDonors);
  saveData('recipients', testRecipients);
  
  console.log('Test data created:', {donors: testDonors, recipients: testRecipients});
  
  // Reload the admin dashboard
  if (window.location.pathname.includes('admin-dashboard.html')) {
    loadAdminDashboard();
  }
  
  showNotification('Test data created! Check the admin dashboard.', 'success');
}

// Simple function to test admin dashboard immediately
function testAdminDashboard() {
  console.log('=== TESTING ADMIN DASHBOARD ===');
  
  // First, create test data
  resetBloodGroupData();
  
  // Wait a moment, then force reload
  setTimeout(() => {
    console.log('Forcing admin dashboard reload...');
    loadAdminDashboard();
    
    // Also try to manually update the tables
    const donorTable = document.getElementById('donorTable');
    const recipientTable = document.getElementById('recipientTable');
    
    if (donorTable && recipientTable) {
      console.log('Tables found, updating manually...');
      
      const donors = getData('donors') || [];
      const recipients = getData('recipients') || [];
      
      // Update donor table
      const donorTbody = donorTable.querySelector('tbody');
      if (donorTbody) {
        donorTbody.innerHTML = donors.map(donor => `
          <tr>
            <td><i class="fas fa-user"></i> ${donor.name || 'N/A'}</td>
            <td><span class="blood-type ${(donor.blood || 'unknown').toLowerCase().replace('+', '-positive').replace('-', '-negative')}">${donor.blood || 'N/A'}</span></td>
            <td><i class="fas fa-map-marker-alt"></i> ${donor.location || 'N/A'}</td>
            <td><i class="fas fa-phone"></i> ${donor.phone || 'N/A'}</td>
          </tr>
        `).join('');
      }
      
      // Update recipient table
      const recipientTbody = recipientTable.querySelector('tbody');
      if (recipientTbody) {
        recipientTbody.innerHTML = recipients.map(recipient => `
          <tr>
            <td><i class="fas fa-user"></i> ${recipient.name || 'N/A'}</td>
            <td><span class="blood-type ${(recipient.blood || 'unknown').toLowerCase().replace('+', '-positive').replace('-', '-negative')}">${recipient.blood || 'N/A'}</span></td>
            <td><i class="fas fa-map-marker-alt"></i> ${recipient.location || 'N/A'}</td>
            <td><i class="fas fa-phone"></i> ${recipient.phone || 'N/A'}</td>
          </tr>
        `).join('');
      }
      
      console.log('Manual table update completed');
    } else {
      console.log('Tables not found!');
    }
  }, 1000);
}

// Comprehensive test function for emergency system
function testEmergencySystem() {
  console.log('=== TESTING EMERGENCY SYSTEM ===');
  
  // Test 1: Check authentication
  console.log('1. Testing Authentication...');
  const isAuth = checkUserAuthentication();
  const user = getCurrentUser();
  console.log('   Authentication:', isAuth);
  console.log('   Current User:', user);
  
  // Test 2: Check if user is recipient
  console.log('2. Testing User Role...');
  const isRecipient = user && (user.role === 'recipient' || user.role === 'Recipient');
  console.log('   Is Recipient:', isRecipient);
  
  // Test 3: Test emergency request function
  console.log('3. Testing Emergency Request...');
  if (isRecipient) {
    console.log('   ✅ User can send emergency requests');
    
    // Test form elements
    const messageEl = document.getElementById('emergencyMessage');
    const unitsEl = document.getElementById('requiredUnits');
    const deadlineEl = document.getElementById('deadline');
    
    console.log('   Form Elements:');
    console.log('     Message:', messageEl ? 'Found' : 'Missing');
    console.log('     Units:', unitsEl ? 'Found' : 'Missing');
    console.log('     Deadline:', deadlineEl ? 'Found' : 'Missing');
    
    // Test urgency levels
    const urgencyButtons = document.querySelectorAll('.urgency-btn');
    console.log('   Urgency Buttons:', urgencyButtons.length);
    
  } else {
    console.log('   ❌ User cannot send emergency requests');
    console.log('   Suggestion: Use forceRecipientLogin() to test');
  }
  
  // Test 4: Check localStorage
  console.log('4. Testing LocalStorage...');
  const keys = Object.keys(localStorage);
  console.log('   Available Keys:', keys);
  
  // Test 5: Check emergency requests data
  console.log('5. Testing Emergency Data...');
  const emergencyRequests = getData('emergencyRequests') || [];
  console.log('   Emergency Requests:', emergencyRequests.length);
  
  // Test 6: Check notifications
  console.log('6. Testing Notifications...');
  const notifications = getData('notifications') || [];
  console.log('   Notifications:', notifications.length);
  
  console.log('=== TEST COMPLETE ===');
  
  // Show summary notification
  const summary = `Test Complete: Auth=${isAuth}, Role=${user?.role || 'None'}, CanSend=${isRecipient}`;
  showNotification(summary, isRecipient ? 'success' : 'warning');
  
  return {
    authenticated: isAuth,
    user: user,
    isRecipient: isRecipient,
    canSendEmergency: isRecipient
  };
}

// Quick fix function for common issues
function quickFixEmergencySystem() {
  console.log('=== QUICK FIX: Emergency System ===');
  
  // Clear any corrupted data
  try {
    localStorage.removeItem('currentUser');
    console.log('Cleared corrupted user data');
  } catch (e) {
    console.log('No user data to clear');
  }
  
  // Create a test recipient
  const testRecipient = {
    name: 'Test Recipient',
    email: 'test@recipient.com',
    role: 'recipient',
    blood: 'O+',
    location: 'Dhaka',
    phone: '1234567890',
    loginTime: new Date().toISOString(),
    lastActive: new Date().toISOString()
  };
  
  localStorage.setItem('currentUser', JSON.stringify(testRecipient));
  console.log('Created test recipient user');
  
  // Reload the page
  console.log('Reloading page...');
  setTimeout(() => {
    window.location.reload();
  }, 1000);
  
  return 'Quick fix applied. Page will reload in 1 second.';
}

// Page initialization
document.addEventListener('DOMContentLoaded', function() {
  // Add notification styles
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        padding: 15px 20px;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 10000;
        border-left: 4px solid #4CAF50;
      }
      
      .notification.error {
        border-left-color: #f44336;
      }
      
      .notification.success .notification-content i {
        color: #4CAF50;
      }
      
      .notification.error .notification-content i {
        color: #f44336;
      }
      
      /* Enhanced notification styles */
      .notification.enhanced {
        min-width: 350px;
        max-width: 450px;
      }
      
      .notification.enhanced .notification-content {
        display: flex;
        align-items: flex-start;
        gap: 15px;
      }
      
      .notification.enhanced .notification-text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      
      .notification.enhanced .notification-message {
        font-weight: 600;
        font-size: 1.1em;
      }
      
      .notification.enhanced .notification-subtitle {
        font-size: 0.9em;
        color: #666;
        font-style: italic;
      }
      
      .notification.enhanced .notification-close {
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        padding: 5px;
        border-radius: 50%;
        transition: all 0.3s ease;
      }
      
      .notification.enhanced .notification-close:hover {
        background: rgba(0, 0, 0, 0.1);
        color: #333;
      }
      
      /* Urgency-based notification styling */
      .notification.urgency-critical {
        border-left-color: #ff6b6b;
        background: linear-gradient(135deg, #fff5f5, #fff);
      }
      
      .notification.urgency-high {
        border-left-color: #ffa726;
        background: linear-gradient(135deg, #fff8e1, #fff);
      }
      
      .notification.urgency-medium {
        border-left-color: #ffd54f;
        background: linear-gradient(135deg, #fffde7, #fff);
      }
      
      .notification.urgency-low {
        border-left-color: #81c784;
        background: linear-gradient(135deg, #f1f8e9, #fff);
      }
      
      .notification.show {
        transform: translateX(0);
      }
      
      /* Emergency-specific notification styles */
      .notification.emergency {
        border-left-color: #ff6b6b;
        background: linear-gradient(135deg, #fff5f5, #fff);
        animation: emergencyPulse 2s infinite;
      }
      
      .notification.escalated {
        border-left-color: #dc3545;
        background: linear-gradient(135deg, #fff5f5, #fff);
        animation: emergencyPulse 1s infinite;
      }
      
      @keyframes emergencyPulse {
        0%, 100% { transform: translateX(0) scale(1); }
        50% { transform: translateX(0) scale(1.02); }
      }
      
      /* Enhanced notification content */
      .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .notification-content i {
        font-size: 1.2em;
      }
      
      .request-card, .donor-card {
        background: #fff;
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 15px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        border: 1px solid #e9ecef;
      }
      
      .request-header, .donor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .request-actions, .donor-actions {
        display: flex;
        gap: 10px;
        margin-top: 15px;
      }
      
      .btn-accept, .btn-decline, .btn-request {
        padding: 8px 16px;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .btn-accept {
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: #fff;
      }
      
      .btn-decline {
        background: linear-gradient(135deg, #f44336, #da190b);
        color: #fff;
      }
      
      .btn-request {
        background: linear-gradient(135deg, #ff6b6b, #ee5a24);
        color: #fff;
      }
      
      .btn-accept:hover, .btn-decline:hover, .btn-request:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      }
      
      .blood-type {
        padding: 4px 8px;
        border-radius: 15px;
        font-weight: 600;
        font-size: 0.9em;
      }
      
      .status-available {
        color: #4CAF50;
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize appropriate dashboard based on current page
  const currentPage = window.location.pathname.split('/').pop();
  
  // Check authentication first
  const isAuthenticated = checkUserAuthentication();
  const currentUser = getCurrentUser();
  
  switch (currentPage) {
    case 'donor-dashboard.html':
      if (!isAuthenticated || currentUser?.role !== 'donor') {
        showNotification("Please login as a donor to access this dashboard.", "error");
        setTimeout(() => window.location.href = 'login.html', 2000);
        break;
      }
      loadDonorDashboard();
      initializeChat();
      loadEmergencyAlerts(); // Load emergency alerts
      loadNotificationCenter(); // Load notification center
      break;
      
    case 'recipient-dashboard.html':
      if (!isAuthenticated || currentUser?.role !== 'recipient') {
        showNotification("Please login as a recipient to access this dashboard.", "error");
        setTimeout(() => window.location.href = 'login.html', 2000);
        break;
      }
      loadRecipientDashboard();
      initializeChat();
      initializeUrgencyLevels(); // Initialize urgency level selection
      break;
      
    case 'admin-dashboard.html':
      if (!isAuthenticated || currentUser?.role !== 'admin') {
        showNotification("Please login as an admin to access this dashboard.", "error");
        setTimeout(() => window.location.href = 'login.html', 2000);
        break;
      }
      loadAdminDashboard();
      break;
  }
});

// Check and fix user authentication
function checkUserAuthentication() {
  try {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      return false;
    }
    
    const user = JSON.parse(userData);
    
    // Check if user has required fields
    if (!user.role || !user.email) {
      localStorage.removeItem('currentUser');
      return false;
    }
    
    // Update last active time
    user.lastActive = new Date().toISOString();
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return true;
  } catch (error) {
    console.error('Authentication check error:', error);
    localStorage.removeItem('currentUser');
    return false;
  }
}

// Get current authenticated user
function getCurrentUser() {
  try {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      return JSON.parse(userData);
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  return null;
}

// Force login as recipient for testing
function forceRecipientLogin() {
  const testRecipient = {
    name: 'Test Recipient',
    email: 'test@recipient.com',
    role: 'recipient',
    blood: 'O+',
    location: 'Dhaka',
    phone: '1234567890',
    loginTime: new Date().toISOString(),
    lastActive: new Date().toISOString()
  };
  
  localStorage.setItem('currentUser', JSON.stringify(testRecipient));
  showNotification('Test recipient login successful!', 'success');
  
  // Reload the page to apply changes
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

// Check authentication status and update debug panel
function checkAuthStatus() {
  const user = getCurrentUser();
  const isAuth = checkUserAuthentication();
  
  console.log('=== AUTHENTICATION DEBUG ===');
  console.log('Current User:', user);
  console.log('Is Authenticated:', isAuth);
  console.log('LocalStorage Keys:', Object.keys(localStorage));
  
  // Update debug panel
  updateDebugPanel();
  
  showNotification(`Auth Status: ${isAuth ? 'Authenticated' : 'Not Authenticated'}`, isAuth ? 'success' : 'error');
}

// Update debug panel with current status
function updateDebugPanel() {
  const user = getCurrentUser();
  const isAuth = checkUserAuthentication();
  
  const debugUser = document.getElementById('debugUser');
  const debugRole = document.getElementById('debugRole');
  const debugAuth = document.getElementById('debugAuth');
  
  if (debugUser && debugRole && debugAuth) {
    debugUser.textContent = user ? user.name || user.email : 'None';
    debugRole.textContent = user ? user.role : 'None';
    debugAuth.textContent = isAuth ? '✅ Authenticated' : '❌ Not Authenticated';
    
    // Color coding
    debugAuth.style.color = isAuth ? '#28a745' : '#dc3545';
    debugRole.style.color = user && user.role === 'recipient' ? '#28a745' : '#dc3545';
  }
}

// Chat functionality
let currentChatUser = null;
let chatMessages = {};

function loadChatUsers(currentUser) {
  const recipientList = document.getElementById('recipientList');
  if (!recipientList) return;
  
  const recipients = getData('recipients');
  const donors = getData('donors');
  
  // For donors, show recipients; for recipients, show donors
  const usersToShow = currentUser.role === 'donor' ? recipients : donors;
  
  recipientList.innerHTML = '';
  
  if (usersToShow.length === 0) {
    recipientList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No users available for chat</p>';
    return;
  }
  
  usersToShow.forEach(user => {
    const userItem = document.createElement('div');
    userItem.className = 'user-item';
    userItem.onclick = () => selectChatUser(user);
    
    userItem.innerHTML = `
      <h5>${user.name}</h5>
      <p>${user.blood || 'N/A'} • ${user.location}</p>
    `;
    
    recipientList.appendChild(userItem);
  });
}

function selectChatUser(user) {
  currentChatUser = user;
  
  // Update UI
  document.querySelectorAll('.user-item').forEach(item => item.classList.remove('active'));
  event.target.closest('.user-item').classList.add('active');
  
  // Update chat header
  const chatHeader = document.getElementById('chatHeader');
  chatHeader.innerHTML = `<span>Chat with ${user.name}</span>`;
  
  // Enable input
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');
  messageInput.disabled = false;
  sendButton.disabled = false;
  
  // Load messages
  loadChatMessages(user);
}

function loadChatMessages(user) {
  const messageArea = document.getElementById('messageArea');
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  // Get or create chat ID
  const chatId = getChatId(currentUser, user);
  
  // Get messages for this chat
  const messages = getData('chatMessages') || {};
  const chatMessages = messages[chatId] || [];
  
  messageArea.innerHTML = '';
  
  if (chatMessages.length === 0) {
    messageArea.innerHTML = `
      <div class="no-chat-selected">
        <i class="fas fa-comments"></i>
        <p>Start a conversation with ${user.name}</p>
      </div>
    `;
    return;
  }
  
  chatMessages.forEach(message => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.sender === currentUser.email ? 'sent' : 'received'}`;
    
    messageDiv.innerHTML = `
      <div class="message-content">${message.text}</div>
      <div class="message-time">${formatTime(message.timestamp)}</div>
    `;
    
    messageArea.appendChild(messageDiv);
  });
  
  // Scroll to bottom
  messageArea.scrollTop = messageArea.scrollHeight;
}

function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const text = messageInput.value.trim();
  
  if (!text || !currentChatUser) return;
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const chatId = getChatId(currentUser, currentChatUser);
  
  const message = {
    text: text,
    sender: currentUser.email,
    timestamp: new Date().toISOString()
  };
  
  // Save message
  const messages = getData('chatMessages') || {};
  if (!messages[chatId]) messages[chatId] = [];
  messages[chatId].push(message);
  saveData('chatMessages', messages);
  
  // Clear input
  messageInput.value = '';
  
  // Reload messages
  loadChatMessages(currentChatUser);
}

function getChatId(user1, user2) {
  // Create a consistent chat ID regardless of who initiates
  const emails = [user1.email, user2.email].sort();
  return `${emails[0]}-${emails[1]}`;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Initialize chat when dashboard loads
function initializeChat() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser) {
    loadChatUsers(currentUser);
  }
}

// Emergency System Functions
let currentUrgencyLevel = 'critical';

// Initialize urgency level selection
function initializeUrgencyLevels() {
  const urgencyButtons = document.querySelectorAll('.urgency-btn');
  urgencyButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      urgencyButtons.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      // Update current urgency level
      currentUrgencyLevel = this.dataset.level;
    });
  });
}

// Send emergency blood request
function sendEmergencyRequest() {
  const message = document.getElementById('emergencyMessage').value.trim();
  const requiredUnits = document.getElementById('requiredUnits').value;
  const deadline = document.getElementById('deadline').value;
  
  if (!message || !deadline) {
    showNotification("Please fill in all emergency details.", "error");
    return;
  }
  
  // Get current user with better error handling
  let user = null;
  try {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      user = JSON.parse(userData);
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }
  
  // Check if user exists and has recipient role
  if (!user) {
    showNotification("Please login first to send emergency requests.", "error");
    // Redirect to login page
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
    return;
  }
  
  // Check if user has recipient role (more flexible checking)
  const isRecipient = user.role === 'recipient' || 
                     user.role === 'Recipient' || 
                     user.email.includes('recipient') ||
                     window.location.pathname.includes('recipient');
  
  if (!isRecipient) {
    showNotification("Please login as a recipient to send emergency requests.", "error");
    // Redirect to recipient registration
    setTimeout(() => {
      window.location.href = 'recipient-registration.html';
    }, 2000);
    return;
  }
  
  // Get recipient data
  const recipients = getData('recipients');
  let recipient = recipients.find(r => r.email === user.email);
  
  // If recipient not found in data, create basic recipient info from user
  if (!recipient) {
    recipient = {
      name: user.name || 'Unknown Recipient',
      email: user.email,
      blood: user.blood || 'O+', // Default blood type
      location: user.location || 'Unknown Location'
    };
  }
  
  // Create emergency request
  const emergencyRequest = {
    id: Date.now().toString(),
    type: 'emergency',
    urgencyLevel: currentUrgencyLevel,
    from: recipient.name,
    fromEmail: recipient.email,
    bloodType: recipient.blood,
    location: recipient.location,
    message: message,
    requiredUnits: parseInt(requiredUnits),
    deadline: deadline,
    createdAt: new Date().toISOString(),
    status: 'active',
    responses: [],
    escalated: false
  };
  
  // Save emergency request
  const emergencyRequests = getData('emergencyRequests') || [];
  emergencyRequests.push(emergencyRequest);
  saveData('emergencyRequests', emergencyRequests);
  
  // Send SOS alerts to all compatible donors
  sendSOSAlerts(emergencyRequest);
  
  // Clear form
  document.getElementById('emergencyMessage').value = '';
  document.getElementById('requiredUnits').value = '1';
  document.getElementById('deadline').value = '';
  
  showNotification("Emergency SOS alert sent! All compatible donors have been notified.", "success");
  
  // Auto-escalation timer
  startAutoEscalation(emergencyRequest.id);
}

// Send SOS alerts to all compatible donors
function sendSOSAlerts(emergencyRequest) {
  const donors = getData('donors');
  const compatibleDonors = donors.filter(donor => 
    donor.available && 
    isBloodCompatible(emergencyRequest.bloodType, donor.blood) &&
    isLocationNearby(emergencyRequest.location, donor.location)
  );
  
  // Create notifications for each compatible donor
  const notifications = getData('notifications') || [];
  
  compatibleDonors.forEach(donor => {
    const notification = {
      id: Date.now().toString() + Math.random(),
      type: 'emergency_alert',
      recipientId: donor.email,
      title: `🚨 URGENT: ${emergencyRequest.urgencyLevel.toUpperCase()} Blood Request`,
      message: `${emergencyRequest.from} needs ${emergencyRequest.requiredUnits} unit(s) of ${emergencyRequest.bloodType} blood`,
      urgencyLevel: emergencyRequest.urgencyLevel,
      emergencyRequestId: emergencyRequest.id,
      createdAt: new Date().toISOString(),
      read: false,
      actionRequired: true
    };
    
    notifications.push(notification);
  });
  
  saveData('notifications', notifications);
  
  // Show notification count
  showNotification(`SOS alert sent to ${compatibleDonors.length} compatible donors!`, "success");
}

// Check if locations are nearby (simple implementation)
function isLocationNearby(location1, location2) {
  // For now, consider locations nearby if they contain similar keywords
  // In a real implementation, you'd use geolocation APIs
  const loc1 = location1.toLowerCase();
  const loc2 = location2.toLowerCase();
  
  // Check if locations are in the same city/area
  const commonCities = ['dhaka', 'chittagong', 'sylhet', 'rajshahi', 'khulna', 'barisal', 'rangpur', 'mymensingh'];
  
  for (let city of commonCities) {
    if (loc1.includes(city) && loc2.includes(city)) {
      return true;
    }
  }
  
  // If exact match or similar
  return loc1 === loc2 || loc1.includes(loc2) || loc2.includes(loc1);
}

// Start auto-escalation timer
function startAutoEscalation(requestId) {
  const escalationTime = 30 * 60 * 1000; // 30 minutes
  
  setTimeout(() => {
    escalateEmergencyRequest(requestId);
  }, escalationTime);
}

// Escalate emergency request
function escalateEmergencyRequest(requestId) {
  const emergencyRequests = getData('emergencyRequests') || [];
  const requestIndex = emergencyRequests.findIndex(r => r.id === requestId);
  
  if (requestIndex !== -1 && emergencyRequests[requestIndex].status === 'active') {
    emergencyRequests[requestIndex].escalated = true;
    emergencyRequests[requestIndex].escalatedAt = new Date().toISOString();
    
    // Send escalated alerts to all donors in the region
    const escalatedRequest = emergencyRequests[requestIndex];
    sendEscalatedAlerts(escalatedRequest);
    
    saveData('emergencyRequests', emergencyRequests);
    
    // Notify recipient
    showNotification("Your emergency request has been escalated due to no response.", "warning");
  }
}

// Send escalated alerts
function sendEscalatedAlerts(emergencyRequest) {
  const donors = getData('donors');
  const allDonorsInRegion = donors.filter(donor => 
    donor.available && 
    isLocationNearby(emergencyRequest.location, donor.location)
  );
  
  // Create escalated notifications
  const notifications = getData('notifications') || [];
  
  allDonorsInRegion.forEach(donor => {
    const notification = {
      id: Date.now().toString() + Math.random(),
      type: 'escalated_alert',
      recipientId: donor.email,
      title: `🚨🚨 ESCALATED: ${emergencyRequest.urgencyLevel.toUpperCase()} Blood Request`,
      message: `URGENT: ${emergencyRequest.from} still needs ${emergencyRequest.requiredUnits} unit(s) of ${emergencyRequest.bloodType} blood. This is an escalated request!`,
      urgencyLevel: emergencyRequest.urgencyLevel,
      emergencyRequestId: emergencyRequest.id,
      createdAt: new Date().toISOString(),
      read: false,
      actionRequired: true,
      escalated: true
    };
    
    notifications.push(notification);
  });
  
  saveData('notifications', notifications);
}

// Load emergency alerts for donors
function loadEmergencyAlerts() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user || user.role !== 'donor') return;
  
  const emergencyRequests = getData('emergencyRequests') || [];
  const activeEmergencies = emergencyRequests.filter(req => 
    req.status === 'active' && 
    isBloodCompatible(req.bloodType, user.blood) &&
    isLocationNearby(req.location, user.location)
  );
  
  const emergencyAlertsContainer = document.getElementById('emergencyAlerts');
  if (!emergencyAlertsContainer) return;
  
  if (activeEmergencies.length === 0) {
    emergencyAlertsContainer.innerHTML = `
      <div class="no-emergencies">
        <i class="fas fa-shield-alt"></i>
        <p>No emergency alerts at the moment</p>
        <span>You'll be notified immediately for urgent blood requests</span>
      </div>
    `;
  } else {
    emergencyAlertsContainer.innerHTML = activeEmergencies.map(emergency => {
      const timeAgo = getTimeAgo(emergency.createdAt);
      const deadline = new Date(emergency.deadline);
      const isOverdue = deadline < new Date();
      
      return `
        <div class="emergency-alert ${emergency.urgencyLevel} ${isOverdue ? 'overdue' : ''}">
          <div class="emergency-alert-header">
            <div class="emergency-alert-title">
              <h4><i class="fas fa-exclamation-triangle"></i> ${emergency.from}</h4>
              <span class="urgency-badge ${emergency.urgencyLevel}">${emergency.urgencyLevel}</span>
            </div>
            <div class="emergency-alert-time">
              <i class="fas fa-clock"></i> ${timeAgo}
              ${isOverdue ? '<br><span style="color: #ff6b6b; font-weight: 600;">OVERDUE!</span>' : ''}
            </div>
          </div>
          <div class="emergency-alert-body">
            <p><i class="fas fa-tint"></i> <strong>Blood Type:</strong> ${emergency.bloodType}</p>
            <p><i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> ${emergency.location}</p>
            <p><i class="fas fa-flask"></i> <strong>Units Needed:</strong> ${emergency.requiredUnits}</p>
            <p><i class="fas fa-calendar"></i> <strong>Deadline:</strong> ${deadline.toLocaleString()}</p>
            <div class="emergency-message">
              <i class="fas fa-comment"></i> <strong>Emergency Message:</strong><br>
              ${emergency.message}
            </div>
          </div>
          <div class="emergency-alert-actions">
            <button onclick="respondToEmergency('${emergency.id}', 'accept')" class="emergency-btn-respond respond">
              <i class="fas fa-heart"></i> I Can Help
            </button>
            <button onclick="contactEmergencyRecipient('${emergency.fromEmail}', '${emergency.from}')" class="emergency-btn-respond contact">
              <i class="fas fa-phone"></i> Contact
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Load notifications in notification center
function loadNotificationCenter() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user || user.role !== 'donor') return;
  
  const notifications = getData('notifications') || [];
  const userNotifications = notifications.filter(n => n.recipientId === user.email);
  
  const notificationCenter = document.getElementById('notificationCenter');
  if (!notificationCenter) return;
  
  if (userNotifications.length === 0) {
    notificationCenter.innerHTML = `
      <div class="no-notifications">
        <i class="fas fa-bell-slash"></i>
        <p>No notifications at the moment</p>
        <span>You'll see important updates and emergency alerts here</span>
      </div>
    `;
  } else {
    // Sort notifications by priority and time
    const sortedNotifications = userNotifications.sort((a, b) => {
      // Priority order: emergency > escalated > regular
      const priorityOrder = { emergency_alert: 3, escalated_alert: 2, emergency_response: 1, regular: 0 };
      const aPriority = priorityOrder[a.type] || 0;
      const bPriority = priorityOrder[b.type] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Then by time (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    notificationCenter.innerHTML = sortedNotifications.map(notification => {
      const timeAgo = getTimeAgo(notification.createdAt);
      const isEmergency = notification.type === 'emergency_alert' || notification.type === 'escalated_alert';
      const isEscalated = notification.type === 'escalated_alert';
      const isUnread = !notification.read;
      
      let notificationClass = 'notification-item';
      if (isUnread) notificationClass += ' unread';
      if (isEmergency) notificationClass += ' emergency';
      if (isEscalated) notificationClass += ' escalated';
      
      let priorityBadge = '';
      if (notification.urgencyLevel) {
        priorityBadge = `<span class="notification-priority ${notification.urgencyLevel}">${notification.urgencyLevel}</span>`;
      }
      
      let actions = '';
      if (isEmergency && notification.actionRequired) {
        actions = `
          <div class="notification-actions">
            <button onclick="viewEmergencyDetails('${notification.emergencyRequestId}')" class="notification-btn primary">
              <i class="fas fa-eye"></i> View Details
            </button>
            <button onclick="markNotificationRead('${notification.id}')" class="notification-btn secondary">
              <i class="fas fa-check"></i> Mark Read
            </button>
          </div>
        `;
      } else {
        actions = `
          <div class="notification-actions">
            <button onclick="markNotificationRead('${notification.id}')" class="notification-btn primary">
              <i class="fas fa-check"></i> Mark Read
            </button>
          </div>
        `;
      }
      
      return `
        <div class="${notificationClass}" onclick="handleNotificationClick('${notification.id}')">
          ${priorityBadge}
          <div class="notification-header">
            <div class="notification-title">${notification.title}</div>
            <div class="notification-time">${timeAgo}</div>
          </div>
          <div class="notification-message">${notification.message}</div>
          ${actions}
        </div>
      `;
    }).join('');
  }
}

// Handle notification click
function handleNotificationClick(notificationId) {
  const notifications = getData('notifications') || [];
  const notification = notifications.find(n => n.id === notificationId);
  
  if (notification) {
    // Mark as read
    markNotificationRead(notificationId);
    
    // Handle different notification types
    if (notification.type === 'emergency_alert' || notification.type === 'escalated_alert') {
      // Scroll to emergency alerts section
      const emergencySection = document.querySelector('.emergency-alerts-section');
      if (emergencySection) {
        emergencySection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}

// Mark notification as read
function markNotificationRead(notificationId) {
  const notifications = getData('notifications') || [];
  const notificationIndex = notifications.findIndex(n => n.id === notificationId);
  
  if (notificationIndex !== -1) {
    notifications[notificationIndex].read = true;
    saveData('notifications', notifications);
    
    // Reload notification center
    loadNotificationCenter();
  }
}

// View emergency details
function viewEmergencyDetails(emergencyId) {
  const emergencyRequests = getData('emergencyRequests') || [];
  const emergency = emergencyRequests.find(r => r.id === emergencyId);
  
  if (emergency) {
    // Scroll to emergency alerts section and highlight the specific emergency
    const emergencySection = document.querySelector('.emergency-alerts-section');
    if (emergencySection) {
      emergencySection.scrollIntoView({ behavior: 'smooth' });
      
      // Highlight the specific emergency (you can add CSS for this)
      setTimeout(() => {
        const emergencyElement = document.querySelector(`[data-emergency-id="${emergencyId}"]`);
        if (emergencyElement) {
          emergencyElement.style.border = '3px solid #ff6b6b';
          emergencyElement.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.3)';
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            emergencyElement.style.border = '';
            emergencyElement.style.boxShadow = '';
          }, 3000);
        }
      }, 500);
    }
  }
}

// Respond to emergency request
function respondToEmergency(emergencyId, response) {
  const emergencyRequests = getData('emergencyRequests') || [];
  const requestIndex = emergencyRequests.findIndex(r => r.id === emergencyId);
  
  if (requestIndex !== -1) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const donors = getData('donors');
    const donor = donors.find(d => d.email === user.email);
    
    // Add response to emergency request
    emergencyRequests[requestIndex].responses.push({
      donorId: user.email,
      donorName: donor.name,
      response: response,
      respondedAt: new Date().toISOString()
    });
    
    // If accepted, mark as responded
    if (response === 'accept') {
      emergencyRequests[requestIndex].status = 'responded';
      emergencyRequests[requestIndex].respondedAt = new Date().toISOString();
      
      // Notify recipient
      const notifications = getData('notifications') || [];
      const notification = {
        id: Date.now().toString() + Math.random(),
        type: 'emergency_response',
        recipientId: emergencyRequests[requestIndex].fromEmail,
        title: '✅ Emergency Request Responded!',
        message: `${donor.name} has responded to your emergency blood request`,
        createdAt: new Date().toISOString(),
        read: false,
        actionRequired: true
      };
      notifications.push(notification);
      saveData('notifications', notifications);
    }
    
    saveData('emergencyRequests', emergencyRequests);
    
    const message = response === 'accept' ? 
      'Thank you for responding! The recipient will contact you soon.' : 
      'Response recorded.';
    showNotification(message, 'success');
    
    // Reload emergency alerts
    loadEmergencyAlerts();
  }
}

// Contact emergency recipient
function contactEmergencyRecipient(email, name) {
  const recipients = getData('recipients');
  const recipient = recipients.find(r => r.email === email);
  
  if (recipient && recipient.phone) {
    if (confirm(`Do you want to call ${name} at ${recipient.phone}?`)) {
      window.open(`tel:${recipient.phone}`, '_self');
    }
  } else {
    showNotification('Phone number not available for this recipient', 'error');
  }
}

// Get time ago string
function getTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// Enhanced notification system
function showEnhancedNotification(message, type = 'success', options = {}) {
  const notification = document.createElement('div');
  notification.className = `notification ${type} enhanced`;
  
  let icon = 'check-circle';
  if (type === 'error') icon = 'exclamation-circle';
  if (type === 'warning') icon = 'exclamation-triangle';
  if (type === 'info') icon = 'info-circle';
  
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${icon}"></i>
      <div class="notification-text">
        <span class="notification-message">${message}</span>
        ${options.subtitle ? `<span class="notification-subtitle">${options.subtitle}</span>` : ''}
      </div>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  // Add urgency styling for emergency notifications
  if (options.urgencyLevel) {
    notification.classList.add(`urgency-${options.urgencyLevel}`);
  }
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Auto-remove after specified time or default
  const duration = options.duration || 5000;
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, duration);
}
