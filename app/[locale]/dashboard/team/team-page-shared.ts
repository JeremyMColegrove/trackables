import { formatUserTimestamp } from "@/lib/date-time"

export type TeamMemberRow = {
  rowType: "member"
  id: string
  displayName: string | null
  primaryEmail: string | null
  imageUrl: string | null
  role: "owner" | "admin" | "member" | "viewer"
  roleLabel: string
  isOwner: boolean
  addedAt: string | null
}

export type PendingInvitationRow = {
  rowType: "invitation"
  id: string
  invitedDisplayName: string
  invitedEmail: string | null
  imageUrl: string | null
  invitedByDisplayName: string
  invitedByEmail: string
  role: "owner" | "admin" | "member" | "viewer"
  roleLabel: string
  status: "pending" | "accepted" | "rejected" | "revoked"
  createdAt: string
}

export type TeamAccessRow = TeamMemberRow | PendingInvitationRow

export type MyInvitationRow = {
  id: string
  workspaceId: string
  workspaceName: string
  workspaceSlug: string
  invitedByDisplayName: string
  invitedByEmail: string
  role: "owner" | "admin" | "member" | "viewer"
  roleLabel: string
  createdAt: string
}

export function getInitials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function getDisplayName(member: {
  displayName: string | null
  primaryEmail: string | null
}) {
  return member.displayName ?? member.primaryEmail ?? "Unknown user"
}

export function formatDateLabel(value: string) {
  return formatUserTimestamp(value)
}
