import { useQuery } from "@animaapp/playground-react-sdk";
import { Star, ArrowUpRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

const FALLBACK_REVIEWS = [
  { id: "r1", clientName: "Marc Tremblay", rating: "5", reviewText: "Aménagement Monzon transformed our backyard into a stunning outdoor living space. The team was professional, on-time, and the quality is outstanding.", serviceType: "Landscaping", featured: "yes", status: "approved", adminResponse: "" },
  { id: "r2", clientName: "Sophie Lavallee", rating: "5", reviewText: "They renovated our entire main floor in 3 weeks — without stress. Best contractor I've ever worked with. Five stars doesn't do it justice.", serviceType: "Renovation", featured: "yes", status: "approved", adminResponse: "" },
  { id: "r3", clientName: "Jean-Pierre Côté", rating: "5", reviewText: "Fast, reliable snow removal all season long. Never missed a single storm. Worth every penny for the peace of mind.", serviceType: "Snow Removal", featured: "yes", status: "approved", adminResponse: "" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={14} weight={s <= rating ? "fill" : "regular"} className={s <= rating ? "text-gold" : "text-gray-300"} />
      ))}
    </div>
  );
}

interface ReviewsSectionProps {
  limit?: number;
  showAll?: boolean;
}

export default function ReviewsSection({ limit = 3, showAll = true }: ReviewsSectionProps) {
  const { data: reviews } = useQuery("Review", { where: { status: "approved" }, orderBy: { createdAt: "desc" } });
  const all = reviews && reviews.length > 0 ? reviews : FALLBACK_REVIEWS;
  const featured = all.filter(r => r.featured === "yes").slice(0, limit);
  const displayList = featured.length > 0 ? featured : all.slice(0, limit);

  const avgRating = displayList.length > 0
    ? (displayList.reduce((s, r) => s + parseInt(r.rating ?? "5"), 0) / displayList.length).toFixed(1)
    : "5.0";

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <span className="section-eyebrow">What Clients Say</span>
            <h2 className="font-headline font-bold text-fluid-xl text-charcoal mt-2">Client Reviews</h2>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} size={16} weight="fill" className="text-gold" />)}
              </div>
              <span className="font-headline font-bold text-base text-charcoal">{avgRating}</span>
              <span className="font-sans text-xs text-gray-500">({all.length} reviews)</span>
            </div>
          </div>
          {showAll && (
            <Link to="/about" className="flex items-center gap-1.5 text-sm font-sans font-medium text-gold hover:text-gold-dark transition-colors">
              All Reviews <ArrowUpRight size={14} weight="bold" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayList.map(review => (
            <div key={review.id} className="group flex flex-col bg-white border border-gray-200 rounded-2xl p-6 hover:border-gold/30 hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                  {(review as any).clientPhoto ? (
                    <img src={(review as any).clientPhoto} alt={review.clientName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="font-headline font-bold text-sm text-gold">{review.clientName[0]}</span>
                  )}
                </div>
                <div>
                  <p className="font-sans font-semibold text-sm text-charcoal">{review.clientName}</p>
                  {(review as any).serviceType && (
                    <p className="font-mono text-[10px] text-gray-400">{(review as any).serviceType}</p>
                  )}
                </div>
                <div className="ml-auto">
                  <StarRating rating={parseInt(review.rating ?? "5")} />
                </div>
              </div>
              <p className="font-sans text-sm text-gray-600 leading-relaxed flex-1">"{review.reviewText}"</p>
              {(review as any).adminResponse && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl border-l-2 border-gold/30">
                  <p className="font-mono text-[9px] text-gray-400 mb-1 uppercase tracking-wider">Company Response</p>
                  <p className="font-sans text-xs text-gray-500">{(review as any).adminResponse}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
