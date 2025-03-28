export interface IPack {
  id: number
  name: string
  price: number
  image: string
}

export interface IPackItem {
  image: string
  qty: number
  desc: string
  rarity: 'rare' | 'common'
}
