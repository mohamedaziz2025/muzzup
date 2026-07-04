import type { Meta, StoryObj } from "@storybook/react";
import { Badge, ShariaVerifiedBadge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  args: { children: "Shopify" },
  argTypes: {
    variant: {
      control: "select",
      options: ["neutral", "royal", "cyan", "success", "warning", "danger"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Neutral: Story = { args: { variant: "neutral" } };
export const Royal: Story = { args: { variant: "royal" } };
export const Cyan: Story = { args: { variant: "cyan" } };
export const Success: Story = { args: { variant: "success", children: "Publié" } };
export const Warning: Story = { args: { variant: "warning", children: "Sous audit" } };
export const Danger: Story = { args: { variant: "danger", children: "Rejeté" } };

export const ShariaVerified: StoryObj<typeof ShariaVerifiedBadge> = {
  render: () => <ShariaVerifiedBadge />,
};
