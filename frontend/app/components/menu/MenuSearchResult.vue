<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<template>
  <div class="relative" @focusout="onFocusOut" @keydown.esc="closeTooltip">
    <button
      @click="toggleTooltip"
      :aria-label="
        t('i18n.components.menu_search_result.toggle_menu_aria_label')
      "
      class="style-cta relative flex size-8 items-center justify-center rounded-full elem-shadow-sm md:size-6"
      data-testid="menu-button"
    >
      <Icon :name="IconMap.DOTS_THREE_VERTICAL" size="1.25em" />
    </button>
    <TooltipMenuSearchResultEvent
      v-if="event"
      v-show="showTooltip"
      class="max-md:right-0 max-md:top-8 absolute lg:bottom-6 lg:left-4"
      :event="event"
    />
    <TooltipMenuSearchResultOrganization
      v-if="organization"
      v-show="showTooltip"
      class="max-md:right-0 max-md:top-8 absolute lg:bottom-6 lg:left-4"
      :organization="organization"
    />
    <TooltipMenuSearchResultGroup
      v-if="group"
      v-show="showTooltip"
      class="max-md:right-0 max-md:top-8 absolute lg:bottom-6 lg:left-4"
      :group="group"
    />
    <TooltipMenuSearchResultResource
      v-if="resource"
      v-show="showTooltip"
      class="max-md:right-0 max-md:top-8 absolute lg:bottom-6 lg:left-4"
      :resource="resource"
    />
    <TooltipMenuSearchResultUser
      v-if="user"
      v-show="showTooltip"
      class="max-md:right-0 max-md:top-8 absolute lg:bottom-6 lg:left-4"
      :user="user"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  organization?: Organization;
  group?: Group;
  event?: CommunityEvent;
  resource?: Resource;
  user?: UserActivist;
}>();

const { t } = useI18n();

const showTooltip = ref(false);

const toggleTooltip = () => {
  showTooltip.value = !showTooltip.value;
};

const closeTooltip = () => {
  showTooltip.value = false;
};

const onFocusOut = (element: FocusEvent) => {
  const container = element.currentTarget as HTMLElement;
  const next = element.relatedTarget as Node | null;
  // Focus moved to something outside the button and tooltip, or to nothing.
  if (!next || !container.contains(next)) {
    closeTooltip();
  }
};
</script>
