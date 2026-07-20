import type { st } from "vue-router/dist/router-CWoNjPRp.mjs"

export interface ApiResponse<T> {
  success: boolean
  data: T
  total_price: any
}

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

export interface CourtType {
  id: string
  type: string
}

export interface CourtMaterial {
  id: string
  material_type: string
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

export interface Venue {
  id: number
  name: string
  email: string
  status: string
  description: string
  address: string
  rules: string
  city: City
  latitude: string
  longitude: string
  link_map: string
  primary_image: VenueImage
  phone: string
  court: Court[]
  facility: Facility[]
  rating: Rating[]
  first_image: Images
  booking: Booking[]
  avg_rating: number
  total_review: number
  min_price: number
  max_price: number
}

export interface VenueImage {
  id: number
  is_primary: boolean
  image: string
  image_url: string
}

export interface Images {
  id: number
  image_url: string
}

export interface OperationalHour {
  id: number
  day_of_week: string
  open_time: string
  close_time: string
  is_closed: number
}

export interface Rating {
  id: number
  booking_id: number
  rate: number
  review: string
  created_at: string
  updated_at: string
}

export interface Booking {
  id: number
  venue_id: number
  court_id: number
  user_id: number
  guest_contact: string
  guest_name: string
  booking_date: string
  price: number
  total_price: number
  midtrans_order_id: string
  payment_status: string
  status: string
  created_at: string
  updated_at: string
  user: User
  rating: Rating
  day_status: string
  code: string
  venue: Venue
  sessions: Session[]
  additional: BookingAdditional[]
  court: Court
}

export interface BookingAdditional {
  id: number
  booking_id: number
  additional_id: number
  price: number
  additional: VenueAdditional
}

export interface VenueAdditional {
  id: number
  court_id: number
  additional_type_id: number
  description: string
  price: number
  additional_type: AdditionalType
}

export interface AdditionalType {
  id: number
  sport_type_id: number
  addon: string
}

export interface User {
  id: number
  name: string
  email: string
  phone: string
  bod: string
  profile_image_url: string
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

export interface Hold {
  id: number
  start_time: Date
  end_time: Date
}

export interface Cart {
  venue: Venue
  court: Court
  hold: Hold
}

export interface Session {
  id: number
  booking_id: number
  start_time: string
  end_time: string
  price: number
}

export interface History {
  id: number
  venue_id: number
  booking_date: Date
  price: number
  midtrans_order_id: string
  payment_status: string
  status: string
  venue: Venue
  court: Court
  sessions: Session[]
}

export interface Activities {
  id: number
  booking_date: string
  total_price: number
  venue: Venue
  court: Court
  hold: Session
}

export interface Balance {
  id: number
  venue_id: number
  balance: number
}

export interface PendingWithdraw {
  id: number
  venue_id: number
  reference_id: string
  amount: number
  status: string
  bank: BankAccount
  created_at: string
}

export interface BankAccount {
  id: number
  venue_id: number
  venue_bank_account_id: number
  bank_account: string
  holder_name: string
  account_type: string
  bank_type: string
  status: string
}

export interface WithdrawHistory {
  id: number
  venue_id: number
  venue_bank_account_id: number
  reference_id: string
  amount: number
  status: string
  created_at: string
  updated_at: string
  bank:BankAccount
}

export interface StoreProduct {
  id: number
  venue_id: number
  product_type: string
  name: string
  stock: number
  price: number
  image: string
  image_url: string
  created_at: string
}

export interface Items {
  items: StoreCart[]
  total_price: number
}

export interface StoreCart {
  id: number
  venue_id: number
  store_product_id: number
  unit_price: number
  quantity: number
  subtotal: number
  product: StoreProduct
}

export interface TransactionData {
  header: StoreTransaction
  item: TransactionItem
}

export interface StoreTransaction {
  id: number
  venue_id: number
  total_price: number
  payment_method: string
  created_at: string
}

export interface TransactionItem {
  id: number
  store_transaction_id: number
  store_product_id: number
  unit_price: number
  quantity: number
  subtotal: number
}

export interface ProductIncomeChart {
  id: number
  name: string
  total_qty: number
  total_income: number
}

export interface ProductIncome {
  id: number
  name: string
  total_qty: number
  total_income: number
  total_cogs: number
  total_margin: number
}

export interface ProductIncomeOverview {
  total_sold_item: number
  total_gross_income: number
  total_margin: number
  total_margin_gear: number
  total_margin_fnb: number
  income: ProductIncome[]
}

export interface CancelRequest {
  id: number
  booking_id: number
  status: string
  total_refund: number
  created_at: Date
  updated_at: Date
  booking: Booking
}

export interface BookingSummary {
  id: number
  venue_id: number
  court_id: number
  guest_contact: string
  guest_name: string
  booking_type: string
  booking_date: Date
  payment_status: string
  subtotal: number
  tax: number
  total_price: number
  expires_at: Date
  created_at: Date
  hold: Hold[]
  additional: BookingAdditional[]
  court: Court
  court_price: number
}

export interface Employee {
  id: number
  venue_id: number
  name: string
  bod: Date
  religion: string
  gender: string
  position: string
  salary: number
  phone_number: string
  email: string
  created_at: Date
}

export interface OpenSparring {
  id: number
  user_id: number
  venue_id: number
  sport_type_id: number
  city_id: number
  description: string
  level: Level
  user: User
  venue: Venue
  sport_type: SportType
  city: City
  datelist: Datelist[]
  created_at: string
  updated_at: string
}

export interface Datelist {
  id: number
  open_sparring_id: number
  date: String
}

export interface LastMessage {
  type: string
  is_mine: boolean
  message: string | null
  sparring_id: number | null
  created_at: string
  preview: string | null
}

export interface Conversations {
  conversation_id: number
  unread: number
  user: User
  last_message: LastMessage
}

export interface Message {
  id: number
  type: 'text' | 'sparring_invitation'
  is_read: boolean
  message: string | null
  is_mine: boolean
  sender: {
    id: number
    name: string
    profile_image_url: string
  }
  sparring: {
    id: number
    sparring_date: string
    status: string
    sport_type: {
      id: number
      type: string
    }
    city: {
      city: string
      province: string
    }
    level: {
      level: string
    }
    open_sparring: {
      id: number
      description: string
      status: string
    }
  } | null
  created_at: string
}

export interface Messages {
  conversation_id: number
  user: User
  messages: Message
}