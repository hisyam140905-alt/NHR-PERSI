import { Link, useParams } from "react-router";
import { Calendar, User, ChevronLeft, Tag } from "lucide-react";
import { useData } from "../context/DataContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";

export function NewsPage() {
  const { news } = useData();
  const [activeCategory, setActiveCategory] = useState<string>("semua");

  const categories = [
    { value: "semua", label: "Semua" },
    { value: "berita", label: "Berita" },
    { value: "publikasi", label: "Publikasi" },
    { value: "regulasi", label: "Regulasi" },
    { value: "inovasi", label: "Inovasi" },
  ];

  const filtered = activeCategory === "semua" ? news : news.filter((n) => n.category === activeCategory);
  const featured = news.find((n) => n.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-[700] text-gray-900 mb-2">Berita & Publikasi</h1>
          <p className="text-gray-600">Berita terkini, publikasi, dan informasi seputar dunia kesehatan dan perumahsakitan Indonesia</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-lg text-sm font-[500] transition-colors ${
                activeCategory === cat.value
                  ? "bg-[#1E3A8A] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        {featured && activeCategory === "semua" && (
          <Link to={`/news/${featured.id}`} className="group block mb-10">
            <div className="grid md:grid-cols-2 gap-6 bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
              <div className="aspect-[16/10] overflow-hidden">
                <ImageWithFallback
                  src={featured.imageUrl}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <span className="inline-block w-fit px-2.5 py-1 bg-[#D97706]/10 text-[#D97706] text-xs font-[600] rounded-md mb-3 uppercase">
                  Featured &bull; {featured.category}
                </span>
                <h2 className="text-2xl font-[700] text-gray-900 mb-3 group-hover:text-[#1E3A8A] transition-colors leading-snug">
                  {featured.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{featured.author}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(featured.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* News Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <Link to={`/news/${item.id}`} key={item.id} className="group">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all h-full flex flex-col">
                <div className="aspect-[16/10] overflow-hidden">
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-[600] uppercase px-2 py-0.5 rounded ${
                      item.category === "berita" ? "bg-blue-100 text-blue-700" :
                      item.category === "publikasi" ? "bg-green-100 text-green-700" :
                      item.category === "regulasi" ? "bg-purple-100 text-purple-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-[600] text-gray-900 mb-2 group-hover:text-[#1E3A8A] transition-colors line-clamp-2 leading-snug flex-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto">
                    <span>{item.author || "Tim Redaksi PERSI"}</span>
                    <span>&bull;</span>
                    <span>{new Date(item.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada berita untuk kategori ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function NewsDetailPage() {
  const { id } = useParams();
  const { news } = useData();
  const article = news.find((n) => n.id === id);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Artikel tidak ditemukan.</p>
          <Link to="/news" className="text-[#1E3A8A] font-[600] hover:underline">Kembali ke Berita</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link to="/news" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1E3A8A] mb-6">
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Berita
        </Link>
        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-[600] uppercase mb-4 ${
          article.category === "berita" ? "bg-blue-100 text-blue-700" :
          article.category === "publikasi" ? "bg-green-100 text-green-700" :
          article.category === "regulasi" ? "bg-purple-100 text-purple-700" :
          "bg-orange-100 text-orange-700"
        }`}>
          {article.category}
        </span>
        <h1 className="text-3xl md:text-4xl font-[700] text-gray-900 mb-4 leading-tight">{article.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <span className="flex items-center gap-1"><User className="w-4 h-4" />{article.author || "Tim Redaksi PERSI"}</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
        <div className="rounded-xl overflow-hidden mb-8 aspect-[16/9]">
          <ImageWithFallback src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
        </div>
        <div className="prose max-w-none text-gray-700 leading-relaxed">
          {article.content.split("\n\n").map((paragraph, idx) => (
            <p key={idx} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
