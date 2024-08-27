type Shift = {
  id: string
  uid: string
  username: string
  day: string
  start: string
  end: string | null
  duration: string | null
  nobreaks: boolean
  supervisor: boolean
  notes: string | null
  approved: boolean
  by: string | null
  clockedout: string
}

type Holiday = {
  name: string
  date: string
  hours: string
  type: string
  notes: string
}

export { Shift, Holiday }
