import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useResource } from '../../hooks/useResource';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getShopCategories, getShopProducts } from '../../services/shop';
import { categoryPresentation } from '../../data/shopCategories';
import { hasShopFilters, PAGE_SIZE, readShopFilters, SORT_OPTIONS, writeShopFilters } from '../../utils/shop';
import ShopHero from '../../components/shop/ShopHero';
import CategoryScroller from '../../components/shop/CategoryScroller';
import { FilterControls, MobileFilterDrawer } from '../../components/shop/ShopFilters';
import ProductGrid from '../../components/shop/ProductGrid';
import ShopPagination from '../../components/shop/ShopPagination';
import ShopBenefits from '../../components/shop/ShopBenefits';
import { ShopEmptyState, ShopErrorState, ShopLoadingState } from '../../components/shop/ShopStates';
import Icon from '../../components/common/Icon';

export default function ShopPage() {
  usePageTitle('Shop handmade creations', 'Discover AVHA crochet bags, ruffle hats and beaded jewellery. Beautifully handcrafted, made to be you.');
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readShopFilters(params), [params]);
  const categoryResource = useResource(getShopCategories);
  const categories = useMemo(() => categoryPresentation(categoryResource.data || []), [categoryResource.data]);
  const load = useCallback(() => getShopProducts(filters, categoryResource.data), [filters, categoryResource.data]);
  const products = useResource(load, Boolean(categoryResource.data));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const collection = useRef(null);
  const { storageError: cartError } = useCart();
  const { storageError: wishlistError } = useWishlist();
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const update = useCallback(next => setParams(writeShopFilters(next), { replace: true }), [setParams]);
  const clear = () => update({ ...readShopFilters(new URLSearchParams()), sort: filters.sort });
  const scrollToCollection = () => collection.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  const pages = Math.max(1, Math.ceil((products.data?.total || 0) / PAGE_SIZE));
  const loading = categoryResource.loading || products.loading || (!products.data && !products.error && !categoryResource.error);
  const error = categoryResource.error || products.error;
  useEffect(() => {
    if (products.data && !products.loading && filters.page > pages) update({ ...filters, page: pages });
  }, [products.data, products.loading, filters, pages, update]);
  useEffect(() => { if (error && import.meta.env.DEV) console.warn('Shop catalogue request failed', error); }, [error]);
  const retry = () => { if (categoryResource.error) categoryResource.retry(); else products.retry(); };
  return <div className="shop-page"><ShopHero />
    <CategoryScroller categories={categories} selected={filters.categories} onSelect={slug => { update({ ...filters, categories: filters.categories.length === 1 && filters.categories[0] === slug ? [] : [slug], page: 1 }); scrollToCollection(); }} />
    <section ref={collection} id="all-creations" className="container shop-collection" aria-labelledby="collection-title">
      <aside className="shop-desktop-filters filter-panel" aria-label="Filter creations"><FilterControls filters={filters} categories={categories} onChange={update} onClear={clear} /></aside>
      <div className="shop-results"><header className="shop-toolbar"><div><h2 id="collection-title">All Creations</h2><p>Beautifully handcrafted. Made to be you.</p></div>
        <div className="shop-toolbar__controls"><button type="button" className="mobile-filter-trigger" aria-haspopup="dialog" aria-expanded={drawerOpen} onClick={() => { setDraft(filters); setDrawerOpen(true); }}><Icon name="filter" size={18} />Filters{hasShopFilters(filters) && <span className="filter-dot" />}</button>
          <label className="shop-sort">Sort by<select value={filters.sort} onChange={event => update({ ...filters, sort: event.target.value, page: 1 })}>{SORT_OPTIONS.map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></label>
        </div>
      </header>
      <div className="shop-result-meta"><p aria-live="polite">{loading ? 'Discovering your next favourite…' : error ? 'Collection temporarily unavailable' : `${products.data?.total || 0} ${(products.data?.total || 0) === 1 ? 'creation' : 'creations'}${filters.page > 1 ? ` · Page ${filters.page} of ${pages}` : ''}`}</p>{hasShopFilters(filters) && <button type="button" className="filter-clear" onClick={clear}>Clear filters</button>}</div>
      {(cartError || wishlistError) && <p className="shop-notice" role="status">{cartError || wishlistError}</p>}
      {error ? <ShopErrorState retry={retry} /> : loading ? <ShopLoadingState /> : !products.data?.items.length ? <ShopEmptyState filtered={hasShopFilters(filters)} onClear={clear} /> : <>
        <ProductGrid products={products.data.items} variant="shop" />
        {products.data.preview && <p className="shop-preview-note">Handmade to order. Starting prices shown; contact AVHA to confirm your colours, details and availability.</p>}
        <ShopPagination page={filters.page} pages={pages} onChange={page => { update({ ...filters, page }); scrollToCollection(); }} />
      </>}
      </div>
    </section>
    <ShopBenefits />
    <MobileFilterDrawer open={drawerOpen} onClose={closeDrawer} onApply={() => { update({ ...draft, page: 1 }); closeDrawer(); scrollToCollection(); }}><FilterControls filters={draft} categories={categories} onChange={setDraft} onClear={() => setDraft({ ...readShopFilters(new URLSearchParams()), sort: filters.sort })} /></MobileFilterDrawer>
  </div>;
}
