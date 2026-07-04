"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import {
  useProvider,
  useProviderReviews,
  useCreateReview,
  useContactProvider,
  useSponsorProvider,
} from "@/lib/hooks/use-providers";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

export default function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const router = useRouter();
  const { data } = useProvider(id);
  const { data: reviewsData } = useProviderReviews(id);
  const contactProvider = useContactProvider();
  const sponsorProvider = useSponsorProvider(id);
  const createReview = useCreateReview(id);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!data) return null;
  const { provider } = data;
  const isOwner = user?.id === provider.userId;

  async function handleContact() {
    await contactProvider.mutateAsync(id);
    router.push("/messages");
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center gap-2">
        {provider.isSponsored && <Badge variant="cyan">Mis en avant</Badge>}
        {provider.ratingCount > 0 && (
          <Badge variant="royal">
            ★ {provider.ratingAverage.toFixed(1)} ({provider.ratingCount} avis)
          </Badge>
        )}
      </div>
      <h1 className="mt-4 font-display text-3xl font-bold text-primary">{provider.tagline}</h1>
      <p className="mt-2 font-mono text-cyan">{provider.pricingIndication}</p>
      <p className="mt-4 whitespace-pre-line text-secondary">{provider.bio}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {provider.specialties.map((s) => (
          <Badge key={s} variant="neutral">
            {s}
          </Badge>
        ))}
      </div>

      {provider.portfolio.length > 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {provider.portfolio.map((item) => (
            <Card key={item.title}>
              <p className="font-medium text-primary">{item.title}</p>
              {item.description && <p className="mt-1 text-sm text-secondary">{item.description}</p>}
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 flex gap-4">
        {isOwner ? (
          <Button variant="gold" disabled={sponsorProvider.isPending} onClick={() => sponsorProvider.mutate()}>
            Mettre en avant — 49€/30 jours
          </Button>
        ) : (
          <Button className="glow-royal-hover" disabled={contactProvider.isPending} onClick={handleContact}>
            Contacter
          </Button>
        )}
      </div>

      <h2 className="mt-12 font-display text-xl font-semibold text-primary">Avis</h2>
      <div className="mt-4 space-y-3">
        {reviewsData?.reviews.map((review) => (
          <Card key={review._id}>
            <p className="text-sm text-cyan">{"★".repeat(review.rating)}</p>
            <p className="mt-1 text-sm text-secondary">{review.comment}</p>
          </Card>
        ))}
        {reviewsData?.reviews.length === 0 && (
          <p className="text-sm text-secondary">Aucun avis pour le moment.</p>
        )}
      </div>

      {!isOwner && user && (
        <Card className="mt-6">
          <p className="text-sm font-medium text-primary">Laisser un avis post-mission</p>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="mt-2 h-11 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-3 text-sm text-primary"
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {"★".repeat(r)}
              </option>
            ))}
          </select>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-4 py-3 text-sm text-primary focus:border-cyan focus:outline-none"
            placeholder="Décrivez votre expérience avec ce prestataire..."
          />
          <Button
            className="mt-3"
            variant="secondary"
            disabled={comment.trim().length < 10 || createReview.isPending}
            onClick={() => createReview.mutate({ rating, comment })}
          >
            Publier l&apos;avis
          </Button>
        </Card>
      )}
    </div>
  );
}
