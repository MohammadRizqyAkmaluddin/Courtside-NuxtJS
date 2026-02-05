export interface City {
  id: number
  city: string
  province: string
}



export interface Court {
  id: number
  venue_id: number
  name: string
  price: number
  image: string
  image_url: string
  sport_type: {
    id: number
    type: string
  }
}

export interface VenueImage {
  id: number
  image: string
  image_url: string
}

export interface Venue {
  id: number
  name: string
  description: string
  address: string
  city: {
    city: string
    province: string
  }
  images: {
    id: number
    image_url: string
  }[]
  court: Court[]
}

export interface SportType {
    id: number
    type: string
}