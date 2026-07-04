import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardTitle, CardDescription } from "./card";
import { Badge, ShariaVerifiedBadge } from "./badge";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
};
export default meta;

type Story = StoryObj<typeof Card>;

export const ListingCard: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Boutique Amazon FBA</CardTitle>
        <CardDescription>Puériculture · 3 ans d&apos;ancienneté</CardDescription>
      </CardHeader>
      <div className="flex items-center gap-2">
        <Badge variant="royal">FBA</Badge>
        <ShariaVerifiedBadge />
      </div>
    </Card>
  ),
};
