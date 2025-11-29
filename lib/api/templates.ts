/**
 * Template Data Access Layer
 *
 * Provides functions for managing building-specific application templates.
 */

import { createClient } from '@/lib/supabase/server'
import type { Template, DocumentCategory, DisclosureType, BuildingPolicies } from '@/lib/types'
import type { Database, Json } from '@/lib/database.types'

type TemplateRow = Database['public']['Tables']['templates']['Row']

/**
 * Type guard to check if JSON is a sections object
 */
function isSectionsJson(json: Json | null): json is { required?: string[]; optional?: string[] } {
  if (json === null || typeof json !== 'object' || Array.isArray(json)) return false
  return true
}

/**
 * Type guard to check if JSON is an array of strings
 */
function isStringArray(json: Json | null): json is string[] {
  if (!Array.isArray(json)) return false
  return json.every(item => typeof item === 'string')
}

/**
 * Map database record to Template type
 */
function mapToTemplate(template: TemplateRow & { building?: unknown }): Template {
  const sections = isSectionsJson(template.sections) ? template.sections : null
  return {
    id: template.id,
    buildingId: template.building_id,
    name: template.name,
    description: undefined, // Not in DB schema
    version: 1, // Not in DB schema
    requiredSections: sections?.required || [],
    optionalSections: sections?.optional || [],
    requiredDocuments: isStringArray(template.required_documents)
      ? template.required_documents as DocumentCategory[]
      : [],
    optionalDocuments: [], // Not in DB schema
    enabledDisclosures: isStringArray(template.custom_disclosures)
      ? template.custom_disclosures as DisclosureType[]
      : [],
    buildingPolicies: undefined, // Not in DB schema
    createdAt: new Date(template.created_at),
    publishedAt: undefined, // Not in DB schema
    isPublished: template.is_published,
  }
}

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

  return (data || []).map(mapToTemplate)
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

  return mapToTemplate(data)
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

  return mapToTemplate(data)
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

  return mapToTemplate(template)
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

  return mapToTemplate(template)
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

  return mapToTemplate(template)
}
