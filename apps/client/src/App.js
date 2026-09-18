import React, { useState, useEffect, useCallback } from 'react';
import { BackgroundEffects } from './components/layout/BackgroundEffects';
import { Navbar } from './components/layout/Navbar';
import { SearchHero } from './components/search/SearchHero';
import { SearchResults } from './components/search/SearchResults';
import { ProductCatalog } from './components/products/ProductCatalog';
import { ProductDetail } from './components/detail/ProductDetail';
import { ProductCompare } from './components/compare/ProductCompare';
import { ProductSelectorModal } from './components/common/ProductSelectorModal';
import { ToastContainer } from './components/common/Toast';
import { searchProductsApi } from './services/api';
import './index.css';

export function App() {
  const [currentPage, setCurrentPage] = useState('search');
  const [previousPage, setPreviousPage] = useState('search');
  const [currentDetailModel, setCurrentDetailModel] = useState(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchMode, setSearchMode] = useState(null); // 'hybrid' | 'keyword' | 'semantic'
  const [searchError, setSearchError] = useState(null); // null | { type, message }
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Compare State
  const [compareList, setCompareList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSlot, setModalSlot] = useState(0);

  // Toast State
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, title, desc) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, desc }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Welcome toast on load
  useEffect(() => {
    const timer = setTimeout(() => {
      showToast('info', 'Welcome', 'Describe what you need to find the right Campbell product');
    }, 500);
    return () => clearTimeout(timer);
  }, [showToast]);

  // Search Handler
  const handleRunSearch = async (query) => {
    if (!query) return;
    setSearchQuery(query);
    setHasSearched(true);
    setIsSearching(true);
    setSearchError(null);
    setSearchMode(null);
    setCurrentPage('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Call Backend API — returns { query, mode, results } or { error, message }
    const response = await searchProductsApi(query);

    if (response && response.error) {
      setSearchResults([]);
      setSearchError(response);
    } else if (response && response.results) {
      setSearchResults(response.results);
      setSearchMode(response.mode);
    } else {
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const handleEditSearch = () => {
    setHasSearched(false);
    setSearchError(null);
    setSearchMode(null);
  };

  // View Detail
  const handleViewDetail = (model) => {
    setPreviousPage(currentPage === 'detail' ? previousPage : currentPage);
    setCurrentDetailModel(model);
    setCurrentPage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDetail = () => {
    setCurrentPage(previousPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Compare Handlers
  const isInCompare = (model) => compareList.includes(model);

  const handleToggleCompare = (model) => {
    if (isInCompare(model)) {
      setCompareList((prev) => prev.filter((m) => m !== model));
      showToast('info', 'Removed from compare', `${model} removed`);
    } else {
      if (compareList.length >= 2) {
        showToast(
          'error',
          'Compare limit reached',
          'You can compare up to 2 products. Remove one before adding another.'
        );
        return;
      }
      setCompareList((prev) => [...prev, model]);
      showToast('success', 'Added to compare', `${model} added · ${compareList.length + 1}/2 selected`);
    }
  };

  const handleRemoveFromCompare = (model) => {
    setCompareList((prev) => prev.filter((m) => m !== model));
    showToast('info', 'Removed from compare', `${model} removed`);
  };

  const handleClearCompare = () => {
    setCompareList([]);
    showToast('info', 'Compare cleared', 'All products removed');
  };

  const handleOpenAddModal = (slot) => {
    setModalSlot(slot);
    setModalOpen(true);
  };

  const handleOpenReplaceModal = (slot) => {
    setModalSlot(slot);
    setModalOpen(true);
  };

  const handleSelectProductInModal = (model) => {
    const otherSlot = 1 - modalSlot;
    if (compareList[otherSlot] === model) {
      // Swap
      const updated = [...compareList];
      const temp = updated[modalSlot];
      updated[modalSlot] = updated[otherSlot];
      updated[otherSlot] = temp;
      setCompareList(updated);
    } else {
      const updated = [...compareList];
      updated[modalSlot] = model;
      setCompareList(updated);
    }
    setModalOpen(false);
    showToast('success', 'Product selected', `${model} added to comparison`);
  };

  return (
    <div className="app-container">
      <BackgroundEffects />

      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        compareCount={compareList.length}
      />

      <main className="main">
        {/* Search Page */}
        {currentPage === 'search' && (
          <section className="page active" id="page-search">
            {!hasSearched ? (
              <SearchHero onSearch={handleRunSearch} />
            ) : (
              <SearchResults
                query={searchQuery}
                results={searchResults}
                mode={searchMode}
                searchError={searchError}
                isLoading={isSearching}
                onEditSearch={handleEditSearch}
                onViewDetail={handleViewDetail}
                onToggleCompare={handleToggleCompare}
                isInCompare={isInCompare}
              />
            )}
          </section>
        )}

        {/* Products Page */}
        {currentPage === 'products' && (
          <ProductCatalog
            onViewDetail={handleViewDetail}
            onToggleCompare={handleToggleCompare}
            isInCompare={isInCompare}
          />
        )}

        {/* Detail Page */}
        {currentPage === 'detail' && (
          <ProductDetail
            model={currentDetailModel}
            previousPage={previousPage}
            onBack={handleBackFromDetail}
            onToggleCompare={handleToggleCompare}
            isInCompare={isInCompare}
            onSelectProduct={handleViewDetail}
          />
        )}

        {/* Compare Page */}
        {currentPage === 'compare' && (
          <ProductCompare
            compareList={compareList}
            onOpenAddModal={handleOpenAddModal}
            onOpenReplaceModal={handleOpenReplaceModal}
            onRemoveFromCompare={handleRemoveFromCompare}
            onClearCompare={handleClearCompare}
            onNavigate={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      <ProductSelectorModal
        isOpen={modalOpen}
        modalSlot={modalSlot}
        compareList={compareList}
        onClose={() => setModalOpen(false)}
        onSelectProduct={handleSelectProductInModal}
      />

      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default App;
