
export interface AppConfig {
  max_collections_per_user: number;
  max_entities_per_collection: number;
}

export const appConfig: AppConfig = {
  max_collections_per_user: 20,
  max_entities_per_collection: 500
}
