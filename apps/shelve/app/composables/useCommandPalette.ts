import type { CommandGroup, CommandItem, CommandProviderOptions } from '@types'

export function useCommandPalette(
  searchQuery: Ref<string>,
  commandGroups: Ref<CommandGroup[]>,
  options: CommandProviderOptions = {}
) {
  const selectedIndex = ref(0)
  const scrollContainerRef = ref<HTMLElement | null>(null)

  // Filter commands based on search query
  const filteredCommandGroups = computed(() => {
    if (!searchQuery.value) {
      return commandGroups.value
    }

    const searchLower = searchQuery.value.toLowerCase()

    return commandGroups.value.map(group => {
      const filteredItems = group.items.filter(item => {
        if (item.label.toLowerCase().includes(searchLower)) {
          return true
        }

        if (item.keywords?.some(keyword => keyword.toLowerCase().includes(searchLower))) {
          return true
        }

        return !!(item.description && item.description.toLowerCase().includes(searchLower))
      })

      return {
        ...group,
        items: filteredItems,
      }
    }).filter(group => group.items.length > 0)
  })

  // Flatten all filtered items for easier navigation
  const allFilteredItems = computed<CommandItem[]>(() => {
    return filteredCommandGroups.value.flatMap(group => group.items)
  })

  // Get global index from group and item indices
  const getItemGlobalIndex = (groupIndex: number, itemIndex: number): number => {
    let globalIndex = 0
    for (let i = 0; i < groupIndex; i++) {
      globalIndex += filteredCommandGroups.value[i]?.items.length || 0
    }
    return globalIndex + itemIndex
  }

  // Scroll to keep selected item visible
  const scrollToSelectedItem = () => {
    nextTick(() => {
      const selectedElement = document.querySelector('.command-item.selected')
      if (selectedElement && scrollContainerRef.value) {
        const container = scrollContainerRef.value
        const containerRect = container.getBoundingClientRect()
        const elementRect = selectedElement.getBoundingClientRect()

        if (elementRect.bottom > containerRect.bottom) {
          // Element is below the visible area
          const scrollOffset = elementRect.bottom - containerRect.bottom + 8
          container.scrollTop += scrollOffset
        } else if (elementRect.top < containerRect.top) {
          // Element is above the visible area
          const scrollOffset = elementRect.top - containerRect.top - 8
          container.scrollTop += scrollOffset
        }
      }
    })
  }

  // Navigation handlers
  const navigateUp = () => {
    if (selectedIndex.value > 0) {
      selectedIndex.value--
    } else {
      selectedIndex.value = allFilteredItems.value.length - 1
    }
    scrollToSelectedItem()
  }

  const navigateDown = () => {
    if (selectedIndex.value < allFilteredItems.value.length - 1) {
      selectedIndex.value++
    } else {
      selectedIndex.value = 0
    }
    scrollToSelectedItem()
  }

  const selectCurrentItem = async () => {
    if (allFilteredItems.value.length > 0) {
      const item = allFilteredItems.value[selectedIndex.value]
      if (item?.action) {
        await item.action()

        // Only close if it's not a submenu item
        if (!item.hasSubmenu && options.onClose) {
          options.onClose()
        }
      }
    }
  }

  // Reset selection when search changes
  watch(searchQuery, () => {
    selectedIndex.value = 0
    nextTick(() => {
      if (scrollContainerRef.value) {
        scrollContainerRef.value.scrollTop = 0
      }
    })
  })

  // Reset scroll when command groups change
  watch(commandGroups, () => {
    selectedIndex.value = 0
    nextTick(() => {
      if (scrollContainerRef.value) {
        scrollContainerRef.value.scrollTop = 0
      }
    })
  }, { deep: true })

  return {
    selectedIndex,
    scrollContainerRef,
    filteredCommandGroups,
    allFilteredItems,
    getItemGlobalIndex,
    navigateUp,
    navigateDown,
    selectCurrentItem,
    scrollToSelectedItem
  }
}
