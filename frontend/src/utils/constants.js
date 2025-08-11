export const SPORT_TYPES = [
  'BADMINTON',
  'TENNIS', 
  'FOOTBALL',
  'CRICKET',
  'BASKETBALL',
  'VOLLEYBALL',
  'TABLE_TENNIS',
  'SWIMMING'
]

export const VENUE_TYPES = [
  'INDOOR',
  'OUTDOOR'
]

export const AMENITIES = [
  'Parking',
  'Washroom',
  'Cafeteria',
  'Air Conditioning',
  'Locker Room',
  'First Aid',
  'Equipment Rental',
  'Water Cooler',
  'CCTV',
  'Lighting'
]

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
}

export const FACILITY_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
}

export const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
]

export const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID
