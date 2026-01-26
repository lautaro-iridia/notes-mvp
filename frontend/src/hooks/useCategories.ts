import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi, Category as ApiCategory, CategoryCreate, CategoryUpdate } from '@/api'
import type { Category } from '../types'

// Convert API Category to frontend Category format
function toFrontendCategory(apiCategory: ApiCategory): Category {
  return {
    id: apiCategory.id,
    name: apiCategory.name,
    color: apiCategory.color,
  }
}

export function useCategories() {
  const queryClient = useQueryClient()

  // Fetch categories
  const { data: apiCategories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  })

  // Convert to frontend format
  const categories = apiCategories.map(toFrontendCategory)

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: (data: CategoryCreate) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryUpdate }) => categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })

  const createCategory = useCallback((name: string, color: string) => {
    return createMutation.mutateAsync({ name, color })
  }, [createMutation])

  const updateCategory = useCallback((id: string, updates: Partial<Omit<Category, 'id'>>) => {
    const data: CategoryUpdate = {}
    if (updates.name !== undefined) data.name = updates.name
    if (updates.color !== undefined) data.color = updates.color
    return updateMutation.mutateAsync({ id, data })
  }, [updateMutation])

  const deleteCategory = useCallback((id: string) => {
    return deleteMutation.mutateAsync(id)
  }, [deleteMutation])

  const getCategoryById = useCallback((id: string): Category | undefined => {
    return categories.find((category) => category.id === id)
  }, [categories])

  const getCategoriesByIds = useCallback((ids: string[]): Category[] => {
    return categories.filter((category) => ids.includes(category.id))
  }, [categories])

  return {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoriesByIds,
  }
}
