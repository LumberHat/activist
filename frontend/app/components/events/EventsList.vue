<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<template>
  <ul
    role="feed"
    ref="list"
    :aria-busy="busy"
    @keydown.ctrl.home.prevent="focusOutside('before')"
    @keydown.ctrl.end.prevent="focusOutside('after')"
  >
    <li
      v-for="(event, index) in events ?? []"
      :key="event.id"
      class="space-y-6 pb-6 pt-3 md:pt-4"
    >
      <article
        :ref="(element) => (cards[index] = element as HTMLElement | null)"
        :aria-label="event.name"
        :aria-setsize="events?.length || 0"
        @keydown.page-down.prevent="focusCard(index + 1)"
        @keydown.page-up.prevent="focusCard(index - 1)"
        tabindex="0"
      >
        <CardSearchResultEntityEvent :event="event" :isPrivate="false" />
      </article>
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{
  events?: CommunityEvent[];
  busy?: boolean;
}>();

import { useGetFocusableElements } from "~/composables/useGetFocusableElements";
const { getFocusableElements } = useGetFocusableElements();

const cards = ref<(HTMLElement | null)[]>([]);
const list = ref<HTMLElement | null>(null);

const focusCard = (index: number) => {
  const card = cards.value[index];
  if (!card) return;
  card.focus();
  card.scrollIntoView({ block: "center" });
};

const focusOutside = (direction: "after" | "before") => {
  const feed = list.value;
  if (!feed) return;
  const focusableElements = getFocusableElements().filter(
    (element) =>
      !feed.contains(element) &&
      (direction === "after"
        ? feed.compareDocumentPosition(element) &
          Node.DOCUMENT_POSITION_FOLLOWING
        : feed.compareDocumentPosition(element) &
          Node.DOCUMENT_POSITION_PRECEDING)
  );

  const target =
    direction === "after" ? focusableElements[0] : focusableElements.at(-1);
  target?.focus();
};
</script>
