const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { subDays, subMonths, subYears, addDays } = require('date-fns');

dotenv.config();

const User = require('../models/User');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Interaction = require('../models/Interaction');
const FollowUp = require('../models/FollowUp');
const Opportunity = require('../models/Opportunity');
const RelationshipSignal = require('../models/RelationshipSignal');
const Recommendation = require('../models/Recommendation');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const KYCRecord = require('../models/KYCRecord');
const {
  calculateRelationshipHealth,
  detectSignals,
  calculatePriority,
} = require('../services/intelligenceEngine');

const productsCatalog = [
  {
    productId: 'PROD-001',
    name: 'Premier Advantage Savings',
    category: 'Savings & Deposits',
    description: 'High-yield premium savings relationship with personal relationship manager, zero maintenance fees, and worldwide lounge access.',
    customerNeed: 'Primary day-to-day banking & liquidity',
    eligibilityCriteria: 'Minimum Average Quarterly Balance of ₹1,00,000',
    interestRateOrBenefit: '4.50% - 6.75% p.a. tiered interest',
    minIncome: '5 LPA',
    status: 'Active',
  },
  {
    productId: 'PROD-002',
    name: 'SmartDrive Auto Financing',
    category: 'Vehicle Financing',
    description: 'Flexible auto loan with zero foreclosure charges after 12 months, 100% on-road funding, and instant digital approval.',
    customerNeed: 'Vehicle purchase & upgrades',
    eligibilityCriteria: 'Salaried/Self-employed with credit score > 720',
    interestRateOrBenefit: '8.40% p.a. fixed/floating options',
    minIncome: '6 LPA',
    status: 'Active',
  },
  {
    productId: 'PROD-003',
    name: 'Apex Home Nest Financing',
    category: 'Home Financing',
    description: 'Comprehensive residential property loan with customizable repayment tenure up to 30 years and top-up facility.',
    customerNeed: 'Property purchase & home construction',
    eligibilityCriteria: 'Resident Indian aged 21-65 years',
    interestRateOrBenefit: '8.15% p.a. linked to benchmark repo rate',
    minIncome: '10 LPA',
    status: 'Active',
  },
  {
    productId: 'PROD-004',
    name: 'Insignia Elite Credit Suite',
    category: 'Credit Cards',
    description: 'Super-premium metal credit card offering 5X reward points on dining and luxury travel, with comprehensive travel insurance.',
    customerNeed: 'Lifestyle spending & premium rewards',
    eligibilityCriteria: 'Annual income > ₹18 Lakhs',
    interestRateOrBenefit: 'Unlimited domestic & international lounge access',
    minIncome: '18 LPA',
    status: 'Active',
  },
  {
    productId: 'PROD-005',
    name: 'Dynamic Horizon Wealth Portfolio',
    category: 'Wealth & Investments',
    description: 'Curated multi-asset investment portfolio spanning equity mutual funds, debt allocation, and sovereign gold bonds.',
    customerNeed: 'Long-term wealth creation & tax optimization',
    eligibilityCriteria: 'Minimum initial investment ₹2,50,000',
    interestRateOrBenefit: 'Target Alpha 12-15% CAGR (Simulated projection)',
    minIncome: '15 LPA',
    status: 'Active',
  },
  {
    productId: 'PROD-006',
    name: 'SecureFuture Family Term Shield',
    category: 'Insurance & Protection',
    description: 'Pure risk life cover with return of premium option, critical illness riders, and instant claim disbursement.',
    customerNeed: 'Family protection & income replacement',
    eligibilityCriteria: 'Age 18 - 60 years',
    interestRateOrBenefit: '₹2.5 Crore cover starting @ ₹1,450/month',
    minIncome: '6 LPA',
    status: 'Active',
  },
  {
    productId: 'PROD-007',
    name: 'GrowthEnterprise SME Current Account',
    category: 'SME Business Loan',
    description: 'Comprehensive business current account with high free monthly cash deposit limits, POS integration, and automated tax filing.',
    customerNeed: 'Business cashflow & merchant management',
    eligibilityCriteria: 'Registered business entity with GST registration',
    interestRateOrBenefit: 'Free cash deposit up to ₹50 Lakhs/month',
    minIncome: '25 LPA',
    status: 'Active',
  },
  {
    productId: 'PROD-008',
    name: 'CapitalBuilder Term Deposit',
    category: 'Savings & Deposits',
    description: 'Guaranteed return fixed deposit with flexible interest payout frequencies and loan against deposit up to 90%.',
    customerNeed: 'Guaranteed capital preservation',
    eligibilityCriteria: 'All customer segments',
    interestRateOrBenefit: '7.60% p.a. for standard (8.10% for seniors)',
    minIncome: 'Any',
    status: 'Active',
  },
  {
    productId: 'PROD-009',
    name: 'Aspirations Education Financing',
    category: 'Vehicle Financing',
    description: 'Collateral-free higher education financing for premier Indian and global universities with moratorium during study period.',
    customerNeed: 'Higher education funding',
    eligibilityCriteria: 'Confirmed admission to approved institutions',
    interestRateOrBenefit: '9.25% p.a. with 100% tax benefit under 80E',
    minIncome: 'Co-applicant > 5 LPA',
    status: 'Active',
  },
  {
    productId: 'PROD-010',
    name: 'Executive Privilege Salary Package',
    category: 'Savings & Deposits',
    description: 'Zero balance corporate salary account with preferential loan pricing, free demand drafts, and unlimited ATM transactions.',
    customerNeed: 'Corporate payroll & banking convenience',
    eligibilityCriteria: 'Corporate employee in partnered firm',
    interestRateOrBenefit: '0.25% concession on retail loans',
    minIncome: '6 LPA',
    status: 'Active',
  },
];

const indianCities = [
  'Jaipur',
  'Delhi',
  'Mumbai',
  'Pune',
  'Bengaluru',
  'Hyderabad',
  'Ahmedabad',
  'Chennai',
  'Kolkata',
  'Chandigarh',
];

const customerSeedProfiles = [
  // Scenario A: Rahul Mehta (Dormant with Vehicle Need & Overdue Follow-up - Classic High Priority Demo Customer)
  {
    firstName: 'Rahul',
    lastName: 'Mehta',
    email: 'rahul.mehta@example.com',
    phone: '+91 98290 11234',
    city: 'Jaipur',
    occupation: 'Senior Software Architect',
    companyName: 'Infosys BPM',
    age: 34,
    incomeRange: '25-50 LPA',
    segment: 'Young Professional',
    relationshipStatus: 'Needs Attention',
    engagementScore: 45,
    relationshipHealthScore: 58,
    daysSinceLastInteraction: 74,
    existingProducts: [
      {
        productName: 'Premier Advantage Savings',
        category: 'Savings & Deposits',
        accountNumber: 'ACC-8910245',
        openedDate: subYears(new Date(), 2),
        balanceOrLimit: 480000,
        status: 'Active',
      },
      {
        productName: 'Insignia Elite Credit Suite',
        category: 'Credit Cards',
        accountNumber: 'CRD-4412980',
        openedDate: subMonths(new Date(), 14),
        balanceOrLimit: 300000,
        status: 'Active',
      },
    ],
    financialGoals: [
      { goal: 'Electric SUV Purchase (₹22 Lakhs)', targetAmount: 2200000, targetYear: 2026, status: 'Active' },
      { goal: 'Retirement Wealth Corpus', targetAmount: 15000000, targetYear: 2045, status: 'Planned' },
    ],
    interests: ['Automotive Upgrades', 'Tech Stocks', 'Mutual Fund SIPs'],
    kycStatus: 'Verified',
    totalRelationshipValue: 780000,
  },
  // Scenario B: Priya Sharma (High engagement, Active Opportunity, Overdue Follow-up)
  {
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98110 54321',
    city: 'Delhi',
    occupation: 'Chief Marketing Officer',
    companyName: 'Zomato Media',
    age: 39,
    incomeRange: '50 LPA - 1 Cr',
    segment: 'High Value',
    relationshipStatus: 'High Opportunity',
    engagementScore: 92,
    relationshipHealthScore: 84,
    daysSinceLastInteraction: 6,
    existingProducts: [
      {
        productName: 'Premier Advantage Savings',
        category: 'Savings & Deposits',
        accountNumber: 'ACC-9128301',
        openedDate: subYears(new Date(), 3),
        balanceOrLimit: 2400000,
        status: 'Active',
      },
      {
        productName: 'Insignia Elite Credit Suite',
        category: 'Credit Cards',
        accountNumber: 'CRD-7782190',
        openedDate: subYears(new Date(), 2),
        balanceOrLimit: 800000,
        status: 'Active',
      },
      {
        productName: 'Dynamic Horizon Wealth Portfolio',
        category: 'Wealth & Investments',
        accountNumber: 'WLT-1102943',
        openedDate: subMonths(new Date(), 8),
        balanceOrLimit: 3500000,
        status: 'Active',
      },
    ],
    financialGoals: [
      { goal: 'Luxury Villa Acquisition in Gurgaon', targetAmount: 8500000, targetYear: 2026, status: 'In Progress' },
    ],
    interests: ['Real Estate Investment', 'Private Equity', 'Global Travel'],
    kycStatus: 'Verified',
    totalRelationshipValue: 6700000,
  },
  // Scenario C: Arjun Singh (Recent Need Mention, Low Product Depth)
  {
    firstName: 'Arjun',
    lastName: 'Singh',
    email: 'arjun.singh@example.com',
    phone: '+91 98450 78901',
    city: 'Bengaluru',
    occupation: 'Staff Product Manager',
    companyName: 'Swiggy',
    age: 31,
    incomeRange: '25-50 LPA',
    segment: 'Young Professional',
    relationshipStatus: 'Active',
    engagementScore: 78,
    relationshipHealthScore: 72,
    daysSinceLastInteraction: 18,
    existingProducts: [
      {
        productName: 'Executive Privilege Salary Package',
        category: 'Savings & Deposits',
        accountNumber: 'ACC-3301928',
        openedDate: subMonths(new Date(), 10),
        balanceOrLimit: 350000,
        status: 'Active',
      },
    ],
    financialGoals: [
      { goal: 'First Home Down Payment', targetAmount: 4000000, targetYear: 2026, status: 'Active' },
    ],
    interests: ['Home Loans', 'Tax Saving Instruments', 'Index Funds'],
    kycStatus: 'Verified',
    totalRelationshipValue: 350000,
  },
  // Scenario D: Ananya Iyer (KYC Additional Info Required, Salaried)
  {
    firstName: 'Ananya',
    lastName: 'Iyer',
    email: 'ananya.iyer@example.com',
    phone: '+91 98401 22334',
    city: 'Chennai',
    occupation: 'VP of Engineering',
    companyName: 'Freshworks',
    age: 42,
    incomeRange: '50 LPA - 1 Cr',
    segment: 'High Value',
    relationshipStatus: 'Needs Attention',
    engagementScore: 68,
    relationshipHealthScore: 62,
    daysSinceLastInteraction: 32,
    existingProducts: [
      {
        productName: 'Premier Advantage Savings',
        category: 'Savings & Deposits',
        accountNumber: 'ACC-5510293',
        openedDate: subYears(new Date(), 4),
        balanceOrLimit: 1850000,
        status: 'Active',
      },
    ],
    financialGoals: [
      { goal: 'Children Higher Education Trust', targetAmount: 6000000, targetYear: 2028, status: 'Active' },
    ],
    interests: ['International Education', 'Fixed Income', 'Health Shields'],
    kycStatus: 'Additional Information Required',
    totalRelationshipValue: 1850000,
  },
  // Scenario E: Vikram Malhotra (Dormant Customer, 110 days inactive)
  {
    firstName: 'Vikram',
    lastName: 'Malhotra',
    email: 'vikram.malhotra@example.com',
    phone: '+91 98200 99887',
    city: 'Mumbai',
    occupation: 'Managing Director',
    companyName: 'Malhotra Logistics Ltd',
    age: 51,
    incomeRange: '> 1 Cr',
    segment: 'Self-Employed',
    relationshipStatus: 'Dormant',
    engagementScore: 35,
    relationshipHealthScore: 42,
    daysSinceLastInteraction: 110,
    existingProducts: [
      {
        productName: 'GrowthEnterprise SME Current Account',
        category: 'SME Business Loan',
        accountNumber: 'ACC-1100293',
        openedDate: subYears(new Date(), 5),
        balanceOrLimit: 6200000,
        status: 'Active',
      },
    ],
    financialGoals: [
      { goal: 'Fleet Expansion & Warehouse Financing', targetAmount: 25000000, targetYear: 2027, status: 'Planned' },
    ],
    interests: ['Working Capital', 'Commercial Real Estate', 'Treasury Management'],
    kycStatus: 'Verified',
    totalRelationshipValue: 6200000,
  },
];

// Generate additional 45 customer profiles to reach 50+ total
const firstNames = [
  'Aditya', 'Neha', 'Rohan', 'Sneha', 'Kavita', 'Sanjay', 'Pooja', 'Manish', 'Divya', 'Deepak',
  'Simran', 'Amit', 'Sunita', 'Gaurav', 'Meera', 'Nikhil', 'Tanvi', 'Abhishek', 'Shweta', 'Rajesh',
  'Swati', 'Karan', 'Rashmi', 'Varun', 'Ritu', 'Tarun', 'Anushka', 'Sachin', 'Preeti', 'Harsh',
  'Bhavna', 'Siddharth', 'Pallavi', 'Akash', 'Shruti', 'Vikas', 'Monika', 'Mohit', 'Neelam', 'Yash',
  'Alok', 'Smriti', 'Prateek', 'Komal', 'Suraj'
];

const lastNames = [
  'Verma', 'Kapoor', 'Gupta', 'Patel', 'Reddy', 'Chopra', 'Nair', 'Bose', 'Rao', 'Jain',
  'Saxena', 'Deshmukh', 'Mishra', 'Aggarwal', 'Bhatia', 'Pillai', 'Kulkarni', 'Joshi', 'Menon', 'Shah',
  'Pandey', 'Sen', 'Trivedi', 'Bansal', 'Thakur', 'Choudhary', 'Ghosh', 'Chatterjee', 'Dutt', 'Dube',
  'Sood', 'Sethi', 'Singhal', 'Kashyap', 'Chawla', 'Bakshi', 'Vaidya', 'Dewan', 'Oberoi', 'Kaul',
  'Nambiar', 'Dhar', 'Khatri', 'Lal', 'Somani'
];

const occupations = [
  'Senior Data Scientist', 'Chartered Accountant', 'Enterprise Sales Director', 'Cardiac Surgeon',
  'Principal Consultant', 'Digital Agency Founder', 'Supply Chain Head', 'Fintech Engineer',
  'Real Estate Developer', 'HR Business Partner', 'Operations Director', 'Architect & Interior Designer'
];

const segments = [
  'Young Professional', 'Salaried', 'Self-Employed', 'High Value', 'Family Banking', 'Dormant', 'New Customer'
];

async function seedDatabase() {
  console.log('Seeding FinSight 360 Database with high quality relational records...');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Customer.deleteMany({}),
    Lead.deleteMany({}),
    Interaction.deleteMany({}),
    FollowUp.deleteMany({}),
    Opportunity.deleteMany({}),
    RelationshipSignal.deleteMany({}),
    Recommendation.deleteMany({}),
    Product.deleteMany({}),
    Notification.deleteMany({}),
    KYCRecord.deleteMany({}),
  ]);

  // 1. Create Demo User
  const demoRM = await User.create({
    name: 'Kushagra Sharma',
    email: 'rm@finsight.demo',
    password: 'Demo@123',
    role: 'Senior RM',
    branch: 'North Zone Flagship Branch',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  });

  console.log(`Demo RM Created: ${demoRM.email} / Demo@123`);

  // 2. Seed Products
  const createdProducts = await Product.insertMany(productsCatalog);
  console.log(`Products Seeded: ${createdProducts.length}`);

  // 3. Seed Customers
  const customerDocs = [];
  let custIndex = 1;

  // Add predefined scenarios first
  for (const profile of customerSeedProfiles) {
    const custId = `CUST-${String(custIndex).padStart(4, '0')}`;
    const lastIntDate = subDays(new Date(), profile.daysSinceLastInteraction || 15);
    const joinDate = subMonths(new Date(), Math.floor(12 + Math.random() * 36));

    customerDocs.push({
      customerId: custId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      city: profile.city,
      occupation: profile.occupation,
      companyName: profile.companyName,
      age: profile.age,
      incomeRange: profile.incomeRange,
      customerSince: joinDate,
      segment: profile.segment,
      relationshipStatus: profile.relationshipStatus,
      engagementScore: profile.engagementScore,
      relationshipHealthScore: profile.relationshipHealthScore,
      existingProducts: profile.existingProducts,
      financialGoals: profile.financialGoals,
      interests: profile.interests,
      lastInteraction: lastIntDate,
      kycStatus: profile.kycStatus,
      assignedRM: demoRM._id,
      totalRelationshipValue: profile.totalRelationshipValue,
    });
    custIndex++;
  }

  // Generate remaining customers to reach 50+
  for (let i = 0; i < 45; i++) {
    const custId = `CUST-${String(custIndex).padStart(4, '0')}`;
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const city = indianCities[i % indianCities.length];
    const occ = occupations[i % occupations.length];
    const seg = segments[i % segments.length];
    const daysSince = seg === 'Dormant' ? Math.floor(65 + Math.random() * 80) : Math.floor(3 + Math.random() * 45);
    const lastIntDate = subDays(new Date(), daysSince);
    const joinDate = seg === 'New Customer' ? subDays(new Date(), Math.floor(10 + Math.random() * 40)) : subMonths(new Date(), Math.floor(6 + Math.random() * 48));

    const healthScore = seg === 'Dormant' ? Math.floor(35 + Math.random() * 20) : seg === 'High Value' ? Math.floor(80 + Math.random() * 18) : Math.floor(60 + Math.random() * 30);
    const engagementScore = seg === 'Dormant' ? Math.floor(20 + Math.random() * 25) : Math.floor(65 + Math.random() * 30);

    const prods = [
      {
        productName: 'Premier Advantage Savings',
        category: 'Savings & Deposits',
        accountNumber: `ACC-700${Math.floor(1000 + Math.random() * 9000)}`,
        openedDate: joinDate,
        balanceOrLimit: Math.floor(150000 + Math.random() * 1200000),
        status: 'Active',
      },
    ];

    if (i % 2 === 0) {
      prods.push({
        productName: 'Insignia Elite Credit Suite',
        category: 'Credit Cards',
        accountNumber: `CRD-300${Math.floor(1000 + Math.random() * 9000)}`,
        openedDate: subMonths(new Date(), 6),
        balanceOrLimit: 400000,
        status: 'Active',
      });
    }

    if (i % 3 === 0) {
      prods.push({
        productName: 'Dynamic Horizon Wealth Portfolio',
        category: 'Wealth & Investments',
        accountNumber: `WLT-500${Math.floor(1000 + Math.random() * 9000)}`,
        openedDate: subMonths(new Date(), 4),
        balanceOrLimit: 850000,
        status: 'Active',
      });
    }

    const totalVal = prods.reduce((acc, p) => acc + (p.balanceOrLimit || 0), 0);

    customerDocs.push({
      customerId: custId,
      firstName: fn,
      lastName: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@demo-mail.com`,
      phone: `+91 ${Math.floor(90000 + Math.random() * 9999)} ${Math.floor(10000 + Math.random() * 89999)}`,
      city,
      occupation: occ,
      companyName: `${city} Tech & Commercial Hub`,
      age: Math.floor(26 + Math.random() * 35),
      incomeRange: seg === 'High Value' ? '50 LPA - 1 Cr' : seg === 'Young Professional' ? '10-25 LPA' : '25-50 LPA',
      customerSince: joinDate,
      segment: seg,
      relationshipStatus: seg === 'Dormant' ? 'Dormant' : healthScore >= 80 ? 'High Opportunity' : healthScore < 60 ? 'Needs Attention' : 'Active',
      engagementScore,
      relationshipHealthScore: healthScore,
      existingProducts: prods,
      financialGoals: [
        { goal: i % 2 === 0 ? 'Home Renovation & Expansion' : 'Retirement Corpus Accumulation', targetAmount: 2500000, targetYear: 2027, status: 'Active' },
      ],
      interests: ['Financial Planning', 'Digital Banking', 'Fixed Deposits'],
      lastInteraction: lastIntDate,
      kycStatus: i % 8 === 0 ? 'Pending' : i % 12 === 0 ? 'Additional Information Required' : 'Verified',
      assignedRM: demoRM._id,
      totalRelationshipValue: totalVal,
    });
    custIndex++;
  }

  const savedCustomers = await Customer.insertMany(customerDocs);
  console.log(`Customers Seeded: ${savedCustomers.length}`);

  // 4. Seed Interactions (100+)
  const interactionDocs = [];
  let intIndex = 1;

  for (let i = 0; i < savedCustomers.length; i++) {
    const cust = savedCustomers[i];
    const interactionCount = i === 0 ? 5 : i === 1 ? 6 : Math.floor(2 + Math.random() * 3);

    for (let j = 0; j < interactionCount; j++) {
      const daysAgo = Math.floor(j * 15 + Math.random() * 10);
      const isVehicleSpecific = i === 0 && j === 1;
      const isHomeSpecific = i === 1 && j === 0;

      interactionDocs.push({
        interactionId: `INT-${String(intIndex).padStart(4, '0')}`,
        customerId: cust._id,
        type: j % 3 === 0 ? 'Phone Call' : j % 3 === 1 ? 'Portfolio Review' : 'Branch Visit',
        channel: j % 2 === 0 ? 'Outbound Call' : 'In-Person',
        date: subDays(new Date(), daysAgo),
        summary: isVehicleSpecific
          ? 'Customer Rahul Mehta inquired about electric vehicle financing rates for upcoming SUV purchase next quarter. Shared loan brochure.'
          : isHomeSpecific
          ? 'Discussed luxury property acquisition in Gurgaon. Priya requested pre-approved mortgage structuring.'
          : `Relationship touchpoint regarding account portfolio, liquidity review, and digital banking services. Customer expressed ${j % 2 === 0 ? 'satisfaction with current RM response time' : 'interest in upcoming tax-saving deposit schemes'}.`,
        outcome: isVehicleSpecific
          ? 'Positive - Opportunity Identified'
          : j % 2 === 0
          ? 'Positive - Follow-up Requested'
          : 'Neutral - Information Provided',
        sentiment: j % 4 === 0 ? 'Hesitant' : 'Positive',
        keyTopics: isVehicleSpecific
          ? ['Vehicle Financing', 'Interest Rates', 'Tenure']
          : ['Portfolio Review', 'Deposits', 'Account Limits'],
        nextActionNeeded: isVehicleSpecific
          ? 'Schedule dedicated vehicle financing advisory call'
          : 'Send updated portfolio statement',
        recordedBy: demoRM._id,
      });
      intIndex++;
    }
  }

  const savedInteractions = await Interaction.insertMany(interactionDocs);
  console.log(`Interactions Seeded: ${savedInteractions.length}`);

  // 5. Seed Follow-ups (50+)
  const followupDocs = [];
  let folIndex = 1;

  for (let i = 0; i < savedCustomers.length; i++) {
    const cust = savedCustomers[i];

    // Scenario A: Rahul Mehta has an overdue follow-up
    if (i === 0) {
      followupDocs.push({
        followUpId: `FOL-${String(folIndex++).padStart(4, '0')}`,
        customerId: cust._id,
        title: 'Vehicle Financing Follow-up & Rate Proposal',
        scheduledDate: subDays(new Date(), 3), // Overdue by 3 days!
        scheduledTime: '11:30 AM',
        purpose: 'Vehicle Loan Discussion',
        priority: 'High',
        assignedRM: demoRM._id,
        status: 'Pending',
        notes: 'Follow up on electric SUV quotation and share competitive 8.40% interest rate structure.',
      });
    } else if (i === 1) {
      followupDocs.push({
        followUpId: `FOL-${String(folIndex++).padStart(4, '0')}`,
        customerId: cust._id,
        title: 'Gurgaon Property Loan Pre-Sanction Discussion',
        scheduledDate: addDays(new Date(), 1),
        scheduledTime: '03:00 PM',
        purpose: 'Home Loan Consultation',
        priority: 'High',
        assignedRM: demoRM._id,
        status: 'Pending',
        notes: 'Present pre-approved sanction terms for Gurgaon property purchase.',
      });
    } else {
      const isOverdue = i % 5 === 0;
      const schedDate = isOverdue
        ? subDays(new Date(), Math.floor(1 + Math.random() * 5))
        : addDays(new Date(), Math.floor(1 + Math.random() * 12));
      const isCompleted = i % 3 === 0;

      followupDocs.push({
        followUpId: `FOL-${String(folIndex++).padStart(4, '0')}`,
        customerId: cust._id,
        title: `Relationship Review - ${cust.firstName} ${cust.lastName}`,
        scheduledDate: schedDate,
        scheduledTime: '10:00 AM',
        purpose: i % 4 === 0 ? 'Wealth & Investment Advisory' : i % 3 === 0 ? 'Deposit Renewal' : 'Relationship Review',
        priority: isOverdue ? 'High' : 'Medium',
        assignedRM: demoRM._id,
        status: isCompleted ? 'Completed' : 'Pending',
        completedDate: isCompleted ? subDays(new Date(), 2) : undefined,
        outcome: isCompleted ? 'Customer agreed to review wealth allocation during next branch visit.' : undefined,
        notes: 'Review overall portfolio performance and address any pending queries.',
      });

      if (i % 6 === 0) {
        followupDocs.push({
          followUpId: `FOL-${String(folIndex++).padStart(4, '0')}`,
          customerId: cust._id,
          title: `Compliance & KYC Check - ${cust.firstName} ${cust.lastName}`,
          scheduledDate: addDays(new Date(), 4),
          scheduledTime: '02:30 PM',
          purpose: 'KYC Documentation Follow-up',
          priority: 'Medium',
          assignedRM: demoRM._id,
          status: 'Pending',
          notes: 'Collect updated identity records if required.',
        });
      }
    }
  }

  const savedFollowups = await FollowUp.insertMany(followupDocs);
  console.log(`Follow-ups Seeded: ${savedFollowups.length}`);

  // 6. Seed Relationship Signals (50+)
  const signalDocs = [];
  let sigIndex = 1;

  for (let i = 0; i < savedCustomers.length; i++) {
    const cust = savedCustomers[i];
    const custInteractions = savedInteractions.filter((int) => String(int.customerId) === String(cust._id));
    const custFollowups = savedFollowups.filter((fol) => String(fol.customerId) === String(cust._id));

    const detected = detectSignals({
      customer: cust,
      interactions: custInteractions,
      followups: custFollowups,
      opportunities: [],
    });

    detected.forEach((sig) => {
      signalDocs.push({
        signalId: `SIG-${String(sigIndex++).padStart(4, '0')}`,
        customerId: cust._id,
        type: sig.type,
        severity: sig.severity,
        title: sig.title,
        reason: sig.reason,
        detectedDate: subDays(new Date(), Math.floor(1 + Math.random() * 14)),
        status: 'Active',
        category: sig.category,
        scoreImpact: sig.scoreImpact,
      });
    });
  }

  const savedSignals = await RelationshipSignal.insertMany(signalDocs);
  console.log(`Relationship Signals Seeded: ${savedSignals.length}`);

  // 7. Seed Opportunities (40+)
  const oppDocs = [];
  let oppIndex = 1;

  for (let i = 0; i < savedCustomers.length; i++) {
    const cust = savedCustomers[i];

    if (i === 0) {
      oppDocs.push({
        opportunityId: `OPP-${String(oppIndex++).padStart(4, '0')}`,
        customerId: cust._id,
        title: 'SmartDrive EV Financing Discussion',
        category: 'Vehicle Financing',
        estimatedValue: 1800000,
        confidenceScore: 88,
        stage: 'Discussion Scheduled',
        status: 'Open',
        detectedReason: 'Rahul Mehta explicitly confirmed vehicle purchase milestone during interaction INT-0002.',
        suggestedAction: 'Share quotation comparison and pre-approved limit letter.',
      });
    } else if (i === 1) {
      oppDocs.push({
        opportunityId: `OPP-${String(oppIndex++).padStart(4, '0')}`,
        customerId: cust._id,
        title: 'Apex Premium Property Loan Advisory',
        category: 'Home Financing',
        estimatedValue: 7500000,
        confidenceScore: 92,
        stage: 'Proposal Shared',
        status: 'In Progress',
        detectedReason: 'Priya Sharma requested structuring for upcoming Gurgaon real estate acquisition.',
        suggestedAction: 'Schedule joint consultation with mortgage structuring specialist.',
      });
    } else {
      const oppCategory = i % 4 === 0 ? 'Investment Advisory' : i % 3 === 0 ? 'Premium Banking Upgrade' : i % 2 === 0 ? 'Credit Card Suite' : 'Term Deposit Allocation';
      oppDocs.push({
        opportunityId: `OPP-${String(oppIndex++).padStart(4, '0')}`,
        customerId: cust._id,
        title: `${oppCategory} Opportunity`,
        category: oppCategory,
        estimatedValue: Math.floor(300000 + Math.random() * 2000000),
        confidenceScore: Math.floor(65 + Math.random() * 25),
        stage: i % 4 === 0 ? 'Proposal Shared' : 'Detected',
        status: 'Open',
        detectedReason: `Customer relationship profile and income bracket qualify for ${oppCategory}.`,
        suggestedAction: 'Introduce solution during next planned relationship touchpoint.',
      });
    }
  }

  const savedOpps = await Opportunity.insertMany(oppDocs);
  console.log(`Opportunities Seeded: ${savedOpps.length}`);

  // 8. Seed Recommendations & Briefs (20+)
  const recDocs = [];
  let recIndex = 1;

  for (let i = 0; i < 22; i++) {
    const cust = savedCustomers[i];
    recDocs.push({
      recommendationId: `REC-${String(recIndex++).padStart(4, '0')}`,
      customerId: cust._id,
      objective: i === 0
        ? 'Re-establish engagement after 74 days of dormancy and present SmartDrive vehicle financing options for stated SUV goal.'
        : `Conduct proactive relationship review for ${cust.segment} segment and explore suitability for portfolio optimization.`,
      talkingPoints: [
        `Congratulate on continued tenure since ${new Date(cust.customerSince).getFullYear()}.`,
        i === 0 ? 'Inquire if the electric SUV purchase timeline for 2026 is still on schedule.' : 'Review satisfaction with current account tier and transaction limits.',
        'Present tailored features with zero processing charges for pre-approved customers.',
        'Schedule next review milestone.',
      ],
      suggestedProducts: i === 0 ? ['SmartDrive Auto Financing', 'Insignia Elite Credit Suite'] : ['Dynamic Horizon Wealth Portfolio'],
      rationale: 'Derived from multi-factor deterministic scoring factoring interaction recency and explicit stated goals.',
      priorityScore: cust.relationshipHealthScore < 60 ? 88 : 72,
      source: i % 2 === 0 ? 'AI Generated' : 'Rule-Based Engine',
      status: 'Active',
      generatedDate: subDays(new Date(), Math.floor(1 + Math.random() * 7)),
    });
  }

  await Recommendation.insertMany(recDocs);
  console.log(`Recommendations Seeded: ${recDocs.length}`);

  // 9. Seed KYC Records (50+)
  const kycDocs = [];
  let kycIndex = 1;

  for (let i = 0; i < savedCustomers.length; i++) {
    const cust = savedCustomers[i];
    const isPending = cust.kycStatus === 'Pending';
    const isActionRequired = cust.kycStatus === 'Additional Information Required';

    kycDocs.push({
      recordId: `KYC-${String(kycIndex++).padStart(4, '0')}`,
      customerId: cust._id,
      status: cust.kycStatus,
      identityProof: {
        docType: 'Passport / Aadhaar',
        docNumber: `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
        status: isPending ? 'Pending' : 'Verified',
        uploadedAt: subMonths(new Date(), 6),
      },
      addressProof: {
        docType: 'Utility Bill / Rent Agreement',
        status: isActionRequired ? 'Missing' : isPending ? 'Pending' : 'Verified',
        uploadedAt: subMonths(new Date(), 6),
      },
      panCard: {
        panNumber: `ABCDE${Math.floor(1000 + Math.random() * 9000)}F`,
        status: isPending ? 'Pending' : 'Verified',
        verifiedAt: isPending ? undefined : subMonths(new Date(), 6),
      },
      additionalDoc: {
        docType: 'Form 16 / Salary Slips',
        status: isActionRequired ? 'Missing' : 'Verified',
      },
      submittedDate: subMonths(new Date(), 6),
      verifiedDate: cust.kycStatus === 'Verified' ? subMonths(new Date(), 6) : undefined,
      verifiedBy: cust.kycStatus === 'Verified' ? demoRM._id : undefined,
      remarks: cust.kycStatus === 'Verified'
        ? 'All mandatory identity and regulatory verification checks completed.'
        : isActionRequired
        ? 'Latest 3 months address proof required due to city address update.'
        : 'Initial KYC documentation pending verification queue.',
      complianceChecklist: [
        { item: 'Identity Document Verified', passed: !isPending },
        { item: 'Address Proof Validated', passed: !isPending && !isActionRequired },
        { item: 'PAN Verified with Income Tax Database', passed: !isPending },
        { item: 'Anti-Money Laundering (AML) Screen Passed', passed: true },
      ],
    });
  }

  await KYCRecord.insertMany(kycDocs);
  console.log(`KYC Records Seeded: ${kycDocs.length}`);

  // 10. Seed Leads (75+)
  const leadDocs = [];
  let leadIndex = 1;

  const leadRequirements = [
    { req: 'Home Loan for 3 BHK Apartment', cat: 'Home Financing', val: 6500000, prio: 'High' },
    { req: 'Electric Sedan Car Financing', cat: 'Vehicle Financing', val: 1600000, prio: 'High' },
    { req: 'Wealth Management & Mutual Fund SIP', cat: 'Wealth & Investments', val: 1200000, prio: 'Medium' },
    { req: 'Business Working Capital Overdraft', cat: 'SME Business Loan', val: 4000000, prio: 'High' },
    { req: 'Premium Travel Credit Card', cat: 'Credit Cards', val: 350000, prio: 'Low' },
    { req: 'Term Life Insurance Shield ₹2 Cr', cat: 'Insurance & Protection', val: 2000000, prio: 'Medium' },
    { req: 'Corporate Salary Account Relocation', cat: 'Savings & Deposits', val: 500000, prio: 'Medium' },
  ];

  const leadSources = [
    'Digital Campaign', 'Website Enquiry', 'Customer Referral', 'Branch Walk-in',
    'Relationship Cross-sell', 'Partner Channel', 'Tele-outreach'
  ];

  const leadStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'DOCUMENTATION', 'CONVERTED', 'LOST'];

  for (let i = 0; i < 78; i++) {
    const fn = firstNames[(i * 3) % firstNames.length];
    const ln = lastNames[(i * 2) % lastNames.length];
    const city = indianCities[i % indianCities.length];
    const reqObj = leadRequirements[i % leadRequirements.length];
    const status = leadStatuses[i % leadStatuses.length];

    leadDocs.push({
      leadId: `LEAD-${String(leadIndex++).padStart(4, '0')}`,
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@lead-demo.in`,
      phone: `+91 ${Math.floor(91000 + Math.random() * 8999)} ${Math.floor(10000 + Math.random() * 89999)}`,
      city,
      source: leadSources[i % leadSources.length],
      segment: segments[i % (segments.length - 1)],
      requirement: reqObj.req,
      productCategory: reqObj.cat,
      priority: reqObj.prio,
      estimatedValue: reqObj.val,
      status,
      assignedRM: demoRM._id,
      lastContact: subDays(new Date(), Math.floor(1 + Math.random() * 20)),
      nextFollowUp: status !== 'CONVERTED' && status !== 'LOST' ? addDays(new Date(), Math.floor(1 + Math.random() * 10)) : undefined,
      notes: `Prospective applicant interested in ${reqObj.req}. Sourced via ${leadSources[i % leadSources.length]}.`,
    });
  }

  const savedLeads = await Lead.insertMany(leadDocs);
  console.log(`Leads Seeded: ${savedLeads.length}`);

  // 11. Seed Notifications (30+)
  const notificationDocs = [
    {
      notificationId: 'NOTIF-0001',
      title: 'Overdue Follow-up Alert',
      message: 'Follow-up for Rahul Mehta ("Vehicle Financing Follow-up") is overdue by 3 days.',
      type: 'Overdue follow-up',
      severity: 'High',
      relatedCustomer: savedCustomers[0]._id,
      isRead: false,
      link: `/customers/${savedCustomers[0]._id}`,
    },
    {
      notificationId: 'NOTIF-0002',
      title: 'High Priority Opportunity Detected',
      message: 'Priya Sharma has an active property financing requirement of ₹75,00,000.',
      type: 'New opportunity',
      severity: 'High',
      relatedCustomer: savedCustomers[1]._id,
      isRead: false,
      link: `/customers/${savedCustomers[1]._id}`,
    },
    {
      notificationId: 'NOTIF-0003',
      title: 'Customer Dormancy Warning',
      message: 'Vikram Malhotra has not had any touchpoint for 110 days. Health score dropped to 42.',
      type: 'Relationship health decline',
      severity: 'High',
      relatedCustomer: savedCustomers[4]._id,
      isRead: false,
      link: `/customers/${savedCustomers[4]._id}`,
    },
    {
      notificationId: 'NOTIF-0004',
      title: 'KYC Document Required',
      message: 'Ananya Iyer requires updated address proof for regulatory verification.',
      type: 'KYC pending',
      severity: 'Medium',
      relatedCustomer: savedCustomers[3]._id,
      isRead: false,
      link: `/customers/${savedCustomers[3]._id}`,
    },
    {
      notificationId: 'NOTIF-0005',
      title: 'New Lead Assigned',
      message: `Lead ${savedLeads[0].name} interested in ${savedLeads[0].requirement} assigned to your queue.`,
      type: 'New lead',
      severity: 'Medium',
      relatedLead: savedLeads[0]._id,
      isRead: false,
      link: '/leads',
    },
  ];

  for (let i = 6; i <= 32; i++) {
    const cust = savedCustomers[i % savedCustomers.length];
    notificationDocs.push({
      notificationId: `NOTIF-${String(i).padStart(4, '0')}`,
      title: i % 3 === 0 ? 'Upcoming Milestone Review' : i % 2 === 0 ? 'Cross-sell Signal Active' : 'Relationship Update',
      message: `Relationship intelligence alert for ${cust.firstName} ${cust.lastName} (${cust.segment}).`,
      type: i % 3 === 0 ? 'Customer requiring attention' : 'New opportunity',
      severity: i % 4 === 0 ? 'High' : 'Medium',
      relatedCustomer: cust._id,
      isRead: i > 15,
      link: `/customers/${cust._id}`,
    });
  }

  await Notification.insertMany(notificationDocs);
  console.log(`Notifications Seeded: ${notificationDocs.length}`);

  // 12. Run Intelligence Refresh across all customers to calculate live deterministic scores
  console.log('Calculating initial live deterministic intelligence & priority scores for all customers...');
  for (const customer of savedCustomers) {
    const custInteractions = savedInteractions.filter((i) => String(i.customerId) === String(customer._id));
    const custFollowups = savedFollowups.filter((f) => String(f.customerId) === String(customer._id));
    const custOpps = savedOpps.filter((o) => String(o.customerId) === String(customer._id));

    const health = calculateRelationshipHealth({ customer, interactions: custInteractions, followups: custFollowups });
    const signals = detectSignals({ customer, interactions: custInteractions, followups: custFollowups, opportunities: custOpps });
    const priority = calculatePriority({ customer, health, signals, followups: custFollowups, opportunities: custOpps });

    customer.relationshipHealthScore = health.score;
    customer.relationshipStatus = health.status;
    customer.healthBreakdown = health.breakdown;
    customer.priorityScore = priority.priorityScore;
    customer.priorityClassification = priority.classification;
    customer.priorityReasons = priority.reasons;
    customer.recommendedAction = priority.recommendedAction;

    await customer.save();
  }

  console.log('✅ FinSight 360 Database Seeding Completed Successfully!');
}

// Execute directly if run via CLI
if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  connectDB().then(async () => {
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  });
}

module.exports = { seedDatabase };
