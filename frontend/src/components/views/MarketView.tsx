import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { gameApi, type CosmeticItemResponse } from '../../api/game';
import confetti from 'canvas-confetti';

const FALLBACK_COSMETIC_CATALOGUE: CosmeticItemResponse[] = [
  {
    item_id: 'skin_citadel_royal_amethyst',
    name: 'Royal Amethyst Citadel',
    description: 'A luminescent violet and indigo gemstone spire skin for your Knowledge Citadel.',
    item_type: 'citadel_skin',
    price_coins: 100,
    is_unlocked: false,
    is_equipped: false,
    preview_accent: '#7869DE',
  },
  {
    item_id: 'skin_citadel_celestial_cyan',
    name: 'Celestial Cyan Outpost',
    description: 'Crystalline teal and cyan energy arches with glowing perimeter beacons.',
    item_type: 'citadel_skin',
    price_coins: 120,
    is_unlocked: false,
    is_equipped: false,
    preview_accent: '#54CFE0',
  },
  {
    item_id: 'skin_citadel_obsidian_forge',
    name: 'Obsidian Architect Spire',
    description: 'A monolithic volcanic glass tower with pulsating molten golden energy channels.',
    item_type: 'citadel_skin',
    price_coins: 150,
    is_unlocked: false,
    is_equipped: false,
    preview_accent: '#F2BD58',
  },
  {
    item_id: 'skin_academy_emerald_atrium',
    name: 'Emerald Atrium Academy',
    description: 'Lush hanging gardens and ivy-covered botanical reading spires.',
    item_type: 'academy_skin',
    price_coins: 80,
    is_unlocked: false,
    is_equipped: false,
    preview_accent: '#58B995',
  },
  {
    item_id: 'skin_academy_quantum_lecture',
    name: 'Quantum Glass Lecture Hall',
    description: 'Futuristic floating holographic study pods and translucent lecture chambers.',
    item_type: 'academy_skin',
    price_coins: 110,
    is_unlocked: false,
    is_equipped: false,
    preview_accent: '#6366F1',
  },
  {
    item_id: 'skin_academy_solarium',
    name: 'Grand Solarium Archive',
    description: 'Gilded solar observatories and warm brass astronomical armillary spheres.',
    item_type: 'academy_skin',
    price_coins: 95,
    is_unlocked: false,
    is_equipped: false,
    preview_accent: '#F59E0B',
  },
  {
    item_id: 'path_crystal_runes',
    name: 'Glow-Rune Paved Walkways',
    description: 'Cobblestones inscribed with ancient glowing geometric knowledge runes.',
    item_type: 'path_style',
    price_coins: 60,
    is_unlocked: false,
    is_equipped: false,
    preview_accent: '#FAD387',
  },
  {
    item_id: 'path_starlight_cobblestone',
    name: 'Starlight Cobblestone Promenade',
    description: 'Polished white marble paths reflecting gentle starlight nebulae.',
    item_type: 'path_style',
    price_coins: 50,
    is_unlocked: false,
    is_equipped: false,
    preview_accent: '#93C5FD',
  },
  {
    item_id: 'path_bioluminescent_moss',
    name: 'Bioluminescent Moss Trails',
    description: 'Soft organic pathways glowing emerald and cyan in evening twilight.',
    item_type: 'path_style',
    price_coins: 65,
    is_unlocked: false,
    is_equipped: false,
    preview_accent: '#10B981',
  },
  {
    item_id: 'decor_celestial_fountain',
    name: 'Fountain of Continuous Inquiry',
    description: 'A levitating marble basin with shimmering water currents in the central courtyard.',
    item_type: 'water_feature',
    price_coins: 75,
    is_unlocked: false,
    is_equipped: false,
    preview_accent: '#85E4F2',
  },
  {
    item_id: 'decor_lotus_reflection_pond',
    name: 'Lotus Reflection Waterway',
    description: 'Tranquil aquatic sanctuary with floating luminous water lilies and koi ripples.',
    item_type: 'water_feature',
    price_coins: 85,
    is_unlocked: false,
    is_equipped: false,
    preview_accent: '#EC4899',
  },
  {
    item_id: 'decor_zen_bonsai_grove',
    name: 'Evergrowth Bonsai Sanctuary',
    description: 'Ancient miniature knowledge bonsai trees surrounded by calm stone lanterns.',
    item_type: 'water_feature',
    price_coins: 70,
    is_unlocked: false,
    is_equipped: false,
    preview_accent: '#84CC16',
  },
  {
    item_id: 'nova_golden_halo',
    name: 'Golden Scholar Halo for Nova',
    description: 'A shimmering ring of radiant starlight orbiting your knowledge companion.',
    item_type: 'nova_accessory',
    price_coins: 50,
    is_unlocked: false,
    is_equipped: false,
    preview_accent: '#F2BD58',
  },
  {
    item_id: 'nova_astral_wings',
    name: 'Astral Knowledge Wings',
    description: 'Ethereal glowing wings allowing Nova to flutter above research papers.',
    item_type: 'nova_accessory',
    price_coins: 75,
    is_unlocked: false,
    is_equipped: false,
    preview_accent: '#A855F7',
  },
  {
    item_id: 'nova_cosmic_visor',
    name: 'Cybernetic Research Visor',
    description: 'High-tech neon cyan HUD monocle displaying real-time study analytics.',
    item_type: 'nova_accessory',
    price_coins: 60,
    is_unlocked: false,
    is_equipped: false,
    preview_accent: '#06B6D4',
  },
];

export const MarketView: React.FC = () => {
  const { gameWallet, refreshWallet } = useApp();
  const [items, setItems] = useState<CosmeticItemResponse[]>(() => {
    const saved = localStorage.getItem('learnova_cosmetic_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return FALLBACK_COSMETIC_CATALOGUE;
      }
    }
    return FALLBACK_COSMETIC_CATALOGUE;
  });

  const [activeFilter, setActiveFilter] = useState<
    'all' | 'citadel_skin' | 'academy_skin' | 'path_style' | 'water_feature' | 'nova_accessory'
  >('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const loadMarket = useCallback(async () => {
    try {
      const data = await gameApi.getShopItems();
      if (data && data.length > 0) {
        setItems(data);
        localStorage.setItem('learnova_cosmetic_items', JSON.stringify(data));
      }
    } catch {
      // Offline fallback: maintain fallback items with local unlocks
      const saved = localStorage.getItem('learnova_cosmetic_items');
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch {
          setItems(FALLBACK_COSMETIC_CATALOGUE);
        }
      } else {
        setItems(FALLBACK_COSMETIC_CATALOGUE);
      }
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
      try {
        await gameApi.purchaseCosmetic(item.item_id);
      } catch {
        // Local fallback if offline
      }

      // Update local state
      const updated = items.map((i) =>
        i.item_id === item.item_id ? { ...i, is_unlocked: true, is_equipped: true } : i
      );
      setItems(updated);
      localStorage.setItem('learnova_cosmetic_items', JSON.stringify(updated));

      confetti({ particleCount: 50, spread: 60 });
      if (refreshWallet) await refreshWallet();
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
      try {
        await gameApi.equipCosmetic(itemId);
      } catch {
        // Local fallback
      }
      const targetItem = items.find((i) => i.item_id === itemId);
      if (targetItem) {
        const updated = items.map((i) => {
          if (i.item_type === targetItem.item_type) {
            return { ...i, is_equipped: i.item_id === itemId };
          }
          return i;
        });
        setItems(updated);
        localStorage.setItem('learnova_cosmetic_items', JSON.stringify(updated));
      }
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
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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
                  className="w-full py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-kingdom-violet hover:text-white text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                >
                  {isProcessing === item.item_id ? 'Equipping...' : 'Equip on Island'}
                </button>
              ) : (
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={isProcessing === item.item_id || gameWallet.coin_balance < item.price_coins}
                  className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    gameWallet.coin_balance >= item.price_coins
                      ? 'bg-kingdom-gold hover:bg-kingdom-gold/90 text-kingdom-navy shadow-xs cursor-pointer'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">lock_open</span>
                  <span>{isProcessing === item.item_id ? 'Unlocking...' : `Unlock for ${item.price_coins} Coins`}</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
