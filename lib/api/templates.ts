/**
 * Template Data Access Layer
 *
 * Provides functions for managing building-specific application templates.
 */

import { createClient } from '@/lib/supabase/server'
import type { Template, DocumentCategory, DisclosureType, BuildingPolicies } from '@/lib/types'

/**
 * Input type for creating a new template
 */
export type CreateTemplateInput = {
  buildingId: string
  name: string
  description?: string
  requiredSections: string[]
  optionalSections: string[]
  requiredDocuments: DocumentCategory[]
  optionalDocuments: DocumentCategory[]
  enabledDisclosures: DisclosureType[]
  buildingPolicies?: BuildingPolicies
}

/**
 * Get all templates (agent only)
 *
 * @returns Array of templates
 */
export async function getTemplates(): Promise<Template[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('templates')
    .select(`
      *,
      building:buildings(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching templates:', error)
    throw new Error(`Failed to fetch templates: ${error.message}`)
  }

  return (data || []).map(template => ({
    id: template.id,
    buildingId: template.building_id,
    name: template.name,
    description: template.description,
    version: template.version || 1,
    requiredSections: template.sections?.required || [],
    optionalSections: template.sections?.optional || [],
    requiredDocuments: template.required_documents || [],
    optionalDocuments: template.optional_documents || [],
    enabledDisclosures: template.custom_disclosures || [],
    buildingPolicies: template.building_policies,
    createdAt: new Date(template.created_at),
    publishedAt: template.published_at ? new Date(template.published_at) : undefined,
    isPublished: template.is_published,
  }))
}

/**
 * Get a single template by ID
 *
 * @param id - The template ID
 * @returns The template or null if not found
 */
export async function getTemplate(id: string): Promise<Template | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('templates')
    .select(`
      *,
      building:buildings(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching template:', error)
    throw new Error(`Failed to fetch template: ${error.message}`)
  }

  return {
    id: data.id,
    buildingId: data.building_id,
    name: data.name,
    description: data.description,
    version: data.version || 1,
    requiredSections: data.sections?.required || [],
    optionalSections: data.sections?.optional || [],
    requiredDocuments: data.required_documents || [],
    optionalDocuments: data.optional_documents || [],
    enabledDisclosures: data.custom_disclosures || [],
    buildingPolicies: data.building_policies,
    createdAt: new Date(data.created_at),
    publishedAt: data.published_at ? new Date(data.published_at) : undefined,
    isPublished: data.is_published,
  }
}

/**
 * Get the published template for a building
 *
 * @param buildingId - The building ID
 * @returns The published template or null if not found
 */
export async function getBuildingTemplate(buildingId: string): Promise<Template | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('templates')
    .select(`
      *,
      building:buildings(*)
    `)
    .eq('building_id', buildingId)
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching building template:', error)
    throw new Error(`Failed to fetch building template: ${error.message}`)
  }

  return {
    id: data.id,
    buildingId: data.building_id,
    name: data.name,
    description: data.description,
    version: data.version || 1,
    requiredSections: data.sections?.required || [],
    optionalSections: data.sections?.optional || [],
    requiredDocuments: data.required_documents || [],
    optionalDocuments: data.optional_documents || [],
    enabledDisclosures: data.custom_disclosures || [],
    buildingPolicies: data.building_policies,
    createdAt: new Date(data.created_at),
    publishedAt: data.published_at ? new Date(data.published_at) : undefined,
    isPublished: data.is_published,
  }
}

/**
 * Create a new template
 *
 * @param data - Template data
 * @returns The created template
 */
export async function createTemplate(data: CreateTemplateInput): Promise<Template> {
  const supabase = await createClient()

  const { data: template, error } = await supabase
    .from('templates')
    .insert({
      building_id: data.buildingId,
      name: data.name,
      description: data.description,
      version: 1,
      sections: {
        required: data.requiredSections,
        optional: data.optionalSections,
      },
      required_documents: data.requiredDocuments,
      optional_documents: data.optionalDocuments,
      custom_disclosures: data.enabledDisclosures,
      building_policies: data.buildingPolicies,
      is_published: false,
    })
    .select(`
      *,
      building:buildings(*)
    `)
    .single()

  if (error) {
    console.error('Error creating template:', error)
    throw new Error(`Failed to create template: ${error.message}`)
  }

  return {
    id: template.id,
    buildingId: template.building_id,
    name: template.name,
    description: template.description,
    version: template.version || 1,
    requiredSections: template.sections?.required || [],
    optionalSections: template.sections?.optional || [],
    requiredDocuments: template.required_documents || [],
    optionalDocuments: template.optional_documents || [],
    enabledDisclosures: template.custom_disclosures || [],
    buildingPolicies: template.building_policies,
    createdAt: new Date(template.created_at),
    publishedAt: template.published_at ? new Date(template.published_at) : undefined,
    isPublished: template.is_published,
  }
}

/**
 * Update an existing template
 *
 * @param id - The template ID
 * @param data - Partial template data to update
 * @returns The updated template
 */
export async function updateTemplate(
  id: string,
  data: Partial<CreateTemplateInput>
): Promise<Template> {
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}

  if (data.name) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.requiredSections || data.optionalSections) {
    updateData.sections = {
      required: data.requiredSections,
      optional: data.optionalSections,
    }
  }
  if (data.requiredDocuments) updateData.required_documents = data.requiredDocuments
  if (data.optionalDocuments) updateData.optional_documents = data.optionalDocuments
  if (data.enabledDisclosures) updateData.custom_disclosures = data.enabledDisclosures
  if (data.buildingPolicies !== undefined) updateData.building_policies = data.buildingPolicies

  const { data: template, error } = await supabase
    .from('templates')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      building:buildings(*)
    `)
    .single()

  if (error) {
    console.error('Error updating template:', error)
    throw new Error(`Failed to update template: ${error.message}`)
  }

  return {
    id: template.id,
    buildingId: template.building_id,
    name: template.name,
    description: template.description,
    version: template.version || 1,
    requiredSections: template.sections?.required || [],
    optionalSections: template.sections?.optional || [],
    requiredDocuments: template.required_documents || [],
    optionalDocuments: template.optional_documents || [],
    enabledDisclosures: template.custom_disclosures || [],
    buildingPolicies: template.building_policies,
    createdAt: new Date(template.created_at),
    publishedAt: template.published_at ? new Date(template.published_at) : undefined,
    isPublished: template.is_published,
  }
}

/**
 * Publish a template
 *
 * @param id - The template ID
 * @returns The published template
 */
export async function publishTemplate(id: string): Promise<Template> {
  const supabase = await createClient()

  const { data: template, error } = await supabase
    .from('templates')
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(`
      *,
      building:buildings(*)
    `)
    .single()

  if (error) {
    console.error('Error publishing template:', error)
    throw new Error(`Failed to publish template: ${error.message}`)
  }

  return {
    id: template.id,
    buildingId: template.building_id,
    name: template.name,
    description: template.description,
    version: template.version || 1,
    requiredSections: template.sections?.required || [],
    optionalSections: template.sections?.optional || [],
    requiredDocuments: template.required_documents || [],
    optionalDocuments: template.optional_documents || [],
    enabledDisclosures: template.custom_disclosures || [],
    buildingPolicies: template.building_policies,
    createdAt: new Date(template.created_at),
    publishedAt: template.published_at ? new Date(template.published_at) : undefined,
    isPublished: template.is_published,
  }
}
