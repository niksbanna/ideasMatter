// Chatbot service with predefined responses and AI integration
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface PredefinedQuestion {
  id: string;
  question: string;
  category: 'getting-started' | 'features' | 'how-it-works' | 'account';
  icon: string;
}

// Predefined questions for new users
export const PREDEFINED_QUESTIONS: PredefinedQuestion[] = [
  {
    id: 'what-is-ideasmatter',
    question: 'What is IdeasMatter?',
    category: 'getting-started',
    icon: '🏛️'
  },
  {
    id: 'guest-access',
    question: 'Can I browse without creating an account?',
    category: 'getting-started',
    icon: '👁️'
  },
  {
    id: 'how-to-submit-idea',
    question: 'How do I submit a policy idea?',
    category: 'getting-started',
    icon: '💡'
  },
  {
    id: 'ai-policy-generation',
    question: 'How does AI policy generation work?',
    category: 'features',
    icon: '🤖'
  },
  {
    id: 'voting-system',
    question: 'How does the voting system work?',
    category: 'how-it-works',
    icon: '🗳️'
  },
  {
    id: 'audio-video-features',
    question: 'What are the audio and video features?',
    category: 'features',
    icon: '🎥'
  },
  {
    id: 'account-benefits',
    question: 'What are the benefits of creating an account?',
    category: 'account',
    icon: '👤'
  },
  {
    id: 'proposal-types',
    question: 'What types of ideas can I share?',
    category: 'getting-started',
    icon: '📋'
  },
  {
    id: 'community-safety',
    question: 'How do you keep the community safe?',
    category: 'how-it-works',
    icon: '🛡️'
  },
  {
    id: 'sharing-features',
    question: 'Can I share ideas on social media?',
    category: 'features',
    icon: '📱'
  }
];

// Predefined responses for common questions
const PREDEFINED_RESPONSES: Record<string, string> = {
  'what-is-ideasmatter': `IdeasMatter is an AI-powered civic engagement platform that transforms your ideas into structured proposals and enables community discussion. Here's what makes us special:

**🏛️ Democratic Participation Made Easy**
• Convert simple ideas into comprehensive policy drafts using AI
• Enable community voting and discussion on all proposals
• Provide audio and video explanations for accessibility
• Create a transparent, accessible platform for civic participation

**🌍 Open Access Philosophy**
• Browse and read all ideas without creating an account
• Explore proposals, vote counts, and discussions freely
• Sign up only when you're ready to participate actively

**🤖 AI-Powered Features**
• Google Gemini AI transforms ideas into structured policy documents
• ElevenLabs generates audio summaries for accessibility
• Tavus creates explainer videos for complex policies
• AI content moderation ensures community safety

Our mission is to make democracy more accessible and give every voice a chance to shape public policy, whether you're sharing a fun poll or a serious policy proposal.`,

  'guest-access': `Absolutely! IdeasMatter believes in "No Login? No Problem!" - you can explore freely without creating an account.

**👁️ What You Can Do as a Guest:**
• **Browse all ideas** - Read proposals, polls, and community discussions
• **View AI-generated content** - Access full policy drafts, audio summaries, and videos
• **See community engagement** - View vote counts, comments, and popularity trends
• **Search and filter** - Find ideas by category, type, or keywords
• **Share content** - Share interesting proposals on social media
• **Explore categories** - From civic policies to fun polls like "Is cereal soup?"

**🚀 When You're Ready to Engage:**
• **Vote** on proposals and polls you care about
• **Comment** and join meaningful discussions
• **Submit** your own ideas and policy proposals
• **Save** interesting ideas for later review
• **Report** inappropriate content to keep the community safe

**💡 Why This Approach?**
We believe you should be able to explore and discover ideas freely. When you find something that resonates with you or want to contribute your own thoughts, that's the perfect time to create an account and join the conversation!

Start exploring now - no commitment required!`,

  'how-to-submit-idea': `Submitting ideas on IdeasMatter is simple and flexible! We support everything from fun polls to serious policy proposals.

**📝 Step-by-Step Process:**

1. **Sign up** for a free account (required for submissions)
2. **Click "Share Idea"** in the navigation menu
3. **Choose your idea type:**
   • **Community Poll/Idea** - Questions, opinions, fun discussions
   • **AI Drafted Proposal** - Structured policy documents with AI assistance

4. **Select a category** (Civic, Tech, Fun, Life, Environment, etc.)
5. **Write your title** - Be clear and engaging
6. **Describe your idea** - Provide context and details
7. **Submit** - Our AI will validate content and generate drafts if needed

**🤖 AI Content Validation:**
Every submission goes through AI review to ensure:
• Respectful and constructive content
• Community-appropriate discussions
• Meaningful contributions to discourse
• Safe environment for all participants

**📋 Examples of Great Ideas:**
• **Fun Polls:** "Is cereal soup?" "Best pizza topping?"
• **Civic Proposals:** "Renewable energy incentives" "Public transit improvements"
• **Tech Ideas:** "Digital privacy policies" "AI regulation frameworks"
• **Social Topics:** "4-day work week policies" "Community wellness programs"

**✨ What Happens Next:**
• **Polls** go live immediately for community voting
• **Proposals** get AI-generated policy structure with problem analysis, solutions, and implementation plans
• Your idea appears in the Explorer for community engagement
• You can track votes, comments, and engagement in your dashboard

Ready to share your ideas with the world?`,

  'ai-policy-generation': `Our AI policy generation is powered by Google Gemini and creates professional, structured policy documents from your ideas.

**🤖 How It Works:**

**Step 1: Idea Analysis**
• AI analyzes your title and description
• Identifies key themes, objectives, and scope
• Determines appropriate policy framework

**Step 2: Structure Generation**
• **Problem Statement** - Clear analysis of the issue and its impact
• **Proposed Solution** - Detailed implementation approach and methodology
• **Expected Impact** - Benefits, outcomes, and measurable results
• **Implementation Plan** - Step-by-step execution strategy with timeline

**Step 3: Professional Language**
• Converts casual ideas into policy-appropriate language
• Ensures clarity and accessibility for all readers
• Maintains your original intent while adding structure

**🎯 What Makes Our AI Special:**
• **Context-Aware** - Understands different policy domains (healthcare, environment, etc.)
• **Scalable** - Adapts to local, state, or national policy levels
• **Accessible** - Creates content that both policymakers and citizens can understand
• **Comprehensive** - Covers all aspects from problem to implementation

**📊 Quality Assurance:**
• AI validation ensures content meets community standards
• Structured format makes proposals easy to evaluate
• Professional presentation increases credibility
• Consistent quality across all generated content

**🎥 Enhanced Accessibility:**
• **Audio summaries** using ElevenLabs text-to-speech
• **Video explanations** with Tavus AI video generation
• **Social sharing** with platform-optimized content

**💡 Example Transformation:**
**Your Input:** "We need better bike lanes in the city"
**AI Output:** Complete policy proposal with traffic analysis, safety benefits, implementation phases, budget considerations, and community impact assessment.

The AI ensures your ideas are presented in a format that can actually influence policy decisions!`,

  'voting-system': `IdeasMatter features a flexible voting system that adapts to different types of content and encourages democratic participation.

**🗳️ How Voting Works:**

**For Policy Proposals:**
• **👍 Upvote** - Support the proposal
• **👎 Downvote** - Oppose the proposal
• **Score Calculation** - Upvotes minus downvotes
• **Real-time Updates** - Vote counts update immediately

**For Community Polls:**
• **✅ Yes** - Agree with the statement/question
• **❌ No** - Disagree with the statement/question
• **❤️ Like** - General appreciation or interest
• **Percentage Display** - Visual breakdown of yes/no responses

**🌍 Accessibility Features:**
• **Guest Viewing** - Anyone can see vote counts and trends
• **Account Required** - Sign in to cast your vote
• **One Vote Per User** - Fair and democratic process
• **Vote Changes** - Update your vote if you change your mind

**📊 Voting Analytics:**
• **Real-time Counts** - See immediate community response
• **Trending Algorithm** - Popular content rises to the top
• **Score-based Ranking** - Best ideas get more visibility
• **Historical Tracking** - Watch how opinions evolve over time

**🔒 Security & Fairness:**
• **User Authentication** - Prevents vote manipulation
• **Database Integrity** - Secure vote storage and counting
• **Transparent Process** - All votes are visible and verifiable
• **Future Blockchain** - Working on Algorand integration for immutable records

**💬 Beyond Voting:**
• **Comments** - Detailed discussions on proposals
• **Saves** - Bookmark ideas you want to revisit
• **Sharing** - Spread awareness of important ideas
• **Reporting** - Keep the community safe and respectful

**🎯 Impact of Your Vote:**
• Helps surface the best ideas to the top
• Provides feedback to idea creators
• Influences community discussion priorities
• Demonstrates public support for policy changes

Every vote matters in shaping the conversation and identifying ideas with real potential for positive change!`,

  'audio-video-features': `IdeasMatter offers cutting-edge multimedia features to make policy proposals accessible to everyone, regardless of how they prefer to consume content.

**🔊 AI-Generated Audio Summaries:**

**Powered by ElevenLabs Technology:**
• **Natural Voice** - High-quality, human-like speech synthesis
• **Policy Narration** - Complete audio versions of AI-generated proposals
• **Instant Playback** - Click to listen immediately
• **Smart Caching** - Faster loading for frequently accessed content

**Accessibility Benefits:**
• **Visual Impairment Support** - Screen reader alternative
• **Multitasking Friendly** - Listen while doing other activities
• **Learning Preferences** - Perfect for auditory learners
• **Language Processing** - Easier comprehension for complex policies

**🎥 AI-Generated Explainer Videos:**

**Powered by Tavus Technology:**
• **30-Second Summaries** - Quick, digestible policy overviews
• **Visual Storytelling** - Complex ideas made simple
• **Professional Quality** - Broadcast-ready video content
• **Shareable Format** - Perfect for social media distribution

**Video Features:**
• **Key Highlights** - Focus on most important policy points
• **Clear Narration** - Easy-to-understand explanations
• **Visual Elements** - Graphics and text to support understanding
• **Mobile Optimized** - Great viewing experience on any device

**🚀 How to Access:**

**For Audio:**
• Visit any AI-generated proposal
• Click the "🔊 Generate Audio" or "🔊 Listen" button
• Enjoy instant playback with full media controls
• Audio is cached for future instant access

**For Video:**
• Click "🎥 Watch Explainer" on proposal pages
• AI generates a custom script for the specific policy
• Video creation takes 1-2 minutes
• Watch in full-screen modal with controls

**💡 Why This Matters:**
• **Inclusive Democracy** - Makes civic engagement accessible to everyone
• **Busy Lifestyles** - Consume content on-the-go
• **Better Understanding** - Multiple formats improve comprehension
• **Wider Reach** - Share policy ideas in engaging formats

**🎯 Perfect For:**
• **Commuting** - Listen to proposals during travel
• **Social Sharing** - Share videos to raise awareness
• **Accessibility Needs** - Alternative content formats
• **Quick Reviews** - Fast understanding of complex policies

These features ensure that important policy discussions are accessible to everyone, regardless of their preferred way of learning or any accessibility needs they may have.`,

  'account-benefits': `Creating an account on IdeasMatter unlocks the full power of democratic participation while keeping exploration completely free for everyone.

**👁️ Without an Account (Guest Access):**
• **Browse Freely** - Read all ideas, proposals, and discussions
• **View AI Content** - Access policy drafts, audio, and video content
• **See Engagement** - View vote counts, comments, and trends
• **Search & Filter** - Find ideas by category, type, or keywords
• **Share Content** - Share interesting proposals on social media

**🚀 With a Free Account (Full Participation):**

**📝 Content Creation:**
• **Submit Ideas** - Share polls, questions, and policy proposals
• **AI Assistance** - Get professional policy drafts generated automatically
• **Multiple Categories** - Post in Civic, Tech, Fun, Life, and more
• **Content Validation** - AI ensures your ideas meet community standards

**🗳️ Democratic Participation:**
• **Vote on Everything** - Support or oppose proposals and polls
• **Comment & Discuss** - Join meaningful conversations
• **Save for Later** - Bookmark ideas you want to revisit
• **Track Your Impact** - See how your ideas perform

**📊 Personal Dashboard:**
• **Your Submissions** - Track all your ideas and their performance
• **Engagement Stats** - See votes, comments, and community response
• **Saved Ideas** - Quick access to bookmarked content
• **Activity History** - Review your participation over time

**🛡️ Community Safety:**
• **Report Content** - Help keep the community safe and respectful
• **Verified Actions** - All votes and comments are authenticated
• **Trusted Environment** - Participate in a moderated, safe space

**🎯 Why Create an Account?**

**Immediate Benefits:**
• **Voice Your Opinion** - Every vote and comment matters
• **Shape Discussions** - Influence what ideas get attention
• **Build Community** - Connect with like-minded citizens
• **Create Change** - Submit ideas that could become real policies

**Long-term Value:**
• **Civic Engagement Profile** - Build your participation history
• **Policy Influence** - See your ideas gain community support
• **Democratic Process** - Be part of transparent, accessible governance
• **Personal Growth** - Develop your policy thinking and civic awareness

**🔒 Privacy & Security:**
• **Email Verification** - Secure account creation process
• **Data Protection** - Your information is safe and private
• **No Spam** - We respect your inbox and privacy
• **Account Control** - Manage your profile and participation

**💡 Getting Started:**
1. **Explore First** - Browse ideas to get familiar with the platform
2. **Find Your Interest** - Discover topics that matter to you
3. **Sign Up** - Quick, free registration when you're ready
4. **Start Participating** - Vote, comment, and share your ideas

**The Bottom Line:**
Accounts are completely optional for exploration, but essential for participation. We believe in letting you discover the value of our community before asking for any commitment. When you're ready to have your voice heard, we're here to amplify it!`,

  'proposal-types': `IdeasMatter welcomes ALL types of ideas - from silly questions to serious policy proposals. Our platform is designed to handle the full spectrum of human curiosity and civic engagement.

**🎭 Two Main Types:**

**1. 📊 Community Polls & Ideas**
*Perfect for questions, opinions, and fun discussions*

**Examples:**
• **Fun Questions:** "Is cereal soup?" "What's the best pizza topping?"
• **Social Topics:** "Should we have 4-day work weeks?" "Is remote work better?"
• **Lifestyle Choices:** "Morning person or night owl?" "Coffee vs. tea?"
• **Current Events:** "What's your take on the latest tech trend?"
• **Personal Experiences:** "Best travel destination?" "Favorite productivity tip?"

**Features:**
• **Yes/No/Like Voting** - Multiple ways to express opinion
• **Quick Engagement** - Easy to vote and comment
• **Visual Results** - See percentage breakdowns
• **Social Sharing** - Perfect for spreading fun discussions

**2. 🏛️ AI-Drafted Proposals**
*Structured policy documents with AI assistance*

**Examples:**
• **Environment:** "Carbon tax incentives" "Renewable energy programs"
• **Education:** "Student loan reform" "Digital literacy requirements"
• **Healthcare:** "Mental health coverage" "Preventive care initiatives"
• **Transportation:** "Public transit expansion" "Electric vehicle incentives"
• **Technology:** "AI regulation frameworks" "Digital privacy laws"
• **Social Policy:** "Affordable housing programs" "Community wellness initiatives"

**Features:**
• **AI Structure** - Professional policy format
• **Comprehensive Analysis** - Problem, solution, impact, implementation
• **Audio/Video** - Multimedia explanations
• **Up/Down Voting** - Support or oppose the proposal

**🌈 Categories We Support:**

**Civic & Policy:**
• Government, law, public policy, civic engagement

**Technology:**
• AI, digital rights, innovation, tech regulation

**Environment:**
• Climate, sustainability, conservation, green energy

**Social & Community:**
• Relationships, community building, social issues

**Fun & Entertainment:**
• Games, movies, music, pop culture, humor

**Life & Lifestyle:**
• Health, productivity, personal development, hobbies

**Education:**
• Learning, schools, skills, knowledge sharing

**Food & Dining:**
• Recipes, restaurants, food culture, nutrition

**Sports & Recreation:**
• Athletics, outdoor activities, fitness, games

**Travel & Places:**
• Destinations, experiences, local recommendations

**Products & Reviews:**
• Technology, services, recommendations, comparisons

**Science & Research:**
• Discoveries, theories, academic discussions

**🎯 What Makes a Great Idea:**

**For Polls:**
• **Clear Question** - Easy to understand and answer
• **Interesting Topic** - Something people want to discuss
• **Multiple Perspectives** - Room for different viewpoints
• **Engaging Context** - Background that sparks curiosity

**For Proposals:**
• **Real Problem** - Addresses an actual issue or need
• **Clear Vision** - Specific idea for improvement
• **Practical Scope** - Achievable and realistic
• **Community Benefit** - Positive impact on others

**🚀 Getting Started:**
• **Browse Examples** - See what others have shared
• **Start Simple** - Begin with a question or opinion
• **Build Confidence** - Try different types of content
• **Engage First** - Vote and comment before submitting
• **Think Big** - Don't be afraid to tackle serious issues

**💡 Remember:**
There's no such thing as a "wrong" idea on IdeasMatter. Whether you're wondering about breakfast foods or proposing the next great policy reform, every contribution adds value to our diverse community of thinkers and citizens.

What idea will you share with the world?`,

  'community-safety': `IdeasMatter takes community safety seriously while maintaining an open, welcoming environment for all types of ideas and discussions.

**🛡️ Multi-Layer Safety System:**

**1. 🤖 AI Content Validation**
*Every submission is automatically reviewed*

**What It Checks:**
• **Respectful Language** - No hate speech or personal attacks
• **Appropriate Content** - Community-safe discussions
• **Constructive Ideas** - Meaningful contributions to discourse
• **Spam Prevention** - Filters out low-quality or promotional content

**Validation Process:**
• **Instant Review** - AI analyzes content before publication
• **Scoring System** - 0-100 quality score for each submission
• **Lenient Standards** - Only blocks clearly harmful content (90%+ confidence)
• **Human-like Judgment** - Allows silly, fun, or unusual ideas

**2. 👥 Community Reporting**
*Users help maintain a safe environment*

**How It Works:**
• **Report Button** - Available on every idea and comment
• **Quick Process** - Simple form to explain concerns
• **AI Moderation** - Reported content gets immediate AI review
• **Swift Action** - Harmful content is hidden automatically

**What You Can Report:**
• **Inappropriate Content** - Offensive or harmful material
• **Spam** - Promotional or irrelevant content
• **Harassment** - Personal attacks or bullying
• **Misinformation** - Dangerous false information

**3. 🔒 Account-Based Security**
*Authentication prevents abuse*

**Security Features:**
• **Email Verification** - Confirmed accounts only
• **One Vote Per User** - Prevents manipulation
• **User Accountability** - Actions tied to verified accounts
• **Moderation Tools** - Ability to restrict problematic users

**4. 📊 Transparent Moderation**
*Open process with clear guidelines*

**Our Standards:**
• **Respectful Discourse** - Disagree with ideas, not people
• **Constructive Engagement** - Focus on improving discussions
• **Inclusive Environment** - Welcome diverse perspectives
• **Educational Value** - Encourage learning and growth

**What We Allow:**
• **Silly Questions** - "Is cereal soup?" is perfectly fine!
• **Controversial Topics** - Respectful debate is encouraged
• **Personal Opinions** - All viewpoints welcome
• **Creative Ideas** - Unusual or unconventional thinking

**What We Don't Allow:**
• **Hate Speech** - Targeting groups or individuals
• **Explicit Content** - Sexual or graphic material
• **Violence** - Threats or promotion of harm
• **Spam** - Irrelevant or promotional content
• **Dangerous Misinformation** - Health or safety risks

**🚀 Positive Community Culture:**

**We Encourage:**
• **Curiosity** - Ask questions, explore ideas
• **Empathy** - Consider different perspectives
• **Constructive Feedback** - Help improve ideas
• **Civic Engagement** - Participate in democracy

**Community Guidelines:**
• **Be Kind** - Treat others with respect
• **Stay Curious** - Embrace different viewpoints
• **Think Critically** - Evaluate ideas on their merits
• **Have Fun** - Enjoy the process of discovery

**🎯 Reporting Process:**

**If You See Something Concerning:**
1. **Click Report** - Available on all content
2. **Explain the Issue** - Brief description of the problem
3. **Submit** - AI reviews immediately
4. **Action Taken** - Harmful content is hidden quickly

**What Happens Next:**
• **AI Analysis** - Content reviewed against safety standards
• **Immediate Action** - Harmful content hidden from public view
• **User Notification** - Reporter informed of action taken
• **Appeal Process** - Content creators can request review

**💡 Our Philosophy:**
We believe in creating a space where people can explore ideas freely while feeling safe and respected. Our goal is to foster curiosity, learning, and civic engagement in an environment where everyone can participate confidently.

**The Result:**
A vibrant community where you can ask "Is cereal soup?" and propose serious policy reforms with equal confidence that you'll be treated with respect and engage in meaningful discussion.

Help us maintain this positive environment by reporting content that doesn't meet our community standards!`,

  'sharing-features': `IdeasMatter makes it easy to share compelling ideas and policy proposals across all major social media platforms with AI-optimized content for maximum engagement.

**📱 Smart Social Sharing:**

**🤖 AI-Generated Content**
*Platform-optimized posts for maximum impact*

**LinkedIn (Professional Network):**
• **Thought Leadership** - Professional, discussion-sparking content
• **Policy Focus** - Emphasizes governance and civic engagement
• **Network Engagement** - Encourages professional discourse
• **Hashtag Strategy** - Industry-relevant tags for visibility

**Twitter/X (Viral Reach):**
• **Concise Impact** - Punchy, shareable content under character limits
• **Trending Tags** - Current hashtags for maximum visibility
• **Call-to-Action** - Encourages clicks and engagement
• **Emoji Integration** - Visual appeal for social feeds

**Instagram (Visual Storytelling):**
• **Inspiring Content** - Community-focused, motivational messaging
• **Visual Appeal** - Content designed for image-based sharing
• **Story-Friendly** - Perfect for Instagram Stories and posts
• **Lifestyle Integration** - Connects policy to personal values

**🎯 How It Works:**

**1. Click Share Button**
• Available on every proposal and poll
• No account required - guests can share too
• Instant content generation

**2. AI Creates Custom Content**
• **Analyzes the idea** - Understands key themes and impact
• **Generates platform-specific posts** - Optimized for each social network
• **Creates hashtag strategies** - Relevant, trending tags
• **Adapts tone and style** - Professional for LinkedIn, casual for Instagram

**3. Choose Your Platform**
• **Direct Sharing** - Opens platform with pre-filled content
• **Copy to Clipboard** - Manual sharing option
• **Preview Content** - See exactly what will be posted

**📊 Content Examples:**

**For a Policy Proposal:**
• **LinkedIn:** "Exploring innovative renewable energy incentives with this thoughtful policy proposal. What's your perspective on sustainable energy solutions? #PolicyInnovation #CleanEnergy #Sustainability"
• **Twitter:** "💡 Fresh renewable energy policy idea! Join the conversation about sustainable solutions 🌱 #CleanEnergy #Policy #Sustainability"
• **Instagram:** "🌍 Making democracy accessible! Check out this environmental policy proposal. Every voice matters in shaping our future! 💪✨ #PolicyProposal #Environment #YourVoiceMatters"

**For a Fun Poll:**
• **LinkedIn:** "Interesting community discussion: Is cereal soup? Sometimes the most engaging conversations start with simple questions. #CommunityEngagement #FoodCulture"
• **Twitter:** "🥣 The age-old question: Is cereal soup? What do you think? 🤔 #CerealDebate #FoodThoughts #Community"
• **Instagram:** "🥣✨ The ultimate breakfast debate! Is cereal soup? Join the fun discussion and share your thoughts! #BreakfastDebate #FoodFun #Community"

**🚀 Advanced Features:**

**Smart Hashtag Generation:**
• **Category-Specific** - Relevant to the idea's topic
• **Trending Analysis** - Current popular hashtags
• **Platform Optimization** - Different strategies per platform
• **Engagement Focus** - Tags that drive interaction

**Content Adaptation:**
• **Tone Matching** - Professional vs. casual based on platform
• **Length Optimization** - Fits platform character limits
• **Visual Cues** - Emojis and formatting for engagement
• **Call-to-Action** - Encourages clicks and participation

**🎯 Why Share Ideas:**

**Spread Awareness:**
• **Important Policies** - Get more eyes on crucial issues
• **Fun Discussions** - Bring joy and engagement to your network
• **Civic Participation** - Encourage democratic engagement
• **Community Building** - Connect like-minded people

**Drive Engagement:**
• **More Votes** - Increased participation on ideas you support
• **Better Discussions** - Diverse perspectives improve conversations
• **Policy Impact** - Popular ideas get more attention
• **Social Change** - Viral ideas can influence real policy

**💡 Best Practices:**

**Choose the Right Platform:**
• **LinkedIn** - Professional policy discussions, industry-relevant topics
• **Twitter** - Quick engagement, trending topics, viral potential
• **Instagram** - Visual storytelling, lifestyle connections, inspiration

**Timing Matters:**
• **LinkedIn** - Business hours, weekdays
• **Twitter** - Peak engagement times, trending moments
• **Instagram** - Evening hours, weekend lifestyle content

**Engage After Sharing:**
• **Respond to Comments** - Keep the conversation going
• **Share Updates** - Post about vote results or new developments
• **Cross-Platform** - Share the same idea differently on each platform

**🌍 Global Impact:**
Every share helps build a more engaged, informed citizenry. Whether you're spreading a serious policy proposal or a fun community question, you're contributing to a more connected and participatory democracy.

Ready to amplify the ideas that matter to you?`
};

class ChatbotService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  // Get predefined response or generate AI response
  async getResponse(userMessage: string, questionId?: string): Promise<string> {
    // If it's a predefined question, return the predefined response
    if (questionId && PREDEFINED_RESPONSES[questionId]) {
      return PREDEFINED_RESPONSES[questionId];
    }

    // Check if the message matches any predefined responses by content
    const lowerMessage = userMessage.toLowerCase();
    for (const [id, response] of Object.entries(PREDEFINED_RESPONSES)) {
      const question = PREDEFINED_QUESTIONS.find(q => q.id === id)?.question.toLowerCase();
      if (question && lowerMessage.includes(question.slice(0, 10))) {
        return response;
      }
    }

    // Generate AI response for custom questions
    return this.generateAIResponse(userMessage);
  }

  private async generateAIResponse(userMessage: string): Promise<string> {
    if (!this.genAI) {
      return this.getFallbackResponse(userMessage);
    }

    try {
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        }
      });

      const prompt = `
        You are a helpful chatbot for IdeasMatter, an AI-powered civic engagement platform. 
        
        IMPORTANT RULES:
        1. ONLY answer questions about IdeasMatter, civic engagement, policy proposals, and democracy
        2. DO NOT answer questions about other topics, current events, personal advice, or unrelated subjects
        3. If asked about something unrelated, politely redirect to IdeasMatter topics
        4. Keep responses concise but informative (under 300 words)
        5. Be friendly, professional, and encouraging about civic participation
        
        ABOUT IDEASMATTER (LATEST FEATURES):
        - "No Login? No Problem!" - Guests can browse all content without accounts
        - Two content types: Community Polls/Ideas and AI-Drafted Proposals
        - AI-powered platform using Google Gemini for policy drafts
        - Audio summaries with ElevenLabs, video explanations with Tavus
        - Community voting system (up/down for proposals, yes/no/like for polls)
        - Social sharing with AI-generated platform-specific content
        - AI content validation and community reporting for safety
        - Categories: Civic, Tech, Fun, Life, Environment, Education, Healthcare, etc.
        - Account benefits: vote, comment, submit ideas, save content, report issues
        - Goal: Make democracy accessible and transparent for everyone
        
        KEY FEATURES TO HIGHLIGHT:
        - Guest access for browsing without registration
        - AI transforms simple ideas into structured policy documents
        - Multimedia accessibility (audio/video content)
        - Community safety through AI moderation and reporting
        - Social sharing with optimized content for each platform
        - Flexible voting system for different content types
        
        USER QUESTION: "${userMessage}"
        
        If this question is about IdeasMatter or civic engagement, provide a helpful response.
        If it's about something else, politely redirect them to ask about our platform instead.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating AI response:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for off-topic questions
    const offTopicKeywords = ['weather', 'sports', 'entertainment', 'cooking', 'travel', 'personal', 'relationship'];
    if (offTopicKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return "I'm here to help you with questions about IdeasMatter and civic engagement! I can tell you about our guest browsing features, how to submit ideas, our AI policy generation, voting system, and community features. What would you like to know about our platform?";
    }

    // Check for guest access questions
    if (lowerMessage.includes('guest') || lowerMessage.includes('account') || lowerMessage.includes('login') || lowerMessage.includes('sign')) {
      return `Great question! IdeasMatter follows a "No Login? No Problem!" philosophy. You can:

**Browse Freely (No Account):**
• Read all ideas and policy proposals
• View AI-generated content, audio, and videos
• See vote counts and community discussions
• Search and filter by categories

**Participate Fully (Free Account):**
• Vote on proposals and polls
• Comment and join discussions
• Submit your own ideas
• Save content for later

Would you like to know more about any specific features?`;
    }

    // Generic helpful response for platform-related questions
    if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
      return `I'm here to help you with IdeasMatter! I can answer questions about:

• **Guest Access** - Browse without an account
• **Submitting Ideas** - From fun polls to policy proposals
• **AI Features** - Policy generation, audio/video content
• **Voting System** - How community engagement works
• **Safety Features** - Content moderation and reporting
• **Social Sharing** - Spread ideas across platforms
• **Account Benefits** - What you get when you sign up

What specific aspect of IdeasMatter interests you most?`;
    }

    return "I'm here to help you with questions about IdeasMatter! Feel free to ask about our guest browsing features, how to submit ideas, our AI capabilities, voting system, or any other platform features. You can also click on one of the suggested questions below.";
  }

  // Check if a message is likely off-topic
  isOffTopic(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const offTopicKeywords = [
      'weather', 'sports', 'entertainment', 'cooking', 'travel', 'personal', 'relationship',
      'movie', 'music', 'game', 'celebrity', 'fashion', 'shopping', 'dating'
    ];
    
    return offTopicKeywords.some(keyword => lowerMessage.includes(keyword));
  }
}

export const chatbotService = new ChatbotService();