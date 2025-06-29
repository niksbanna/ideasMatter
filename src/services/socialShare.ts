// Social sharing service with AI-generated content
import { generateSocialContent } from './gemini';

export interface SocialShareContent {
  title: string;
  description: string;
  hashtags: string[];
  url: string;
}

export interface PlatformContent {
  linkedin: SocialShareContent;
  twitter: SocialShareContent;
  instagram: SocialShareContent;
}

export const generateSocialShareContent = async (proposal: {
  title: string;
  description: string;
  category: string;
  author_name: string;
}): Promise<PlatformContent> => {
  try {
    const content = await generateSocialContent(proposal);
    const currentUrl = window.location.href;

    return {
      linkedin: {
        title: content.linkedin.title,
        description: content.linkedin.description,
        hashtags: content.linkedin.hashtags,
        url: currentUrl
      },
      twitter: {
        title: content.twitter.title,
        description: content.twitter.description,
        hashtags: content.twitter.hashtags,
        url: currentUrl
      },
      instagram: {
        title: content.instagram.title,
        description: content.instagram.description,
        hashtags: content.instagram.hashtags,
        url: currentUrl
      }
    };
  } catch (error) {
    console.error('Error generating social content:', error);
    // Fallback content
    const currentUrl = window.location.href;
    return generateFallbackContent(proposal, currentUrl);
  }
};

const generateFallbackContent = (proposal: {
  title: string;
  description: string;
  category: string;
  author_name: string;
}, url: string): PlatformContent => {
  const baseHashtags = ['#PolicyProposal', '#CivicEngagement', '#Democracy', '#PublicPolicy'];
  const categoryTag = `#${proposal.category.replace(/\s+/g, '')}`;

  return {
    linkedin: {
      title: `Policy Proposal: ${proposal.title}`,
      description: `Exploring innovative solutions for ${proposal.category.toLowerCase()}. This proposal by ${proposal.author_name} presents actionable ideas for positive change. What are your thoughts on this approach?`,
      hashtags: [...baseHashtags, categoryTag, '#ProfessionalNetwork'],
      url
    },
    twitter: {
      title: proposal.title,
      description: `💡 New policy proposal on ${proposal.category}: "${proposal.title}" by ${proposal.author_name}. Join the discussion!`,
      hashtags: [...baseHashtags, categoryTag],
      url
    },
    instagram: {
      title: proposal.title,
      description: `🏛️ Making democracy more accessible! Check out this policy proposal on ${proposal.category}. Every voice matters in shaping our future. Link in bio!`,
      hashtags: [...baseHashtags, categoryTag, '#MakeADifference', '#YourVoiceMatters'],
      url
    }
  };
};

export const shareToLinkedIn = (content: SocialShareContent): void => {
  const text = `${content.title}\n\n${content.description}\n\n${content.hashtags.join(' ')}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(content.url)}&title=${encodeURIComponent(content.title)}&summary=${encodeURIComponent(content.description)}`;
  
  window.open(linkedInUrl, '_blank', 'width=600,height=600,scrollbars=yes,resizable=yes');
};

export const shareToTwitter = (content: SocialShareContent): void => {
  const text = `${content.description}\n\n${content.hashtags.join(' ')}\n\n${content.url}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  
  window.open(twitterUrl, '_blank', 'width=600,height=600,scrollbars=yes,resizable=yes');
};

export const shareToInstagram = (content: SocialShareContent): void => {
  // Instagram doesn't support direct URL sharing, so we copy to clipboard
  const text = `${content.title}\n\n${content.description}\n\n${content.hashtags.join(' ')}\n\n${content.url}`;
  
  navigator.clipboard.writeText(text).then(() => {
    // Open Instagram in a new tab
    window.open('https://www.instagram.com/', '_blank');
    
    // Show a notification that content was copied
    alert('Content copied to clipboard! Paste it in your Instagram post.');
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    window.open('https://www.instagram.com/', '_blank');
    alert('Content copied to clipboard! Paste it in your Instagram post.');
  });
};

export const copyShareContent = (content: SocialShareContent): void => {
  const text = `${content.title}\n\n${content.description}\n\n${content.hashtags.join(' ')}\n\n${content.url}`;
  
  navigator.clipboard.writeText(text).then(() => {
    alert('Share content copied to clipboard!');
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Share content copied to clipboard!');
  });
};