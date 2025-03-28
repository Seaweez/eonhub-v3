import type { IPack, IPackItem } from '@/types/pack'

export const PACK_DATA: {
  [key in string]: IPack
} = {
  '1': {
    id: 1,
    name: 'Solo pack',
    price: 99,
    image: '/images/packs/solo.png',
  },
  '2': {
    id: 2,
    name: 'Duo pack',
    price: 199,
    image: '/images/packs/duo.png',
  },
  '3': {
    id: 3,
    name: 'King pack',
    price: 299,
    image: '/images/packs/king.png',
  },
}

export const ITEM_DATA: IPackItem[] = [
  {
    image: '/images/packs/items/1.png',
    qty: 1,
    desc: 'Random costume box\n"Common" All+5',
    rarity: 'rare',
  },
  {
    image: '/images/packs/items/2.png',
    qty: 1,
    desc: 'Random costume box "Common" All+5',
    rarity: 'rare',
  },
  {
    image: '/images/packs/items/3.png',
    qty: 1,
    desc: 'White Tiger\n(7 Days)',
    rarity: 'rare',
  },
  {
    image: '/images/packs/items/4.png',
    qty: 1,
    desc: 'Green Seed\nOp.ATK20\nMPW20 ASP6\nMove6',
    rarity: 'rare',
  },
  {
    image: '/images/packs/items/5.png',
    qty: 1,
    desc: 'Bat Suit Guy (7 Days)',
    rarity: 'rare',
  },
  {
    image: '/images/packs/items/6.png',
    qty: 1,
    desc: 'BOT (30 Days)',
    rarity: 'rare',
  },
  {
    image: '/images/packs/items/7.png',
    qty: 1,
    desc: 'Random costume box\n"Common" All+5',
    rarity: 'rare',
  },
  {
    image: '/images/packs/items/8.png',
    qty: 1,
    desc: 'Random costume box "Common" All+5',
    rarity: 'rare',
  },
  {
    image: '/images/packs/items/9.png',
    qty: 1,
    desc: 'White Tiger\n(7 Days)',
    rarity: 'rare',
  },
  {
    image: '/images/packs/items/10.png',
    qty: 10,
    desc: 'Green Seed\nOp.ATK20\nMPW20 ASP6\nMove6',
    rarity: 'common',
  },
  {
    image: '/images/packs/items/11.png',
    qty: 10,
    desc: 'Bat Suit Guy (7 Days)',
    rarity: 'common',
  },
  {
    image: '/images/packs/items/12.png',
    qty: 5,
    desc: 'BOT (30 Days)',
    rarity: 'common',
  },
  {
    image: '/images/packs/items/13.png',
    qty: 10,
    desc: 'Random costume box "Common" All+5',
    rarity: 'common',
  },
  {
    image: '/images/packs/items/14.png',
    qty: 10,
    desc: 'White Tiger\n(7 Days)',
    rarity: 'common',
  },
  {
    image: '/images/packs/items/15.png',
    qty: 10,
    desc: 'Green Seed\nOp.ATK20\nMPW20 ASP6\nMove6',
    rarity: 'common',
  },
  {
    image: '/images/packs/items/16.png',
    qty: 10,
    desc: 'Bat Suit Guy (7 Days)',
    rarity: 'common',
  },
  {
    image: '/images/packs/items/17.png',
    qty: 100,
    desc: 'BOT (30 Days)',
    rarity: 'common',
  },
]
