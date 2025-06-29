import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Dummy ideas data
const dummyIdeas = [
  // Fun & Entertainment
  {
    title: "Is cereal soup?",
    description: "This age-old question has divided households for generations. Cereal has liquid (milk), solid ingredients (cereal pieces), and is eaten with a spoon. But is it really soup? Let's settle this debate once and for all!",
    author_name: "FoodPhilosopher",
    category: "Fun",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Best pizza topping combination?",
    description: "Pizza is a canvas for creativity, but what's the ultimate topping combination? From classic pepperoni to controversial pineapple, let's find out what the community thinks makes the perfect pizza.",
    author_name: "PizzaLover42",
    category: "Food",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Should we have 4-day work weeks?",
    description: "Multiple studies show that 4-day work weeks can increase productivity and employee satisfaction while reducing burnout. Companies like Microsoft Japan saw 40% productivity gains. Is it time to make this the standard?",
    author_name: "WorkLifeBalance",
    category: "Life",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Is a hot dog a sandwich?",
    description: "The great culinary classification debate continues! A hot dog has meat between bread, but is it really a sandwich? The National Hot Dog and Sausage Council says no, but what do you think?",
    author_name: "CulinaryDebater",
    category: "Fun",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Best superhero movie of all time?",
    description: "From the MCU to DC, from classic Superman to modern Marvel epics, superhero movies have dominated cinema. Which one stands above the rest as the greatest superhero film ever made?",
    author_name: "MovieBuff",
    category: "Entertainment",
    idea_type: "poll",
    status: "active"
  },

  // Civic & Policy Proposals
  {
    title: "Universal Basic Income Pilot Program",
    description: "Implement a 2-year UBI pilot program providing $1,000 monthly to 10,000 randomly selected citizens. This would test the economic and social impacts of guaranteed income, including effects on employment, education, health, and local economies. Data would inform future policy decisions on poverty reduction and economic security.",
    author_name: "PolicyInnovator",
    category: "Civic",
    idea_type: "proposal",
    status: "active"
  },
  {
    title: "Ranked Choice Voting Implementation",
    description: "Replace first-past-the-post voting with ranked choice voting for all local elections. This system allows voters to rank candidates by preference, eliminating the 'spoiler effect' and encouraging more diverse candidates. It promotes coalition-building and ensures winners have broader support.",
    author_name: "DemocracyReformer",
    category: "Civic",
    idea_type: "proposal",
    status: "active"
  },
  {
    title: "Community Solar Garden Initiative",
    description: "Establish neighborhood solar gardens where residents can purchase or lease solar panels collectively. This makes renewable energy accessible to renters and those with unsuitable roofs, reduces costs through economies of scale, and builds community engagement around sustainability.",
    author_name: "GreenEnergy",
    category: "Environment",
    idea_type: "proposal",
    status: "active"
  },
  {
    title: "Digital Privacy Bill of Rights",
    description: "Enact comprehensive digital privacy legislation giving citizens control over their personal data. Include rights to know what data is collected, delete personal information, opt-out of data sales, and receive compensation for data use. Establish strong enforcement mechanisms and penalties.",
    author_name: "PrivacyAdvocate",
    category: "Tech",
    idea_type: "proposal",
    status: "active"
  },
  {
    title: "Mental Health First Aid Training",
    description: "Mandate mental health first aid training for all public employees, teachers, and healthcare workers. This program would teach recognition of mental health crises, de-escalation techniques, and proper referral procedures, creating a more supportive community infrastructure.",
    author_name: "MentalHealthChampion",
    category: "Healthcare",
    idea_type: "proposal",
    status: "active"
  },

  // Technology
  {
    title: "Should AI be required to identify itself?",
    description: "As AI becomes more sophisticated and human-like, should there be laws requiring AI systems to clearly identify themselves when interacting with humans? This could prevent deception but might limit AI's effectiveness in certain applications.",
    author_name: "TechEthicist",
    category: "Tech",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "AI Regulation Framework for Local Government",
    description: "Establish comprehensive AI governance policies for municipal use, including algorithmic auditing requirements, bias testing protocols, public transparency measures, and citizen appeal processes. Ensure AI systems used in government services are fair, accountable, and serve the public interest.",
    author_name: "GovTechSpecialist",
    category: "Tech",
    idea_type: "proposal",
    status: "active"
  },
  {
    title: "Best programming language for beginners?",
    description: "With so many programming languages available, which one should newcomers learn first? Python for its simplicity? JavaScript for web development? Java for structure? Let's help guide the next generation of developers.",
    author_name: "CodeMentor",
    category: "Tech",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Municipal Broadband Internet Service",
    description: "Launch city-owned broadband internet service to ensure affordable, high-speed internet access for all residents. This public utility model would reduce digital divide, lower costs through competition, and provide reliable service to underserved areas.",
    author_name: "DigitalEquity",
    category: "Tech",
    idea_type: "proposal",
    status: "active"
  },

  // Environment
  {
    title: "Should plastic bags be banned completely?",
    description: "Many cities have implemented plastic bag bans to reduce environmental impact. While this helps reduce waste, it can inconvenience shoppers and affect low-income families. Should we ban plastic bags entirely or find alternative solutions?",
    author_name: "EcoWarrior",
    category: "Environment",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Urban Tree Canopy Expansion Program",
    description: "Increase urban tree coverage by 30% over 10 years through strategic planting, maintenance, and protection programs. This initiative would improve air quality, reduce urban heat islands, enhance property values, and create green jobs while building community engagement.",
    author_name: "TreeAdvocate",
    category: "Environment",
    idea_type: "proposal",
    status: "active"
  },
  {
    title: "Zero Waste Community Initiative",
    description: "Implement comprehensive zero waste program including mandatory composting, expanded recycling, repair cafes, tool libraries, and bulk buying cooperatives. Goal is 90% waste diversion from landfills within 5 years through community education and infrastructure investment.",
    author_name: "WasteReduction",
    category: "Environment",
    idea_type: "proposal",
    status: "active"
  },
  {
    title: "Best renewable energy source?",
    description: "As we transition away from fossil fuels, which renewable energy source offers the best combination of efficiency, cost-effectiveness, and environmental impact? Solar, wind, hydro, or something else?",
    author_name: "CleanEnergyFan",
    category: "Environment",
    idea_type: "poll",
    status: "active"
  },

  // Education
  {
    title: "Should financial literacy be mandatory in schools?",
    description: "Many young adults graduate without basic financial knowledge like budgeting, investing, or understanding credit. Should financial literacy be a required course in high school curriculum to better prepare students for adult life?",
    author_name: "EducationReformer",
    category: "Education",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Community Learning Hub Network",
    description: "Establish neighborhood learning hubs offering free tutoring, adult education, digital literacy training, and skill workshops. These spaces would be staffed by volunteers and professionals, creating accessible education opportunities and strengthening community connections.",
    author_name: "LifelongLearning",
    category: "Education",
    idea_type: "proposal",
    status: "active"
  },
  {
    title: "Student Loan Forgiveness Program",
    description: "Create local student loan forgiveness program for graduates who commit to working in public service, education, or healthcare within the community for 5 years. This would attract talent, reduce brain drain, and support essential services.",
    author_name: "StudentAdvocate",
    category: "Education",
    idea_type: "proposal",
    status: "active"
  },

  // Healthcare
  {
    title: "Should healthcare be completely free?",
    description: "Universal healthcare is a major policy debate. While free healthcare ensures everyone gets treatment, it requires significant public funding and may face resource constraints. What's the best approach for healthcare access?",
    author_name: "HealthAdvocate",
    category: "Healthcare",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Community Health Worker Program",
    description: "Train and deploy community health workers to provide basic health education, preventive care coordination, and social support in underserved neighborhoods. This program would improve health outcomes, reduce emergency room visits, and create local employment opportunities.",
    author_name: "PublicHealth",
    category: "Healthcare",
    idea_type: "proposal",
    status: "active"
  },
  {
    title: "Mobile Health Clinic Network",
    description: "Launch fleet of mobile health clinics providing primary care, vaccinations, and health screenings in rural and underserved urban areas. This would improve healthcare access, reduce travel barriers, and provide early intervention for chronic conditions.",
    author_name: "HealthcareAccess",
    category: "Healthcare",
    idea_type: "proposal",
    status: "active"
  },

  // Transportation
  {
    title: "Should cities be car-free?",
    description: "Some European cities have implemented car-free zones or entire car-free city centers. This reduces pollution and creates more livable spaces, but can impact businesses and accessibility. Should cities prioritize pedestrians and cyclists over cars?",
    author_name: "UrbanPlanner",
    category: "Transportation",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Electric Bus Fleet Conversion",
    description: "Replace entire municipal bus fleet with electric vehicles over 7 years. Include charging infrastructure, driver training, and maintenance facility upgrades. This would reduce emissions, lower operating costs, and improve air quality while maintaining reliable public transit.",
    author_name: "TransitInnovator",
    category: "Transportation",
    idea_type: "proposal",
    status: "active"
  },
  {
    title: "Bike Share Expansion Program",
    description: "Expand bike share system to cover all neighborhoods with stations every 3 blocks. Include e-bikes, adaptive bikes for disabilities, and integration with public transit. This would provide affordable transportation, reduce traffic, and promote healthy lifestyles.",
    author_name: "CyclingAdvocate",
    category: "Transportation",
    idea_type: "proposal",
    status: "active"
  },
  {
    title: "Best mode of transportation for cities?",
    description: "Urban transportation faces challenges of efficiency, sustainability, and accessibility. What's the ideal primary mode of transportation for modern cities? Bikes, public transit, electric cars, or walking?",
    author_name: "MobilityExpert",
    category: "Transportation",
    idea_type: "poll",
    status: "active"
  },

  // Social Issues
  {
    title: "Should social media have age restrictions?",
    description: "Growing concerns about social media's impact on youth mental health have sparked debates about age restrictions. Should platforms be limited to users 16+ or 18+, or should parental controls be sufficient?",
    author_name: "DigitalWellness",
    category: "Social",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Affordable Housing Trust Fund",
    description: "Establish dedicated housing trust fund using real estate transfer taxes and development fees to create and preserve affordable housing. Fund would support first-time homebuyer assistance, rental subsidies, and affordable housing development projects.",
    author_name: "HousingAdvocate",
    category: "Social",
    idea_type: "proposal",
    status: "active"
  },
  {
    title: "Community Mediation Program",
    description: "Create neighborhood mediation centers offering free conflict resolution services for disputes between neighbors, landlords/tenants, and small businesses. This would reduce court costs, improve community relations, and provide peaceful dispute resolution.",
    author_name: "CommunityBuilder",
    category: "Social",
    idea_type: "proposal",
    status: "active"
  },

  // Economy
  {
    title: "Should there be a maximum wage ratio?",
    description: "Some propose limiting CEO pay to a multiple of median worker wages (like 50:1 or 100:1). This could reduce inequality but might affect company competitiveness. Should there be legal limits on executive compensation ratios?",
    author_name: "EconomicJustice",
    category: "Economy",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Local Business Incubator Program",
    description: "Launch comprehensive small business support program offering mentorship, shared workspace, micro-loans, and regulatory guidance. Focus on supporting minority-owned businesses and innovative startups to strengthen local economy and create jobs.",
    author_name: "SmallBizChampion",
    category: "Economy",
    idea_type: "proposal",
    status: "active"
  },
  {
    title: "Community Currency System",
    description: "Implement local currency program encouraging spending at local businesses. Residents earn community dollars through volunteering and civic participation, which can be spent at participating merchants. This keeps money circulating locally and builds community engagement.",
    author_name: "LocalEconomy",
    category: "Economy",
    idea_type: "proposal",
    status: "active"
  },

  // Sports & Recreation
  {
    title: "Best Olympic sport to watch?",
    description: "The Olympics showcase incredible athletic achievements across dozens of sports. Which Olympic sport provides the most exciting viewing experience? Swimming, gymnastics, track and field, or something else?",
    author_name: "OlympicFan",
    category: "Sports",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Community Sports Complex Development",
    description: "Build multi-use sports complex with indoor courts, outdoor fields, swimming pool, and fitness facilities. Include programming for all ages and abilities, with subsidized access for low-income families. This would promote health, youth development, and community gathering.",
    author_name: "RecreationDirector",
    category: "Sports",
    idea_type: "proposal",
    status: "active"
  },
  {
    title: "Should esports be in the Olympics?",
    description: "Competitive gaming has massive global audiences and requires skill, strategy, and training like traditional sports. Should esports be included in the Olympic Games, or should the Olympics remain focused on physical sports?",
    author_name: "GamingEnthusiast",
    category: "Sports",
    idea_type: "poll",
    status: "active"
  },

  // Travel
  {
    title: "Best travel destination for families?",
    description: "Planning family vacations requires balancing fun for kids and adults, safety, affordability, and educational value. What destination offers the best overall family travel experience?",
    author_name: "FamilyTraveler",
    category: "Travel",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Should airplane seats have more legroom?",
    description: "Airline seat sizes have decreased over decades while passengers have gotten taller. Should there be regulations requiring minimum seat pitch and width for passenger comfort and safety?",
    author_name: "FrequentFlyer",
    category: "Travel",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Sustainable Tourism Initiative",
    description: "Develop eco-tourism program promoting local attractions while protecting natural resources. Include visitor education, environmental impact monitoring, local business partnerships, and conservation funding. Goal is to balance economic benefits with environmental protection.",
    author_name: "EcoTourism",
    category: "Travel",
    idea_type: "proposal",
    status: "active"
  },

  // Science
  {
    title: "Should we prioritize Mars exploration or ocean exploration?",
    description: "Both space and ocean exploration offer scientific discoveries and technological advancement. With limited resources, should we focus on exploring Mars and space, or the largely unexplored depths of our own oceans?",
    author_name: "ScienceExplorer",
    category: "Science",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Community Science Education Center",
    description: "Establish hands-on science center with interactive exhibits, maker spaces, planetarium, and laboratory facilities. Offer STEM programs for all ages, teacher training, and public science events to increase scientific literacy and inspire future scientists.",
    author_name: "STEMEducator",
    category: "Science",
    idea_type: "proposal",
    status: "active"
  },
  {
    title: "Best scientific discovery of the 21st century?",
    description: "This century has brought incredible scientific breakthroughs from CRISPR gene editing to gravitational wave detection to COVID vaccines. Which discovery has had or will have the greatest impact on humanity?",
    author_name: "ScienceHistory",
    category: "Science",
    idea_type: "poll",
    status: "active"
  },

  // Products & Reviews
  {
    title: "Should products have mandatory repairability scores?",
    description: "France requires repairability scores on electronics to help consumers choose products that can be easily repaired. Should this be adopted globally to reduce electronic waste and promote sustainable consumption?",
    author_name: "SustainableConsumer",
    category: "Products",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Best smartphone feature innovation?",
    description: "Smartphones have evolved rapidly with features like facial recognition, multiple cameras, wireless charging, and foldable screens. Which innovation has been most valuable for users?",
    author_name: "TechReviewer",
    category: "Products",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Community Tool Library Program",
    description: "Create neighborhood tool libraries where residents can borrow tools, equipment, and household items instead of purchasing. This reduces costs for families, minimizes waste, builds community connections, and promotes sharing economy principles.",
    author_name: "SharingEconomy",
    category: "Products",
    idea_type: "proposal",
    status: "active"
  },

  // Life & Lifestyle
  {
    title: "Should remote work be a legal right?",
    description: "The pandemic proved many jobs can be done remotely, offering better work-life balance and reduced commuting. Should employees have a legal right to request remote work for suitable positions?",
    author_name: "RemoteWorker",
    category: "Life",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Best morning routine for productivity?",
    description: "How you start your day can impact your entire day's productivity and mood. What's the most effective morning routine? Exercise, meditation, journaling, or something else?",
    author_name: "ProductivityGuru",
    category: "Life",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Community Wellness Program",
    description: "Launch comprehensive wellness initiative including fitness classes, nutrition education, mental health support, and stress management workshops. Partner with local healthcare providers and fitness professionals to create accessible, affordable wellness resources for all residents.",
    author_name: "WellnessCoordinator",
    category: "Life",
    idea_type: "proposal",
    status: "active"
  },

  // Additional Fun Ideas
  {
    title: "Is water wet?",
    description: "This philosophical question has sparked countless debates. Water makes things wet, but is water itself wet? Or is wetness a property that water gives to other things? Let's settle this scientific and philosophical puzzle!",
    author_name: "PhilosophicalThinker",
    category: "Fun",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Should pineapple be allowed on pizza?",
    description: "The great pineapple pizza debate divides nations! Hawaiian pizza lovers argue the sweet and savory combination is perfect, while traditionalists say fruit has no place on pizza. Where do you stand?",
    author_name: "PizzaDebater",
    category: "Food",
    idea_type: "poll",
    status: "active"
  },
  {
    title: "Best way to load a dishwasher?",
    description: "Every household has strong opinions about the 'correct' way to load a dishwasher. Plates in front or back? Forks up or down? Let's find the most efficient and effective dishwasher loading strategy!",
    author_name: "HouseholdEfficiency",
    category: "Life",
    idea_type: "poll",
    status: "active"
  }
];

// Function to add dummy data
async function addDummyIdeas() {
  console.log('Starting to add dummy ideas...');
  
  try {
    // Add ideas in batches to avoid overwhelming the database
    const batchSize = 10;
    for (let i = 0; i < dummyIdeas.length; i += batchSize) {
      const batch = dummyIdeas.slice(i, i + batchSize);
      
      console.log(`Adding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(dummyIdeas.length / batchSize)}...`);
      
      const { data, error } = await supabase
        .from('proposals')
        .insert(batch.map(idea => ({
          ...idea,
          votes_up: Math.floor(Math.random() * 50), // Random votes for realism
          votes_down: Math.floor(Math.random() * 20),
          votes_yes: Math.floor(Math.random() * 40),
          votes_no: Math.floor(Math.random() * 30),
          likes: Math.floor(Math.random() * 60),
          user_id: null // Will be set to a random UUID by the database
        })));

      if (error) {
        console.error('Error adding batch:', error);
        continue;
      }

      console.log(`Successfully added ${batch.length} ideas`);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('✅ Successfully added all dummy ideas!');
    console.log(`Total ideas added: ${dummyIdeas.length}`);
    console.log('Categories covered:', [...new Set(dummyIdeas.map(idea => idea.category))].join(', '));
    console.log('Types included:', [...new Set(dummyIdeas.map(idea => idea.idea_type))].join(', '));
    
  } catch (error) {
    console.error('❌ Error adding dummy ideas:', error);
  }
}

// Run the function
addDummyIdeas();