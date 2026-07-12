"use client";

import { useState, type FormEvent } from "react";

interface Review {
  id: string;
  reviewer: string;
  review: string;
  rating: number;
  verified: boolean;
}

interface ProductReviewsProps {
  productSlug: string;
  initialReviews: Review[];
}

export function ProductReviews({ productSlug, initialReviews }: ProductReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [status, setStatus] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("Enviando tu resena...");

    const response = await fetch(`/api/productos/${productSlug}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviewer: form.get("reviewer"),
        email: form.get("email"),
        rating,
        review: form.get("review"),
      }),
    });
    const payload = await response.json().catch(() => ({})) as { message?: string; review?: Review };

    setStatus(payload.message ?? (response.ok ? "Resena enviada." : "No pudimos enviar la resena."));
    if (response.ok && payload.review) {
      setReviews((current) => [payload.review!, ...current]);
      event.currentTarget.reset();
      setRating(5);
    }
  };

  return (
    <section className="mt-14 rounded-[2rem] bg-white/72 p-5 shadow-soft md:mt-20 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Opiniones de familias</span>
          <h2 className="mt-2 font-headline text-2xl font-extrabold text-on-surface md:text-3xl">
            Familias que ya eligieron Minifimy
          </h2>
        </div>
        <div className="rounded-full bg-[#f7efe3] px-4 py-2 text-sm font-bold text-secondary">
          {reviews.length ? `${average.toFixed(1)} / 5` : "Sin resenas aun"}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-[1.5rem] bg-[#fbf4ea] p-5">
              <div className="mb-3 flex text-secondary" aria-label={`${review.rating} estrellas`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index} className="material-symbols-outlined text-base" style={{ fontVariationSettings: index < review.rating ? "'FILL' 1" : "'FILL' 0" }}>
                    star
                  </span>
                ))}
              </div>
              <p className="text-sm leading-6 text-on-surface-variant">“{review.review}”</p>
              <p className="mt-4 text-sm font-bold text-on-surface">{review.reviewer}</p>
              {review.verified && <p className="mt-1 text-xs font-bold text-primary">Compra verificada</p>}
            </article>
          ))}
          {reviews.length === 0 && (
            <div className="rounded-[1.5rem] bg-[#fbf4ea] p-5 text-sm leading-6 text-on-surface-variant">
              Todavia no hay opiniones publicadas para este producto. Podes dejar la primera.
            </div>
          )}
        </div>

        <form onSubmit={submitReview} className="rounded-[1.5rem] bg-[#efe4d0] p-5 shadow-soft">
          <h3 className="font-headline text-xl font-extrabold text-on-surface">Dejar una resena</h3>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">La revisamos antes de publicarla para cuidar la comunidad.</p>
          <div className="mt-5 space-y-3">
            <input name="reviewer" required placeholder="Tu nombre" className="w-full rounded-full bg-white/82 px-5 py-3 text-sm outline-none" />
            <input name="email" type="email" required placeholder="Email" className="w-full rounded-full bg-white/82 px-5 py-3 text-sm outline-none" />
            <div className="rounded-[1.3rem] bg-white/82 px-5 py-4">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">Tu puntuacion</span>
              <div className="flex items-center gap-1" role="radiogroup" aria-label="Puntuacion de la resena">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="rounded-full p-1 text-secondary transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      role="radio"
                      aria-checked={rating === value}
                      aria-label={`${value} ${value === 1 ? "estrella" : "estrellas"}`}
                    >
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: value <= rating ? "'FILL' 1" : "'FILL' 0" }}>
                        star
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <textarea name="review" required minLength={8} placeholder="Contanos como fue la experiencia" className="min-h-28 w-full rounded-[1.3rem] bg-white/82 px-5 py-4 text-sm outline-none" />
          </div>
          <button className="mt-4 w-full rounded-full bg-primary py-3 font-bold text-on-primary">Enviar resena</button>
          {status && <p className="mt-4 rounded-[1rem] bg-white/70 p-3 text-sm font-semibold text-primary">{status}</p>}
        </form>
      </div>
    </section>
  );
}
