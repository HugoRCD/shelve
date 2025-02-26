export interface CommandItem {
  id: string
  label: string
  icon: string
  isAvatar?: boolean
  description?: string
  action: () => void | Promise<void>
  keywords?: string[]
  active?: boolean
}

export interface CommandGroup {
  id: string
  label: string
  items: CommandItem[]
}

export interface CommandProviderOptions {
  onClose?: () => void
}
