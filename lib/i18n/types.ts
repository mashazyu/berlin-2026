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
    aboutTitle: string
    aboutDescription: string
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
    motivation: string
    table: string
    privacy: string
  }
  hero: {
    headline: string
    support: string
    blurb: string
    cta: string
    disclaimer: string
    scrollHint: string
  }
  motivation: {
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
    furtherReadingIntro: string
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
    about: string
    privacy: string
  }
  about: {
    title: string
    body: string
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
