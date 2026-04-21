export interface Collection {
  id: string
  title: string
  description: string | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
  totalEntities?: number
  entities?: CollectionEntity[]
}

export interface Entity {
  id: string
  addedAt: string
  note: string | null
  imageUrl?: string
  name: string,
  description: string,
  latitude: number,
  longitude: number,
  category: string,
  userCollections?: { id: string; title?: string }[]
}

// For thumbnail display we might need a minimal entity object
export interface EntityWithImage {
  id: string
  imageUrl?: string
  name: string
}

export type Signup = {
  email: string,
  name: string,
  password: string
}

export type Login = {
  email: string,
  password: string
}
