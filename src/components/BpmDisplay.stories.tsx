import type { Meta, StoryObj } from '@storybook/react-vite'

import BpmDisplay from './BpmDisplay'

const meta = {
  title: 'Components/BpmDisplay',
  component: BpmDisplay,
  parameters: {
    layout: 'centered',
  },
  args: {
    bpm: 120,
    flashTick: 0,
    showBorder: true,
  },
} satisfies Meta<typeof BpmDisplay>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Flashing: Story = {
  args: {
    bpm: 132,
    flashTick: 1,
  },
}

export const Borderless: Story = {
  args: {
    bpm: 72,
    showBorder: false,
  },
}
