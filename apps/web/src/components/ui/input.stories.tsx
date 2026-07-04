import type { Meta, StoryObj } from "@storybook/react";
import { Input, Label } from "./input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  args: { placeholder: "vous@exemple.com", type: "email" },
};
export default meta;

export const Default: StoryObj<typeof Input> = {};

export const WithLabel: StoryObj<typeof Input> = {
  render: (args) => (
    <div className="w-72">
      <Label htmlFor="story-input">Adresse email</Label>
      <Input id="story-input" {...args} />
    </div>
  ),
};
