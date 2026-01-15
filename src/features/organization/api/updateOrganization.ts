import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { toast } from 'sonner'

interface UpdateOrganizationParams {
  id: string
  name: string
  logoFile?: File
  cultureDescription?: string
}

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name, logoFile, cultureDescription }: UpdateOrganizationParams) => {
      let logoUrl = null

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `${id}-${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('brand-logos')
          .upload(fileName, logoFile, {
            upsert: true
          })

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('brand-logos')
          .getPublicUrl(fileName)

        logoUrl = publicUrlData.publicUrl
      }

      const updateData: { name: string; brand_logo_url?: string; culture_description?: string } = { name }
      if (logoUrl) {
        updateData.brand_logo_url = logoUrl
      }
      
      if (typeof cultureDescription !== 'undefined') {
        updateData.culture_description = cultureDescription
      }

      const { data, error } = await supabase
        .from('organizations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] })
      toast.success('Organization updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update organization: ' + error.message)
    },
  })
}