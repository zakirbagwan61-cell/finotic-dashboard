import { Briefcase, Laptop, Utensils, ShoppingBag, Receipt, Film, Car, Tag } from 'lucide-react'

export const CATEGORY_META = {
  Salary:        { icon: Briefcase,   color: '#12a150' },
  Freelance:     { icon: Laptop,      color: '#06b6d4' },
  Food:          { icon: Utensils,    color: '#f59e0b' },
  Shopping:      { icon: ShoppingBag, color: '#ec4899' },
  Bills:         { icon: Receipt,     color: '#ef4444' },
  Entertainment: { icon: Film,        color: '#a855f7' },
  Transport:     { icon: Car,         color: '#4f46e5' },
  Other:         { icon: Tag,         color: '#64748b' },
}

export const metaFor = (category) => CATEGORY_META[category] || CATEGORY_META.Other