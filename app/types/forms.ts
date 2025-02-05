export type InitialMeetingData = {
  // Owner information
  ownerFirstName?: string;
  ownerLastName?: string;
  ownerPronouns?: 'He' | 'She' | 'They';
  
  // Additional information
  otherInformation?: string;

  // Existing fields
  websiteCreationDate?: string;
  websiteGoal?: string;
  industrySituation?: string;
  monthlyClients?: string;
  yearComparison?: string;
  auditInsights?: string;
  websitePurpose?: string;
  improvementWishes?: string;
  targetGroup?: string;
  onlineTargetAudience?: string;
  missingFeatures?: string;
  plannedUpdates?: string;
  googleSearchInterest?: string;
}; 