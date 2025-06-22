<template>
  <div>
    <Header />
    <UMain>
      <UContainer>
        <UPage>
          <slot />
        </UPage>
      </UContainer>
    </UMain>
    <LayoutFooter />
  </div>
</template>
