import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { toast } from 'sonner'
import { uploadAvatar } from '@/shared/api/uploadAvatar'

interface UpdateHrProfileParams {
  id: string
  full_name: string
  avatarFile?: File | null
  userId: string // Need userId for storage path
}

export const useUpdateHrProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, full_name, avatarFile, userId }: UpdateHrProfileParams) => {
      let avatarUrl = null

      if (avatarFile) {
        try {
          avatarUrl = await uploadAvatar(avatarFile, userId)
        } catch {
          throw new Error('Failed to upload avatar')
        }
      }

      const updateData: { full_name: string; avatar_url?: string } = { full_name }
      if (avatarUrl) {
        updateData.avatar_url = avatarUrl
      }

      const { data, error } = await supabase
        .from('hr_specialists')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrProfile'] })
      toast.success('Profile updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update profile: ' + error.message)
    },
  })
}