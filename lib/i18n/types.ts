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
    comparison: string
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
  comparison: {
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
    expandGroup: string
    collapseGroup: string
    searchPlaceholder: string
    searchClear: string
    searchNoResults: string
    searchResultsCount: string
    filterAll: string
    filterDisagreement: string
    filterDisagreementHint: string
    groups: {
      transport: string
      waste: string
      climate_energy: string
      animals: string
      housing: string
      security: string
      education: string
      health: string
      migration: string
      economy: string
      society: string
      democracy: string
      other: string
    }
  }
  footer: {
    aiNotice: string
    aiDisclosure: string
    relatedSite: string
    contact: string
    about: string
    privacy: string
  }
  feedback: {
    fabLabel: string
    title: string
    intro: string
    textReportHint: string
    messageLabel: string
    messagePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    submit: string
    sending: string
    cancel: string
    close: string
    success: string
    error: string
    captchaRequired: string
    captchaMissing: string
  }
  textReport: {
    title: string
    intro: string
    selectionAction: string
    incorrectLabel: string
    incorrectPlaceholder: string
    suggestedLabel: string
    suggestedPlaceholder: string
    submit: string
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
