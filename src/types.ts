export type CategoryId =
  | 'products'
  | 'drinks'
  | 'cafe'
  | 'health'
  | 'home'
  | 'clothes'
  | 'transport'
  | 'other'

export type FiscalQr = {
  sum: number
  datetime: string
  fn?: string
  fd?: string
  fp?: string
  raw: string
}

export type Product = {
  id: string
  name: string
  price: number
  category: CategoryId
}

export type Receipt = {
  id: string
  store: string
  datetime: string
  products: Product[]
  fiscal?: FiscalQr
}
