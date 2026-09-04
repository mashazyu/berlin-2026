export type Language = "en" | "de" | "ru"

export type LocalizedString = {
  en: string
  de?: string | null
  ru?: string | null
}

export type Translations = {
  metadata: {
    homeTitle: string
    homeDescription: string
    privacyTitle: string
    privacyDescription: string
    aiDisclosureTitle: string
    aiDisclosureDescription: string
    keywords: string[]
  }
  brand: {
    name: string
    tagline: string
  }
  navigation: {
    about: string
    table: string
    privacy: string
  }
  hero: {
    headline: string
    support: string
    cta: string
    disclaimer: string
    scrollHint: string
  }
  about: {
    title: string
    berlinVotesTitle: string
    berlinVotesBody: string
    accessibilityTitle: string
    accessibilityBody: string
    clarityTitle: string
    clarityBody: string
    whatWeDidTitle: string
    whatWeDidBody: string
    beforeYouVoteTitle: string
    beforeYouVoteBody: string
    furtherReadingTitle: string
    furtherReadingBody: string
  }
  table: {
    title: string
    subtitle: string
    topicColumn: string
    legendFor: string
    legendAgainst: string
    legendMixed: string
    legendNone: string
    scrollHint: string
    programLink: string
    emptyCell: string
    partiesLabel: string
    showAll: string
    showMajor: string
    selectedCount: string
    expandTopic: string
    collapseTopic: string
    openProgram: string
  }
  footer: {
    aiNotice: string
    aiDisclosure: string
    relatedSite: string
    contact: string
    privacy: string
  }
  aiDisclosure: {
    title: string
    intro: string
    howWeUseAi: string
    howWeUseAiContent: string
    humanResponsibility: string
    humanResponsibilityContent: string
    reviewAndAccuracy: string
    reviewAndAccuracyContent: string
    contact: string
    contactContent: string
  }
  privacy: {
    title: string
    intro: string
    responsibleParty: string
    responsiblePartyContent: string
    dataProcessed: string
    dataProcessedContent: string
    hosting: string
    hostingContent: string
    purposeOfProcessing: string
    purposeOfProcessingContent: string
    cookies: string
    cookiesContent: string
    yourRights: string
    yourRightsIntro: string
    yourRightsList: string
    contactInfo: string
  }
}
