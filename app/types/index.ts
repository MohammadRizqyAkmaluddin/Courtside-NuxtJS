export interface City {
  id: number
  city: string
  province: string
}

export interface Facility {
  id: number
  venue_id: number
  facility_type_id: number
}

export interface SportType {
  id: number
  type: string
}

export interface Court {
  id: number
  venue_id: number
  name: string
  price: number
  image: string
  image_url: string
  sport_type: SportType
}

export interface VenueImage {
  id: number
  image: string
  image_url: string
}

export interface Images {
  id: number
  image_url: string
}

export interface User {
  id: number
  name: string
  email: string
  phone: string
  profile_image_url: string
}

export interface Venue {
  id: number
  name: string
  description: string
  address: string
  rules: string
  city: City
  latitude: string
  longitude: string
  link_map: string
  images: Images[]
  court: Court[]
  facility: Facility[]
  rating: Rating[]
  first_image: Images
}

export interface Rating {
  id: number
  user_id: number
  venue_id: number
  rate: number
  review: string
  user: User[]
}

export interface Level {
  id: number
  level: string
}

export interface Community {
  id: number
  name: string
  level: Level
  image_url: string
  membership_fee: number
  total_member: number
  max_slot: number
  description: string
  day_of_week: number
  start_time: string
  end_time: string
  venue_name: string
  map_link: string
  address: string
  latitude: string
  longitude: string
  city: City
  venue: Venue
  user: User
  sport_type: SportType
}