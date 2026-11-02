import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { gameApi, type CosmeticItemResponse } from '../../api/game';
import confetti from 'canvas-confetti';

export const MarketView: React.FC = () => {
  const { gameWallet, refreshWallet } = useApp();
  const [items, setItems] = useState<CosmeticItemResponse[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'citadel_skin' | 'academy_skin' | 'path_style' | 'water_feature' | 'nova_accessory'>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const loadMarket = useCallback(async () => {
    try {
      const data = await gameApi.getShopItems();
      setItems(data);
    } catch {
      // Offline fallback
    }
  }, []);

  useEffect(() => {
    loadMarket();
  }, [loadMarket]);

  const handlePurchase = async (item: CosmeticItemResponse) => {
    if (gameWallet.coin_balance < item.price_coins) {
      setStatusMessage({
        text: `Insufficient coins! You need ${item.price_coins} coins, but have ${gameWallet.coin_balance}.`,
        isError: true,
      });
      return;
    }

    try {
      setIsProcessing(item.item_id);
      setStatusMessage(null);
      await gameApi.purchaseCosmetic(item.item_id);
      confetti({ particleCount: 50, spread: 60 });
      await refreshWallet();
      await loadMarket();
      setStatusMessage({
        text: `Successfully unlocked and equipped ${item.name}!`,
        isError: false,
      });
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Purchase failed', isError: true });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleEquip = async (itemId: string) => {
    try {
      setIsProcessing(itemId);
      await gameApi.equipCosmetic(itemId);
      await loadMarket();
      setStatusMessage({ text: 'Cosmetic equipped!', isError: false });
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Equip failed', isError: true });
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredItems =
    activeFilter === 'all' ? items : items.filter((i) => i.item_type === activeFilter);

  return (
    <div className="relative w-full px-4 sm:px-6 lg:px-8 pt-6 pb-20 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-kingdom-gold text-[20px]">storefront</span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              The Kingdom Market
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-serif">
            Architectural Customisation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customise your Knowledge Citadel, campus paths, and Nova companion using coins earned from genuine study.
          </p>
        </div>

        {/* Coin Balance Pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-kingdom-gold/15 border border-kingdom-gold/30 shadow-xs self-start sm:self-auto">
          <span className="material-symbols-outlined text-kingdom-gold text-[22px]">monetization_on</span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
              Your Coins
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono leading-tight">
              {gameWallet.coin_balance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Philosophy Callout */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-kingdom-navy-card border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <span className="text-xl">✨</span>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          <strong>Honest Economy:</strong> Coins can only be spent on visual realm cosmetics. No pay-to-win items, no artificial cooldown skips, and no real-money purchases. Mastery cannot be bought.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-xs font-bold ${
            statusMessage.isError
              ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300 border border-red-200'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { key: 'all', label: 'All Items' },
          { key: 'citadel_skin', label: 'Citadel Spires' },
          { key: 'academy_skin', label: 'Academy Styles' },
          { key: 'path_style', label: 'Walkways & Runes' },
          { key: 'water_feature', label: 'Gardens & Water' },
          { key: 'nova_accessory', label: 'Nova Accessories' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === tab.key
                ? 'bg-kingdom-violet text-white shadow-xs'
                : 'bg-white dark:bg-kingdom-navy-card text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-kingdom-violet'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Catalogue Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.item_id}
            className="p-5 rounded-2xl bg-white dark:bg-kingdom-navy-card border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
          >
            <div>
              {/* Preview Accent Badge */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: `${item.preview_accent}20` }}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ color: item.preview_accent }}
                  >
                    palette
                  </span>
                </div>
                {item.is_equipped ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-kingdom-emerald/15 text-kingdom-emerald border border-kingdom-emerald/30">
                    Equipped ✓
                  </span>
                ) : item.is_unlocked ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                    Unlocked
                  </span>
                ) : (
                  <div className="flex items-center gap-1 text-xs font-bold text-kingdom-gold font-mono">
                    <span className="material-symbols-outlined text-[15px]">monetization_on</span>
                    <span>{item.price_coins}</span>
                  </div>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-kingdom-violet transition-colors">
                {item.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              {item.is_equipped ? (
                <button
                  disabled
                  className="w-full py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default"
                >
                  Active on Island
                </button>
              ) : item.is_unlocked ? (
                <button
                  onClick={() => handleEquip(item.item_id)}
                  disabled={isProcessing === item.item_id}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-kingdom-violet text-white hover:bg-kingdom-violet-light transition-all active:scale-98"
                >
                  {isProcessing === item.item_id ? 'Equipping...' : 'Equip Cosmetic'}
                </button>
              ) : (
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={isProcessing === item.item_id || gameWallet.coin_balance < item.price_coins}
                  className={`w-full py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                    gameWallet.coin_balance >= item.price_coins
                      ? 'bg-kingdom-gold hover:bg-kingdom-gold-light text-slate-950 font-extrabold active:scale-98'
                      : 'bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>
                    {isProcessing === item.item_id
                      ? 'Unlocking...'
                      : gameWallet.coin_balance >= item.price_coins
                      ? `Unlock for ${item.price_coins} Coins`
                      : `Need ${item.price_coins - gameWallet.coin_balance} More Coins`}
                  </span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
