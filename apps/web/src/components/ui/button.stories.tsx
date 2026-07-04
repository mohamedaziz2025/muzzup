import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  args: { children: "Voir l'annonce" },
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "ghost", "gold"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Gold: Story = { args: { variant: "gold", children: "Débloquer" } };
export const Disabled: Story = { args: { variant: "primary", disabled: true } };
