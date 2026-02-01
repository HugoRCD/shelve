export interface CommandItem {
  id: string
  label: string
  icon: string
  isAvatar?: boolean
  description?: string
  suffix?: string
  action?: () => void | Promise<void>
  keywords?: string[]
  active?: boolean
  hasSubmenu?: boolean
}

export interface CommandGroup {
  id: string
  label: string
  items: CommandItem[]
  backAction?: () => void
}

export interface CommandProviderOptions {
  onClose?: () => void
}

export interface SubMenuState {
  active: boolean
  parentId: string
  title: string
  items: CommandItem[]
}
