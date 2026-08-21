export const TIER_MODULES = {
  Starter: ['dashboard', 'assessment', 'audit', 'evp', 'strategy'],
  Growth: ['dashboard', 'assessment', 'audit', 'evp', 'strategy', 'content', 'advocacy'],
  '360': [
    'dashboard', 'assessment', 'audit', 'evp', 'strategy', 'content', 'advocacy',
    'recruitment', 'assets', 'videos', 'internal', 'pipeline', 'ai',
  ],
};

export const TAB_DEFS = {
  dashboard: { label: 'Overview', type: 'metrics' },
  assessment: {
    label: 'Brand Assessment', type: 'form', fields: [
      { key: 'perception', label: 'Current Market Perception' },
      { key: 'channelReview', label: 'Careers Page / LinkedIn / Social Review' },
      { key: 'engagementFeedback', label: 'Employee Engagement & Candidate Feedback' },
      { key: 'competitorBenchmark', label: 'Competitor Benchmark' },
      { key: 'gaps', label: 'Gaps & Opportunities Identified' },
    ],
  },
  audit: {
    label: 'Audit Log', type: 'list', itemFields: [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'auditor', label: 'Conducted By' },
      { key: 'category', label: 'Category', type: 'select', options: ['Market Perception', 'Digital Channels', 'Employee Engagement', 'Competitor Benchmark', 'Policy Review', 'Other'] },
      { key: 'finding', label: 'Finding / Notes' },
      { key: 'score', label: 'Score (0-10)', type: 'number' },
      { key: 'evidenceLink', label: 'Evidence Link (Drive/Doc URL)' },
    ],
  },
  evp: {
    label: 'EVP Framework', type: 'form', fields: [
      { key: 'whyJoin', label: 'Why Employees Should Join' },
      { key: 'whyStay', label: 'Why Employees Should Stay' },
      { key: 'careerGrowth', label: 'Career Growth & Learning' },
      { key: 'leadership', label: 'Leadership & Culture' },
      { key: 'rewards', label: 'Rewards & Recognition' },
      { key: 'workLife', label: 'Work-Life Experience' },
      { key: 'dei', label: 'Diversity & Inclusion' },
      { key: 'purpose', label: 'Purpose & Values' },
    ],
  },
  strategy: {
    label: 'Brand Strategy', type: 'form', fields: [
      { key: 'positioning', label: 'Employer Brand Positioning' },
      { key: 'targetSegments', label: 'Target Talent Segments' },
      { key: 'personas', label: 'Candidate Personas' },
      { key: 'messages', label: 'Key Employer-Brand Messages' },
      { key: 'channels', label: 'Communication Channels' },
      { key: 'contentPillars', label: 'Content Pillars' },
      { key: 'calendarNotes', label: 'Annual / Monthly Calendar Notes' },
    ],
  },
  content: {
    label: 'Content Calendar', type: 'list', itemFields: [
      { key: 'title', label: 'Title' },
      { key: 'type', label: 'Type', type: 'select', options: ['Employee Story', 'Leadership Story', 'Life at Company', 'Testimonial', 'Career Growth Story', 'Culture Post', 'Award/Achievement', 'Celebration', 'CSR', 'Recruitment Campaign', 'Hiring Announcement'] },
      { key: 'platform', label: 'Platform', type: 'select', options: ['LinkedIn', 'Instagram', 'Facebook', 'YouTube', 'Careers Website', 'Job Portal', 'Internal'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Idea', 'Drafting', 'Review', 'Scheduled', 'Published'] },
      { key: 'date', label: 'Date', type: 'date' },
    ],
  },
  advocacy: {
    label: 'Employee Advocacy', type: 'list', itemFields: [
      { key: 'name', label: 'Ambassador Name' },
      { key: 'dept', label: 'Dept / Role' },
      { key: 'trained', label: 'Trained?', type: 'select', options: ['Yes', 'No'] },
      { key: 'posts', label: 'Posts Shared', type: 'number' },
      { key: 'reach', label: 'Reach', type: 'number' },
    ],
  },
  recruitment: {
    label: 'Recruitment Marketing', type: 'list', itemFields: [
      { key: 'name', label: 'Campaign Name' },
      { key: 'type', label: 'Type', type: 'select', options: ['General Hiring', 'Campus Hiring', 'Leadership Hiring', 'Diversity Hiring', 'Critical-Skill Hiring', 'Location-Specific'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Planning', 'Live', 'Closed'] },
      { key: 'notes', label: 'Notes' },
    ],
  },
  assets: {
    label: 'Digital Assets', type: 'checklist', items: [
      'Careers Website', 'Job Pages', '"Why Join Us" Section', 'Employee Testimonials',
      'Culture Pages', 'Leadership Pages', 'Candidate FAQs', 'Employer-Brand Videos',
    ],
  },
  videos: {
    label: 'Video Concepts', type: 'list', itemFields: [
      { key: 'title', label: 'Title' },
      { key: 'type', label: 'Type', type: 'select', options: ['Employee Testimonial', 'Leadership', 'Day in the Life', 'Office/Culture', 'Recruitment', 'Employee Celebration', 'EVP'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Concept', 'Script', 'Shoot', 'Edit', 'Published'] },
    ],
  },
  internal: {
    label: 'Internal Branding', type: 'form', fields: [
      { key: 'campaigns', label: 'Internal Campaigns' },
      { key: 'recognition', label: 'Recognition Campaigns' },
      { key: 'milestones', label: 'Employee Milestone Communication' },
      { key: 'newsletters', label: 'Internal Newsletters / Success Stories' },
    ],
  },
  pipeline: {
    label: 'Campaign Pipeline', type: 'pipeline',
    stages: ['Strategy', 'Content', 'Creative', 'Publishing', 'Employee Advocacy', 'Candidate Engagement', 'Analytics'],
  },
  ai: {
    label: 'AI-Enabled Log', type: 'list', itemFields: [
      { key: 'item', label: 'What Was AI-Generated' },
      { key: 'tool', label: 'Tool Used' },
      { key: 'date', label: 'Date', type: 'date' },
    ],
  },
};

export const METRIC_FIELDS = [
  {
    group: 'Employer Brand Score & Sentiment', fields: [
      { key: 'brandScore', label: 'Employer Brand Score (0-100)' },
      { key: 'employeeSentiment', label: 'Employee Sentiment (%)' },
      { key: 'leadershipTrust', label: 'Leadership Trust (%)' },
      { key: 'workLifeBalance', label: 'Work-Life Balance (%)' },
      { key: 'careerGrowthScore', label: 'Career Growth (%)' },
      { key: 'policySatisfaction', label: 'Policy Satisfaction (%)' },
    ],
  },
  {
    group: 'External Signals', fields: [
      { key: 'glassdoor', label: 'Glassdoor Rating' },
      { key: 'ambitionbox', label: 'AmbitionBox Rating' },
      { key: 'candidateNPS', label: 'Candidate NPS' },
      { key: 'employeeNPS', label: 'Employee NPS' },
      { key: 'attrition', label: 'Attrition Rate (%)' },
    ],
  },
  {
    group: 'Reach, Content & Recruitment Analytics', fields: [
      { key: 'reach', label: 'Employer-Brand Reach' },
      { key: 'engagement', label: 'Engagement Rate (%)' },
      { key: 'followers', label: 'Social Followers' },
      { key: 'careersTraffic', label: 'Careers-Page Traffic' },
      { key: 'applicationGrowth', label: 'Job Application Growth (%)' },
      { key: 'costPerApplication', label: 'Cost per Application' },
      { key: 'offerAcceptance', label: 'Offer Acceptance Rate (%)' },
      { key: 'qualityOfHire', label: 'Quality of Hire (score)' },
    ],
  },
];
