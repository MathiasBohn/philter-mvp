/**
 * RFI (Request for Information) Data Access Layer
 *
 * Provides functions for managing RFIs and RFI messages.
 */

import { createClient } from '@/lib/supabase/server'
import type { RFI, RFIMessage, RFIStatus, Role } from '@/lib/types'

/**
 * Input type for creating a new RFI
 */
export type CreateRFIInput = {
  applicationId: string
  sectionKey: string
  assigneeRole: Role.APPLICANT | Role.BROKER
  initialMessage: string
}

/**
 * Input type for creating an RFI message
 */
export type CreateRFIMessageInput = {
  message: string
  attachments?: string[] // Document IDs
}

/**
 * Create a new RFI
 *
 * @param data - RFI data
 * @returns The created RFI with initial message
 */
export async function createRFI(data: CreateRFIInput): Promise<RFI> {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Get user profile for name and role
  const { data: profile } = await supabase
    .from('users')
    .select('first_name, last_name, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    throw new Error('User profile not found')
  }

  // Create the RFI
  const { data: rfi, error: rfiError } = await supabase
    .from('rfis')
    .insert({
      application_id: data.applicationId,
      section_key: data.sectionKey,
      status: 'OPEN' as RFIStatus,
      assignee_role: data.assigneeRole,
      created_by: user.id,
    })
    .select()
    .single()

  if (rfiError) {
    console.error('Error creating RFI:', rfiError)
    throw new Error(`Failed to create RFI: ${rfiError.message}`)
  }

  // Create the initial message
  const { data: message, error: messageError } = await supabase
    .from('rfi_messages')
    .insert({
      rfi_id: rfi.id,
      author_id: user.id,
      author_name: `${profile.first_name} ${profile.last_name}`,
      author_role: profile.role,
      message: data.initialMessage,
      attachments: [],
    })
    .select()
    .single()

  if (messageError) {
    console.error('Error creating RFI message:', messageError)
    throw new Error(`Failed to create RFI message: ${messageError.message}`)
  }

  return {
    id: rfi.id,
    applicationId: rfi.application_id,
    sectionKey: rfi.section_key,
    status: rfi.status as RFIStatus,
    assigneeRole: rfi.assignee_role as Role.APPLICANT | Role.BROKER,
    createdBy: rfi.created_by,
    createdAt: new Date(rfi.created_at),
    messages: [{
      id: message.id,
      authorId: message.author_id,
      authorName: message.author_name,
      authorRole: message.author_role as Role,
      message: message.message,
      createdAt: new Date(message.created_at),
      attachments: message.attachments || [],
    }],
  }
}

/**
 * Get all RFIs for an application
 *
 * @param applicationId - The application ID
 * @returns Array of RFIs with their messages
 */
export async function getRFIs(applicationId: string): Promise<RFI[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rfis')
    .select(`
      *,
      rfi_messages(*)
    `)
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching RFIs:', error)
    throw new Error(`Failed to fetch RFIs: ${error.message}`)
  }

  return (data || []).map(rfi => ({
    id: rfi.id,
    applicationId: rfi.application_id,
    sectionKey: rfi.section_key,
    status: rfi.status as RFIStatus,
    assigneeRole: rfi.assignee_role as Role.APPLICANT | Role.BROKER,
    createdBy: rfi.created_by,
    createdAt: new Date(rfi.created_at),
    resolvedAt: rfi.resolved_at ? new Date(rfi.resolved_at) : undefined,
    messages: (rfi.rfi_messages || [])
      .sort((a: { created_at: string }, b: { created_at: string }) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((msg: { id: string; author_id: string; author_name: string; author_role: string; message: string; created_at: string; attachments?: unknown[] }) => ({
        id: msg.id,
        authorId: msg.author_id,
        authorName: msg.author_name,
        authorRole: msg.author_role as Role,
        message: msg.message,
        createdAt: new Date(msg.created_at),
        attachments: msg.attachments || [],
      })),
  }))
}

/**
 * Get a single RFI by ID
 *
 * @param id - The RFI ID
 * @returns The RFI with its messages, or null if not found
 */
export async function getRFI(id: string): Promise<RFI | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rfis')
    .select(`
      *,
      rfi_messages(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching RFI:', error)
    throw new Error(`Failed to fetch RFI: ${error.message}`)
  }

  return {
    id: data.id,
    applicationId: data.application_id,
    sectionKey: data.section_key,
    status: data.status as RFIStatus,
    assigneeRole: data.assignee_role as Role.APPLICANT | Role.BROKER,
    createdBy: data.created_by,
    createdAt: new Date(data.created_at),
    resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
    messages: (data.rfi_messages || [])
      .sort((a: { created_at: string }, b: { created_at: string }) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((msg: { id: string; author_id: string; author_name: string; author_role: string; message: string; created_at: string; attachments?: unknown[] }) => ({
        id: msg.id,
        authorId: msg.author_id,
        authorName: msg.author_name,
        authorRole: msg.author_role as Role,
        message: msg.message,
        createdAt: new Date(msg.created_at),
        attachments: msg.attachments || [],
      })),
  }
}

/**
 * Add a message to an RFI
 *
 * @param rfiId - The RFI ID
 * @param messageData - The message data
 * @returns The created message
 */
export async function addRFIMessage(
  rfiId: string,
  messageData: CreateRFIMessageInput
): Promise<RFIMessage> {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Get user profile for name and role
  const { data: profile } = await supabase
    .from('users')
    .select('first_name, last_name, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    throw new Error('User profile not found')
  }

  const { data, error } = await supabase
    .from('rfi_messages')
    .insert({
      rfi_id: rfiId,
      author_id: user.id,
      author_name: `${profile.first_name} ${profile.last_name}`,
      author_role: profile.role,
      message: messageData.message,
      attachments: messageData.attachments || [],
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding RFI message:', error)
    throw new Error(`Failed to add RFI message: ${error.message}`)
  }

  return {
    id: data.id,
    authorId: data.author_id,
    authorName: data.author_name,
    authorRole: data.author_role as Role,
    message: data.message,
    createdAt: new Date(data.created_at),
    attachments: data.attachments || [],
  }
}

/**
 * Resolve an RFI
 *
 * @param id - The RFI ID
 * @returns The updated RFI
 */
export async function resolveRFI(id: string): Promise<RFI> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rfis')
    .update({
      status: 'RESOLVED' as RFIStatus,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(`
      *,
      rfi_messages(*)
    `)
    .single()

  if (error) {
    console.error('Error resolving RFI:', error)
    throw new Error(`Failed to resolve RFI: ${error.message}`)
  }

  return {
    id: data.id,
    applicationId: data.application_id,
    sectionKey: data.section_key,
    status: data.status as RFIStatus,
    assigneeRole: data.assignee_role as Role.APPLICANT | Role.BROKER,
    createdBy: data.created_by,
    createdAt: new Date(data.created_at),
    resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
    messages: (data.rfi_messages || [])
      .sort((a: { created_at: string }, b: { created_at: string }) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((msg: { id: string; author_id: string; author_name: string; author_role: string; message: string; created_at: string; attachments?: unknown[] }) => ({
        id: msg.id,
        authorId: msg.author_id,
        authorName: msg.author_name,
        authorRole: msg.author_role as Role,
        message: msg.message,
        createdAt: new Date(msg.created_at),
        attachments: msg.attachments || [],
      })),
  }
}

/**
 * Get all messages for an RFI
 *
 * @param rfiId - The RFI ID
 * @returns Array of messages
 */
export async function getRFIMessages(rfiId: string): Promise<RFIMessage[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rfi_messages')
    .select('*')
    .eq('rfi_id', rfiId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching RFI messages:', error)
    throw new Error(`Failed to fetch RFI messages: ${error.message}`)
  }

  return (data || []).map(msg => ({
    id: msg.id,
    authorId: msg.author_id,
    authorName: msg.author_name,
    authorRole: msg.author_role as Role,
    message: msg.message,
    createdAt: new Date(msg.created_at),
    attachments: msg.attachments || [],
  }))
}
