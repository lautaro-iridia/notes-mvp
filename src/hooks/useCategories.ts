import { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useLocalStorage } from './useLocalStorage'
import { STORAGE_KEYS } from '../utils/storage'
import type { Category } from '../types'
import { CATEGORY_COLORS } from '../types'

const DEFAULT_CATEGORIES: Category[] = [
  { id: uuidv4(), name: 'Personal', color: CATEGORY_COLORS[6] },
  { id: uuidv4(), name: 'Trabajo', color: CATEGORY_COLORS[4] },
  { id: uuidv4(), name: 'Proyectos', color: CATEGORY_COLORS[7] },
]

export function useCategories() {
  const [categories, setCategories] = useLocalStorage<Category[]>(
    STORAGE_KEYS.CATEGORIES,
    DEFAULT_CATEGORIES
  )

  const createCategory = useCallback((name: string, color: string): Category => {
    const newCategory: Category = {
      id: uuidv4(),
      name,
      color,
    }
    setCategories((prev) => [...prev, newCategory])
    return newCategory
  }, [setCategories])

  const updateCategory = useCallback((
    id: string,
    updates: Partial<Omit<Category, 'id'>>
  ): void => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === id ? { ...category, ...updates } : category
      )
    )
  }, [setCategories])

  const deleteCategory = useCallback((id: string): void => {
    setCategories((prev) => prev.filter((category) => category.id !== id))
  }, [setCategories])

  const getCategoryById = useCallback((id: string): Category | undefined => {
    return categories.find((category) => category.id === id)
  }, [categories])

  const getCategoriesByIds = useCallback((ids: string[]): Category[] => {
    return categories.filter((category) => ids.includes(category.id))
  }, [categories])

  return {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoriesByIds,
  }
}
