export function cellKey(topicId: string, partyId: string): string {
  return `${topicId}::${partyId}`
}
