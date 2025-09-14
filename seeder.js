const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Lead = require('./models/Lead');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await User.deleteMany({});
    await Lead.deleteMany({});

    const testUser = await User.create({
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      password: 'password123'
    });

    console.log('Test user created:', testUser.email);

    const sampleLeads = [];
    const statuses = ['new', 'contacted', 'qualified', 'lost', 'won'];
    const sources = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];
    const companies = ['Acme Inc', 'Globex Corp', 'Wayne Enterprises', 'Stark Industries', 'Oscorp'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];

    for (let i = 0; i < 150; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const company = companies[Math.floor(Math.random() * companies.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      
      sampleLeads.push({
        user: testUser._id,
        first_name: `First${i}`,
        last_name: `Last${i}`,
        email: `lead${i}@example.com`,
        phone: `555-${100 + i}-${1000 + i}`,
        company,
        city,
        state: 'CA',
        source,
        status,
        score: Math.floor(Math.random() * 101),
        lead_value: Math.floor(Math.random() * 10000),
        last_activity_at: i % 3 === 0 ? new Date() : null,
        is_qualified: status === 'qualified' || status === 'won'
      });
    }

    await Lead.insertMany(sampleLeads);
    console.log(`Created ${sampleLeads.length} sample leads`);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();