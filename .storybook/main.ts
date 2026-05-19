import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.tsx'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/react-vite',
  async viteFinal(config) {
    return {
      ...config,
      plugins: config.plugins?.filter((plugin) => !plugin?.name?.includes('vite-plugin-pwa')),
    }
  },
}

export default config
