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
    keywords: string[]
  }
  brand: {
    name: string
    tagline: string
  }
  navigation: {
    about: string
    table: string
    analysis: string
    privacy: string
  }
  hero: {
    headline: string
    support: string
    cta: string
    electionDate: string
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
    disclaimer: string
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
  }
  analysis: {
    title: string
    consensusTitle: string
    dividesTitle: string
    partyFeaturesTitle: string
  }
  footer: {
    aiNote: string
    relatedSite: string
    contact: string
    privacy: string
    unaffiliated: string
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
