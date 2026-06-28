import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Review from '../models/Review.js';

dotenv.config();

const DEMO_PASSWORD = 'demo1234';

const ALL_DEMO_EMAILS = [
  'admin@njobs.com',
  'applicant@njobs.com',
  'applicant2@njobs.com',
  'applicant3@njobs.com',
  'employer@njobs.com',
  'employer2@njobs.com',
];

const clearPreviousSeed = async () => {
  const users = await User.find({ email: { $in: ALL_DEMO_EMAILS } });
  const employerIds = users.filter((u) => u.role === 'employer').map((u) => u._id);
  const applicantIds = users.filter((u) => u.role === 'applicant').map((u) => u._id);

  const companies = await Company.find({ owner: { $in: employerIds } }).select('_id');
  const companyIds = companies.map((c) => c._id);

  const jobs = await Job.find({ company: { $in: companyIds } }).select('_id');
  const jobIds = jobs.map((j) => j._id);

  await Application.deleteMany({
    $or: [{ job: { $in: jobIds } }, { applicant: { $in: applicantIds } }],
  });
  await Review.deleteMany({
    $or: [{ company: { $in: companyIds } }, { author: { $in: applicantIds } }],
  });
  await Job.deleteMany({ company: { $in: companyIds } });
  await Company.deleteMany({ owner: { $in: employerIds } });
  await User.deleteMany({ email: { $in: ALL_DEMO_EMAILS } });
};

const createAdmin = async () => {
  return User.create({
    name: 'Demo Admin',
    email: 'admin@njobs.com',
    password: DEMO_PASSWORD,
    role: 'admin',
    isEmailVerified: true,
  });
};

const createApplicants = async () => {
  const jamie = await User.create({
    name: 'Jamie Cruz',
    email: 'applicant@njobs.com',
    password: DEMO_PASSWORD,
    role: 'applicant',
    isEmailVerified: true,
    headline: 'Frontend Engineer with 3 years of experience',
    skills: ['React', 'JavaScript', 'Tailwind CSS', 'Node.js'],
    resume: { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileName: 'jamie-cruz-resume.pdf' },
  });

  const alex = await User.create({
    name: 'Alex Santos',
    email: 'applicant2@njobs.com',
    password: DEMO_PASSWORD,
    role: 'applicant',
    isEmailVerified: true,
    headline: 'Backend Developer specializing in Node.js and databases',
    skills: ['Node.js', 'MongoDB', 'PostgreSQL', 'Docker'],
    resume: { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileName: 'alex-santos-resume.pdf' },
  });

  const priya = await User.create({
    name: 'Priya Mendoza',
    email: 'applicant3@njobs.com',
    password: DEMO_PASSWORD,
    role: 'applicant',
    isEmailVerified: true,
    headline: 'Product Designer who loves clean, usable interfaces',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    resume: { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileName: 'priya-mendoza-resume.pdf' },
  });

  return { jamie, alex, priya };
};

const createEmployersAndCompanies = async () => {
  const morgan = await User.create({
    name: 'Morgan Reyes',
    email: 'employer@njobs.com',
    password: DEMO_PASSWORD,
    role: 'employer',
    isEmailVerified: true,
  });

  const brightline = await Company.create({
    companyName: 'Brightline Labs',
    description:
      'Brightline Labs builds developer tools used by thousands of engineering teams worldwide. We value autonomy, clear writing, and shipping fast.',
    website: 'https://example.com/brightline',
    industry: 'Software',
    location: 'Remote',
    size: '51-200',
    owner: morgan._id,
  });

  const dana = await User.create({
    name: 'Dana Villanueva',
    email: 'employer2@njobs.com',
    password: DEMO_PASSWORD,
    role: 'employer',
    isEmailVerified: true,
  });

  const harborCommerce = await Company.create({
    companyName: 'Harbor Commerce',
    description:
      'Harbor Commerce powers online checkout for mid-size retailers across Southeast Asia. We move fast, ship in small teams, and care deeply about reliability.',
    website: 'https://example.com/harbor',
    industry: 'E-commerce',
    location: 'Manila, Philippines',
    size: '201-500',
    owner: dana._id,
  });

  return { morgan, brightline, dana, harborCommerce };
};

const buildJobsData = (brightline, harborCommerce, morgan, dana) => [
  {
    title: 'Frontend Engineer',
    description:
      'Build and maintain our customer-facing dashboard using React and TypeScript. Work closely with design and product to ship features end to end.',
    requirements: '3+ years with React. Strong CSS fundamentals. Experience with REST APIs.',
    location: 'Remote',
    jobType: 'Remote',
    category: 'Engineering',
    experienceLevel: 'Mid Level',
    salaryMin: 70000,
    salaryMax: 95000,
    company: brightline._id,
    createdBy: morgan._id,
  },
  {
    title: 'Backend Engineer (Node.js)',
    description: 'Own our core API services, design schemas, and help scale our infrastructure as we grow.',
    requirements: 'Experience with Node.js, MongoDB, and distributed systems.',
    location: 'Manila, Philippines',
    jobType: 'Full Time',
    category: 'Engineering',
    experienceLevel: 'Senior Level',
    salaryMin: 90000,
    salaryMax: 130000,
    company: brightline._id,
    createdBy: morgan._id,
  },
  {
    title: 'Product Designer',
    description: 'Shape the end-to-end design of our product, from early concepts to polished, shippable UI.',
    requirements: 'Portfolio demonstrating end-to-end product design. Figma proficiency.',
    location: 'Remote',
    jobType: 'Contract',
    category: 'Design',
    experienceLevel: 'Mid Level',
    salaryMin: 60000,
    salaryMax: 85000,
    company: brightline._id,
    createdBy: morgan._id,
  },
  {
    title: 'Marketing Intern',
    description: 'Support our marketing team with content creation, social scheduling, and campaign reporting.',
    requirements: 'Currently enrolled in a marketing, communications, or related program.',
    location: 'Remote',
    jobType: 'Internship',
    category: 'Marketing',
    experienceLevel: 'Entry Level',
    salaryMin: null,
    salaryMax: null,
    company: brightline._id,
    createdBy: morgan._id,
  },
  {
    title: 'Full Stack Developer',
    description: 'Build features across our checkout and inventory systems used by hundreds of retailers daily.',
    requirements: 'Experience with React and Node.js. Comfortable working across the stack.',
    location: 'Manila, Philippines',
    jobType: 'Full Time',
    category: 'Engineering',
    experienceLevel: 'Mid Level',
    salaryMin: 80000,
    salaryMax: 110000,
    company: harborCommerce._id,
    createdBy: dana._id,
  },
  {
    title: 'Customer Support Specialist',
    description: 'Help our retail partners resolve issues quickly and keep their stores running smoothly.',
    requirements: 'Strong written communication. Experience with support tools is a plus.',
    location: 'Remote',
    jobType: 'Part Time',
    category: 'Customer Support',
    experienceLevel: 'Entry Level',
    salaryMin: 25000,
    salaryMax: 35000,
    company: harborCommerce._id,
    createdBy: dana._id,
  },
  {
    title: 'Senior Sales Executive',
    description: 'Lead enterprise sales conversations with retailers looking to modernize their checkout experience.',
    requirements: '5+ years in B2B sales, ideally in e-commerce or fintech.',
    location: 'Manila, Philippines',
    jobType: 'Full Time',
    category: 'Sales',
    experienceLevel: 'Senior Level',
    salaryMin: 100000,
    salaryMax: 140000,
    company: harborCommerce._id,
    createdBy: dana._id,
  },
];

const seed = async () => {
  await connectDB();

  console.log('Clearing previous demo data...');
  await clearPreviousSeed();

  console.log('Creating demo admin...');
  await createAdmin();

  console.log('Creating demo applicants...');
  const { jamie, alex, priya } = await createApplicants();

  console.log('Creating demo employers and companies...');
  const { morgan, brightline, dana, harborCommerce } = await createEmployersAndCompanies();

  console.log('Creating job postings...');
  const jobsData = buildJobsData(brightline, harborCommerce, morgan, dana);
  const jobs = await Job.insertMany(jobsData);
  const [frontendJob, backendJob, designJob, internshipJob, fullStackJob, supportJob, salesJob] = jobs;

  console.log('Creating applications across different statuses...');
  await Application.insertMany([
    {
      applicant: jamie._id,
      job: frontendJob._id,
      resumeUrl: jamie.resume.url,
      coverLetter: "I've been using Brightline Labs' tools for two years and would love to help build them.",
      status: 'Reviewed',
    },
    {
      applicant: jamie._id,
      job: designJob._id,
      resumeUrl: jamie.resume.url,
      coverLetter: 'I have some design experience alongside my frontend work and would love to contribute here too.',
      status: 'Pending',
    },
    {
      applicant: alex._id,
      job: backendJob._id,
      resumeUrl: alex.resume.url,
      coverLetter: 'I have four years of Node.js experience and have scaled APIs to handle high traffic loads.',
      status: 'Accepted',
    },
    {
      applicant: alex._id,
      job: fullStackJob._id,
      resumeUrl: alex.resume.url,
      coverLetter: "I'm comfortable across the stack and would love to help Harbor Commerce grow.",
      status: 'Pending',
    },
    {
      applicant: priya._id,
      job: designJob._id,
      resumeUrl: priya.resume.url,
      coverLetter: 'My portfolio includes several end-to-end product design projects I think would be a great fit here.',
      status: 'Reviewed',
    },
    {
      applicant: priya._id,
      job: internshipJob._id,
      resumeUrl: priya.resume.url,
      coverLetter: "I'm interested in growing into marketing alongside my design background.",
      status: 'Rejected',
    },
    {
      applicant: jamie._id,
      job: supportJob._id,
      resumeUrl: jamie.resume.url,
      coverLetter: "I'm looking for part-time work alongside my main role and enjoy helping people.",
      status: 'Pending',
    },
  ]);

  console.log('Creating company reviews...');
  await Review.insertMany([
    {
      company: brightline._id,
      author: jamie._id,
      rating: 5,
      title: 'Great team, real autonomy',
      comment: 'Interview process was respectful of my time and the team was transparent about expectations from day one.',
      jobTitleAtCompany: 'Frontend Engineer',
    },
    {
      company: brightline._id,
      author: priya._id,
      rating: 4,
      title: 'Solid process, a bit slow to respond',
      comment: 'The actual interview was great and the team seemed genuinely thoughtful, but it took a couple weeks to hear back after each stage.',
      jobTitleAtCompany: 'Product Designer (applied)',
    },
    {
      company: harborCommerce._id,
      author: alex._id,
      rating: 5,
      title: 'Fast-moving and supportive',
      comment: 'Onboarding was smooth and my manager checked in regularly during my first few weeks. Would recommend.',
      jobTitleAtCompany: 'Full Stack Developer',
    },
  ]);

  const recalcRating = async (companyId) => {
    const stats = await Review.aggregate([
      { $match: { company: companyId } },
      { $group: { _id: '$company', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const ratingAverage = stats.length > 0 ? Math.round(stats[0].avg * 10) / 10 : 0;
    const ratingCount = stats.length > 0 ? stats[0].count : 0;
    await Company.findByIdAndUpdate(companyId, { ratingAverage, ratingCount });
  };

  await recalcRating(brightline._id);
  await recalcRating(harborCommerce._id);

  console.log('\nSeed complete!');
  console.log('-----------------------------------');
  console.log(`Admin login:      admin@njobs.com / ${DEMO_PASSWORD}`);
  console.log(`Applicant login:  applicant@njobs.com / ${DEMO_PASSWORD}  (Jamie Cruz)`);
  console.log(`Applicant login:  applicant2@njobs.com / ${DEMO_PASSWORD}  (Alex Santos)`);
  console.log(`Applicant login:  applicant3@njobs.com / ${DEMO_PASSWORD}  (Priya Mendoza)`);
  console.log(`Employer login:   employer@njobs.com / ${DEMO_PASSWORD}  (Morgan Reyes — Brightline Labs)`);
  console.log(`Employer login:   employer2@njobs.com / ${DEMO_PASSWORD}  (Dana Villanueva — Harbor Commerce)`);
  console.log('-----------------------------------\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
