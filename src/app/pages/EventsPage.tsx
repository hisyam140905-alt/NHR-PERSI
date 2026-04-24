import { Calendar, MapPin, ExternalLink, Clock } from "lucide-react";
import { useData } from "../context/DataContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Button } from "../components/ui/button";
import { useState } from "react";

export function EventsPage() {
  const { events } = useData();
  const [filter, setFilter] = useState<string>("semua");

  const now = new Date();
  const upcoming = events
    .filter((e) => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const past = events
    .filter((e) => new Date(e.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const typeFilters = [
    { value: "semua", label: "Semua" },
    { value: "congress", label: "Congress" },
    { value: "workshop", label: "Workshop" },
    { value: "seminar", label: "Seminar" },
    { value: "webinar", label: "Webinar" },
  ];

  const filterFn = (list: typeof events) =>
    filter === "semua" ? list : list.filter((e) => e.type === filter);

  const typeColor = (type: string) => {
    switch (type) {
      case "congress": return "bg-[#1E3A8A] text-white";
      case "workshop": return "bg-[#0D9488] text-white";
      case "seminar": return "bg-[#D97706] text-white";
      case "webinar": return "bg-purple-600 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1E3A8A] to-[#0D9488] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-[700] mb-2">Events PERSI</h1>
          <p className="text-white/80">Seminar, workshop, congress, dan kegiatan PERSI mendatang</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {typeFilters.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`px-4 py-2 rounded-lg text-sm font-[500] transition-colors ${
                filter === t.value
                  ? "bg-[#1E3A8A] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Featured Events */}
        {filter === "semua" && (
          <div className="mb-10">
            {events.filter((e) => e.featured && new Date(e.date) >= now).map((event) => (
              <div key={event.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                <div className="grid md:grid-cols-2">
                  <div className="aspect-[16/10] md:aspect-auto overflow-hidden">
                    <ImageWithFallback
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-[600] ${typeColor(event.type)}`}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </span>
                      <span className="px-2.5 py-1 rounded-md text-xs font-[600] bg-[#D97706]/10 text-[#D97706]">
                        Featured
                      </span>
                    </div>
                    <h2 className="text-2xl font-[700] text-gray-900 mb-3">{event.title}</h2>
                    <p className="text-gray-600 mb-4 leading-relaxed">{event.description}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {new Date(event.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    
                    {/* ✅ TOMBOL DAFTAR SEKARANG YANG SUDAH DIPERBARUI */}
                    {event.registrationUrl && event.registrationUrl !== "#" && (
                      <Button 
                        className="w-fit bg-[#1E3A8A] hover:bg-[#1a3278] font-[600]"
                        onClick={() => window.open(event.registrationUrl, "", "noopener,noreferrer")}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Daftar Sekarang
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming Events */}
        {filterFn(upcoming).length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-[700] text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0D9488]" />
              Event Mendatang
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterFn(upcoming).map((event) => (
                <EventCard key={event.id} event={event} typeColor={typeColor} />
              ))}
            </div>
          </div>
        )}

        {/* Past Events */}
        {filterFn(past).length > 0 && (
          <div>
            <h2 className="text-xl font-[700] text-gray-900 mb-4 text-gray-400">Event Sebelumnya</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
              {filterFn(past).map((event) => (
                <EventCard key={event.id} event={event} typeColor={typeColor} isPast />
              ))}
            </div>
          </div>
        )}

        {filterFn(upcoming).length === 0 && filterFn(past).length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada event untuk kategori ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({
  event,
  typeColor,
  isPast,
}: {
  event: { id: string; title: string; description: string; date: string; endDate?: string; location: string; type: string; imageUrl: string; registrationUrl?: string };
  typeColor: (type: string) => string;
  isPast?: boolean;
}) {
  const dateObj = new Date(event.date);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">
      <div className="relative h-40 overflow-hidden">
        <ImageWithFallback src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-md text-xs font-[600] ${typeColor(event.type)}`}>
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </span>
        </div>
        {/* Date Badge */}
        <div className="absolute top-3 right-3 bg-white rounded-lg px-3 py-2 text-center shadow-md">
          <div className="text-xl font-[700] text-[#1E3A8A] leading-none">{dateObj.getDate()}</div>
          <div className="text-[10px] text-gray-500 font-[600] uppercase">{dateObj.toLocaleDateString("id-ID", { month: "short" })}</div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-[600] text-gray-900 mb-2 line-clamp-2 leading-snug">{event.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{event.description}</p>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{event.location}</span>
        </div>
        {!isPast && event.registrationUrl && event.registrationUrl !== "#" && (
          <Button 
            size="sm" 
            className="mt-4 w-full bg-[#1E3A8A] hover:bg-[#1a3278] font-[600] text-xs"
            onClick={() => window.open(event.registrationUrl, "_blank", "noopener,noreferrer")}
          >
            Daftar
          </Button>
        )}
      </div>
    </div>
  );
}
