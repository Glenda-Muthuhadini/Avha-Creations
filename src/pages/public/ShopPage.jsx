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
import ShopBenefits from '../../components/shop/ShopBenefits';
import { ShopEmptyState, ShopErrorState, ShopLoadingState } from '../../components/shop/ShopStates';
import Icon from '../../components/common/Icon';
import { EmptyState } from '../../components/common/States';

export default function ShopPage({ favoritesOnly = false }) {
  usePageTitle(favoritesOnly ? 'Favorites' : 'Shop handmade creations', 'Discover AVHA crochet bags, ruffle hats and beaded jewellery. Beautifully handcrafted, made to be you.');
  const { ids, storageError: wishlistError } = useWishlist();
  const favoriteIds = favoritesOnly ? ids : null;
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readShopFilters(params), [params]);
  const categoryResource = useResource(getShopCategories);
  const categories = useMemo(() => categoryPresentation(categoryResource.data || []), [categoryResource.data]);
  const load = useCallback(() => getShopProducts(filters, categoryResource.data, favoriteIds), [filters, categoryResource.data, favoriteIds]);
  const products = useResource(load, Boolean(categoryResource.data));
  const [additionalProducts, setAdditionalProducts] = useState([]);
  const [nextPage, setNextPage] = useState(filters.page + 1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const collection = useRef(null);
  const loadMoreSentinel = useRef(null);
  const loadMoreLocked = useRef(false);
  const requestId = useRef(0);
  const currentFilterKey = useMemo(() => JSON.stringify({ filters, favoriteIds }), [filters, favoriteIds]);
  const activeFilterKey = useRef(currentFilterKey);
  activeFilterKey.current = currentFilterKey;
  const { storageError: cartError } = useCart();
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const update = useCallback(next => setParams(writeShopFilters(next), { replace: true }), [setParams]);
  const clear = () => update({ ...readShopFilters(new URLSearchParams()), sort: filters.sort });
  const scrollToCollection = () => collection.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  const pages = Math.max(1, Math.ceil((products.data?.total || 0) / PAGE_SIZE));
  const visibleProducts = [...(products.data?.items || []), ...additionalProducts];
  const loadedCount = Math.max(0, (filters.page - 1) * PAGE_SIZE) + visibleProducts.length;
  const hasMore = Boolean(products.data && loadedCount < products.data.total);
  const loading = categoryResource.loading || products.loading || (!products.data && !products.error && !categoryResource.error);
  const error = categoryResource.error || products.error;
  const loadMore = useCallback(async () => {
    if (!products.data || loading || error || !hasMore || loadMoreLocked.current || activeFilterKey.current !== currentFilterKey) return;
    loadMoreLocked.current = true;
    const requestedFilterKey = currentFilterKey;
    const requestedPage = nextPage;
    const currentRequestId = ++requestId.current;
    setLoadingMore(true);
    setMoreError(null);
    try {
      const result = await getShopProducts({ ...filters, page: requestedPage }, categoryResource.data, favoriteIds);
      if (requestId.current !== currentRequestId || activeFilterKey.current !== requestedFilterKey) return;
      setAdditionalProducts(previous => [...previous, ...result.items]);
      setNextPage(requestedPage + 1);
    } catch (loadError) {
      if (requestId.current === currentRequestId && activeFilterKey.current === requestedFilterKey) {
        setMoreError(loadError);
        if (import.meta.env.DEV) console.warn('Additional shop products request failed', loadError);
      }
    } finally {
      if (requestId.current === currentRequestId) {
        loadMoreLocked.current = false;
        setLoadingMore(false);
      }
    }
  }, [products.data, loading, error, hasMore, currentFilterKey, nextPage, filters, categoryResource.data, favoriteIds]);
  useEffect(() => {
    requestId.current += 1;
    loadMoreLocked.current = false;
    setAdditionalProducts([]);
    setNextPage(filters.page + 1);
    setMoreError(null);
    setLoadingMore(false);
  }, [currentFilterKey, filters.page]);
  useEffect(() => {
    if (!hasMore || loading || error || moreError || !loadMoreSentinel.current) return undefined;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) loadMore();
    }, { rootMargin: '200px 0px' });
    observer.observe(loadMoreSentinel.current);
    return () => observer.disconnect();
  }, [hasMore, loading, error, moreError, loadMore]);
  useEffect(() => {
    if (products.data && !products.loading && filters.page > pages) update({ ...filters, page: pages });
  }, [products.data, products.loading, filters, pages, update]);
  useEffect(() => { if (error && import.meta.env.DEV) console.warn('Shop catalogue request failed', error); }, [error]);
  const retry = () => { if (categoryResource.error) categoryResource.retry(); else products.retry(); };
  return <div className="shop-page">{favoritesOnly ? <header className="container favorites-intro"><h1>Favorites</h1><p>The creations you love, saved in one place.</p></header> : <ShopHero />}
    <CategoryScroller categories={categories} selected={filters.categories} onSelect={slug => { update({ ...filters, categories: filters.categories.length === 1 && filters.categories[0] === slug ? [] : [slug], page: 1 }); scrollToCollection(); }} />
    <section ref={collection} id="all-creations" className="container shop-collection" aria-labelledby="collection-title">
      <aside className="shop-desktop-filters filter-panel" aria-label="Filter creations"><FilterControls filters={filters} categories={categories} onChange={update} onClear={clear} /></aside>
      <div className="shop-results"><header className="shop-toolbar"><div><h2 id="collection-title">{favoritesOnly ? 'Saved Creations' : 'All Creations'}</h2><p>Beautifully handcrafted. Made to be you.</p></div>
        <div className="shop-toolbar__controls"><button type="button" className="mobile-filter-trigger" aria-haspopup="dialog" aria-expanded={drawerOpen} onClick={() => { setDraft(filters); setDrawerOpen(true); }}><Icon name="filter" size={18} />Filters{hasShopFilters(filters) && <span className="filter-dot" />}</button>
          <label className="shop-sort">Sort by<select value={filters.sort} onChange={event => update({ ...filters, sort: event.target.value, page: 1 })}>{SORT_OPTIONS.map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></label>
        </div>
      </header>
      <div className="shop-result-meta"><p aria-live="polite">{loading ? 'Discovering your next favourite…' : error ? 'Collection temporarily unavailable' : `${Math.min(loadedCount, products.data?.total || 0)} of ${products.data?.total || 0} ${(products.data?.total || 0) === 1 ? 'creation' : 'creations'}`}</p>{hasShopFilters(filters) && <button type="button" className="filter-clear" onClick={clear}>Clear filters</button>}</div>
      {(cartError || wishlistError) && <p className="shop-notice" role="status">{cartError || wishlistError}</p>}
      {error ? <ShopErrorState retry={retry} /> : loading ? <ShopLoadingState /> : !products.data?.items.length ? favoritesOnly && !hasShopFilters(filters) ? <EmptyState title={ids.length ? 'Your saved creations are currently unavailable.' : 'Your favorites are waiting.'} to="/shop" action="Explore the shop">Tap the heart on a creation to save it here.</EmptyState> : <ShopEmptyState filtered={hasShopFilters(filters)} onClear={clear} /> : <>
        <ProductGrid products={visibleProducts} variant="shop" />
        {hasMore && <div className="shop-load-more"><div ref={loadMoreSentinel} className="shop-load-more__sentinel" aria-hidden="true" />{moreError && <p role="alert">We couldn’t load more creations. Please try again.</p>}<button type="button" className="button button--outline" onClick={loadMore} disabled={loadingMore}>{loadingMore ? 'Loading more…' : moreError ? 'Try again' : 'Load more creations'}</button></div>}
      </>}
      </div>
    </section>
    <ShopBenefits />
    <MobileFilterDrawer open={drawerOpen} onClose={closeDrawer} onApply={() => { update({ ...draft, page: 1 }); closeDrawer(); scrollToCollection(); }}><FilterControls filters={draft} categories={categories} onChange={setDraft} onClear={() => setDraft({ ...readShopFilters(new URLSearchParams()), sort: filters.sort })} /></MobileFilterDrawer>
  </div>;
}
