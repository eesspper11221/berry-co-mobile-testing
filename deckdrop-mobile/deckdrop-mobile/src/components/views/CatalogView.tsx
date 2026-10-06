import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { FilterOptions } from '../../types';
import {
  Search,
  SlidersHorizontal,
  X,
  Check,
  RotateCcw,
  ArrowUpDown,
} from 'lucide-react';
import { ProductCardItem } from './HomeView';

export const CatalogView: React.FC = () => {
  const {
    products,
    isProductsLoading,
    productsError,
    refreshProducts,
    filters,
    setFilters,
    resetFilters,
    navigateTo,
    addToCart,
    toggleWishlist,
    isWishlisted,
  } = useStore();

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const priceSliderMax = Math.max(30000, Math.ceil(Math.max(0, ...products.map((product) => product.price)) / 500) * 500);
  const categoryOptions = [...new Set(products.map((product) => product.category_name))].sort();
  const seriesOptions = [...new Set(products.map((product) => product.series).filter((value): value is string => Boolean(value)))].sort();
  const tagOptions = [...new Set(products.flatMap((product) => product.tags || []))].sort();
  const brandOptions = [...new Set(products.map((product) => product.brand).filter((value): value is string => Boolean(value)))].sort();

  // Active filter count calculation
  const activeFiltersCount =
    (filters.query ? 1 : 0) +
    filters.categories.length +
    filters.series.length +
    filters.brands.length +
    filters.tags.length +
    (filters.maxPrice < priceSliderMax ? 1 : 0) +
    (filters.availability.length > 0 ? 1 : 0);

  // Filter and sort items
  const filteredProducts = useMemo(() => {
    const query = filters.query.toLowerCase().trim();

    return products
      .filter((item) => {
        // Query match
        if (query) {
          const matchString = `${item.name} ${item.description} ${item.sku} ${item.category_name} ${item.series || ''} ${item.brand || ''}`.toLowerCase();
          if (!matchString.includes(query)) return false;
        }

        // Category match
        if (
          filters.categories.length > 0 &&
          !filters.categories.some((c) => c.toLowerCase() === item.category_name.toLowerCase())
        ) {
          return false;
        }

        // Series match
        if (
          filters.series.length > 0 &&
          !filters.series.some((s) => (item.series || '').toLowerCase().includes(s.toLowerCase()))
        ) {
          return false;
        }

        // Brand match
        if (
          filters.brands.length > 0 &&
          !filters.brands.some((b) => (item.brand || '').toLowerCase() === b.toLowerCase())
        ) {
          return false;
        }

        // Tags match
        if (
          filters.tags.length > 0 &&
          !filters.tags.some((t) => (item.tags || []).includes(t))
        ) {
          return false;
        }

        // Price range
        if (item.price > filters.maxPrice || item.price < filters.minPrice) {
          return false;
        }

        // Availability
        if (filters.availability.length > 0) {
          if (filters.availability.includes('in-stock') && item.stock === 0) return false;
          if (filters.availability.includes('pre-order') && !item.tags?.includes('Pre-Order')) {
            return false;
          }
          if (filters.availability.includes('on-sale') && !item.tags?.includes('Sale')) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'newest') return (b.created_at || '').localeCompare(a.created_at || '');
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, filters]);

  const toggleCategory = (cat: string) => {
    setFilters((prev) => {
      const exists = prev.categories.includes(cat);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== cat)
          : [...prev.categories, cat],
      };
    });
  };

  const toggleSeries = (ser: string) => {
    setFilters((prev) => {
      const exists = prev.series.includes(ser);
      return {
        ...prev,
        series: exists ? prev.series.filter((s) => s !== ser) : [...prev.series, ser],
      };
    });
  };

  const toggleTag = (tag: string) => {
    setFilters((prev) => {
      const exists = prev.tags.includes(tag);
      return {
        ...prev,
        tags: exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
      };
    });
  };

  const toggleBrand = (brand: string) => {
    setFilters((prev) => {
      const exists = prev.brands.includes(brand);
      return {
        ...prev,
        brands: exists ? prev.brands.filter((item) => item !== brand) : [...prev.brands, brand],
      };
    });
  };

  return (
    <div className="space-y-3.5 px-4 pt-3 pb-8">
      {/* 🔍 Search & Filter Trigger Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={filters.query}
            onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
            placeholder="Search catalog by name or SKU..."
            className="w-full bg-[#FAF5EB] border border-[#35322E]/15 rounded-2xl py-2.5 pl-10 pr-8 text-xs font-semibold text-[#35322E] placeholder-[#35322E]/45 focus:outline-none focus:border-[#E23B2E]"
          />
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#35322E]/50 pointer-events-none"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, query: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#35322E]/50 hover:text-[#35322E]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Drawer Button */}
        <button
          type="button"
          onClick={() => setIsFilterDrawerOpen(true)}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs ${
            activeFiltersCount > 0
              ? 'bg-[#E23B2E] text-white'
              : 'bg-[#FAF5EB] text-[#35322E] border border-[#35322E]/15 hover:bg-[#F3E4C8]'
          }`}
        >
          <SlidersHorizontal size={14} />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-[#E23B2E] text-[9px] font-black flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* 🏷️ Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.categories.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF5EB] text-[#35322E] text-[10px] font-bold border border-[#35322E]/15 shadow-2xs"
            >
              {c}
              <button onClick={() => toggleCategory(c)} className="hover:text-[#E23B2E]">
                <X size={11} />
              </button>
            </span>
          ))}

          {filters.series.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF5EB] text-[#35322E] text-[10px] font-bold border border-[#35322E]/15 shadow-2xs"
            >
              {s}
              <button onClick={() => toggleSeries(s)} className="hover:text-[#E23B2E]">
                <X size={11} />
              </button>
            </span>
          ))}

          {filters.brands.map((brand) => (
            <span
              key={brand}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF5EB] text-[#35322E] text-[10px] font-bold border border-[#35322E]/15 shadow-2xs"
            >
              {brand}
              <button onClick={() => toggleBrand(brand)} className="hover:text-[#E23B2E]">
                <X size={11} />
              </button>
            </span>
          ))}

          {filters.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF5EB] text-[#35322E] text-[10px] font-bold border border-[#35322E]/15 shadow-2xs"
            >
              #{t}
              <button onClick={() => toggleTag(t)} className="hover:text-[#E23B2E]">
                <X size={11} />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={resetFilters}
            className="text-[10px] font-bold text-[#E23B2E] underline ml-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* 📊 Sort Selector & Results Count */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-black text-[#35322E]">
          {isProductsLoading ? 'Loading collectibles…' : `${filteredProducts.length} Collectibles found`}
        </span>

        <div className="flex items-center gap-1 bg-[#FAF5EB] border border-[#35322E]/15 rounded-xl px-2.5 py-1">
          <ArrowUpDown size={12} className="text-[#35322E]/60" />
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sortBy: e.target.value as FilterOptions['sortBy'],
              }))
            }
            className="bg-transparent text-[11px] font-extrabold text-[#35322E] focus:outline-none cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* 📦 Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="my-4 space-y-3 rounded-2xl border border-[#35322E]/10 bg-[#FAF5EB] p-6 text-center">
          <p className="text-sm font-black text-[#35322E]">
            {isProductsLoading ? 'Loading products from Berry Co....' : productsError ? 'Products could not be loaded' : products.length === 0 ? 'No products are available yet' : 'No products match these filters'}
          </p>
          {productsError && <p role="alert" className="text-xs text-[#B82A20]">{productsError}</p>}
          {productsError ? (
            <button
              type="button"
              onClick={() => void refreshProducts()}
              className="rounded-full bg-[#E23B2E] px-4 py-2 text-xs font-black text-white"
            >
              Try again
            </button>
          ) : !isProductsLoading && products.length > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#E23B2E] px-4 py-2 text-xs font-black text-white"
            >
              <RotateCcw size={12} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((item) => (
            <ProductCardItem
              key={item.id}
              product={item}
              onSelect={() => navigateTo('product-detail', { productId: item.id })}
              onAddToCart={() => addToCart(item)}
              onToggleWishlist={() => toggleWishlist(item.id)}
              isWishlisted={isWishlisted(item.id)}
            />
          ))}
        </div>
      )}

      {/* 🎛️ Mobile Filter Bottom Sheet Modal */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-2xs">
          <div
            className="w-full max-w-md bg-[#FAF5EB] rounded-t-[2.5rem] p-5 shadow-2xl border-t border-[#35322E]/10 max-h-[85vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#35322E]/10 pb-3">
              <div>
                <h3 className="text-base font-black text-[#35322E]">Filter Collectibles</h3>
                <p className="text-[11px] font-semibold text-[#35322E]/60">
                  Refine by category, series & price
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F3E4C8] flex items-center justify-center text-[#35322E]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#35322E]">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((cat) => {
                  const isSelected = filters.categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
                        isSelected
                          ? 'bg-[#E23B2E] text-white'
                          : 'bg-[#F3E4C8] text-[#35322E] hover:bg-[#EAD0AA]'
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Series */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#35322E]">
                Series & Universe
              </label>
              <div className="flex flex-wrap gap-2">
                {seriesOptions.map((ser) => {
                  const isSelected = filters.series.includes(ser);
                  return (
                    <button
                      key={ser}
                      type="button"
                      onClick={() => toggleSeries(ser)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
                        isSelected
                          ? 'bg-[#E23B2E] text-white'
                          : 'bg-[#F3E4C8] text-[#35322E] hover:bg-[#EAD0AA]'
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{ser}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#35322E]">
                Tags & Status
              </label>
              <div className="flex flex-wrap gap-1.5">
                {tagOptions.map((tag) => {
                  const isSelected = filters.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition ${
                        isSelected
                          ? 'bg-[#35322E] text-white'
                          : 'bg-[#F3E4C8] text-[#35322E] hover:bg-[#EAD0AA]'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brands */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#35322E]">
                Brand
              </label>
              <div className="flex flex-wrap gap-2">
                {brandOptions.map((brand) => {
                  const isSelected = filters.brands.includes(brand);
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => toggleBrand(brand)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                        isSelected ? 'bg-[#E23B2E] text-white' : 'bg-[#F3E4C8] text-[#35322E] hover:bg-[#EAD0AA]'
                      }`}
                    >
                      {brand}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-[#35322E]">
                <span className="uppercase tracking-wider">Max Price</span>
                <span className="font-black text-[#E23B2E]">
                  ₱{Math.min(filters.maxPrice, priceSliderMax).toLocaleString('en-PH')}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max={priceSliderMax}
                step="500"
                value={Math.min(filters.maxPrice, priceSliderMax)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFilters((prev) => ({ ...prev, maxPrice: val }));
                }}
                className="w-full accent-[#E23B2E] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-bold text-[#35322E]/50">
                <span>₱500</span>
                <span>₱{Math.round(priceSliderMax / 2).toLocaleString('en-PH')}</span>
                <span>₱{priceSliderMax.toLocaleString('en-PH')}+</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                }}
                className="flex-1 py-3 rounded-full bg-[#F3E4C8] text-[#35322E] font-extrabold text-xs hover:bg-[#EAD0AA] transition"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-3 rounded-full bg-[#E23B2E] text-white font-extrabold text-xs hover:bg-[#B82A20] transition shadow-md"
              >
                Apply ({filteredProducts.length} items)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
