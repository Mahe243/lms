import React, { useState, useEffect } from 'react';
import {
  Layers, Plus, Play, RotateCcw, Check, Sparkles, ChevronRight,
  Edit3, Trash2, ArrowLeft, Undo2, Award, BookOpen, Clock, Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FlashcardDeck, Flashcard, Course } from '../types';
import { api } from '../api';

interface FlashcardsViewProps {
  courses: Course[];
  initialMode?: string;
  initialDraftCards?: any[];
  onNavigate: (tab: string, meta?: any) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  courses,
  initialMode,
  initialDraftCards,
  onNavigate,
}) => {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);

  // Study Session Active State
  const [isStudying, setIsStudying] = useState(false);
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [typeInAnswer, setTypeInAnswer] = useState('');
  const [lastReviewedCardId, setLastReviewedCardId] = useState<string | null>(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Modals
  const [showCreateDeckModal, setShowCreateDeckModal] = useState(false);
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [showDraftsModal, setShowDraftsModal] = useState(!!initialDraftCards);
  const [draftCards, setDraftCards] = useState<any[]>(initialDraftCards || []);

  // Form fields
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [cardExplanation, setCardExplanation] = useState('');
  const [cardType, setCardType] = useState<'basic' | 'reversed' | 'cloze'>('basic');

  const fetchDecksAndCards = async () => {
    try {
      const d = await api.getDecks();
      setDecks(d);
      if (d.length > 0 && !selectedDeck) {
        setSelectedDeck(d[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDecksAndCards();
  }, []);

  useEffect(() => {
    if (selectedDeck) {
      api.getCards({ deck_id: selectedDeck.id }).then(setCards).catch(console.error);
    }
  }, [selectedDeck]);

  const handleStartStudy = async (mode: string = 'due_today') => {
    try {
      const queue = await api.getCards({
        deck_id: selectedDeck?.id,
        mode,
      });
      if (queue.length === 0) {
        alert('No cards due in this queue! You can select "Random Practice" or "New Cards".');
        return;
      }
      setStudyQueue(queue);
      setCurrentIndex(0);
      setIsRevealed(false);
      setTypeInAnswer('');
      setIsStudying(true);
      setSessionCompleted(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRateCard = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    const currentCard = studyQueue[currentIndex];
    if (!currentCard) return;

    try {
      await api.submitReview(currentCard.id, rating);
      setLastReviewedCardId(currentCard.id);

      if (currentIndex + 1 < studyQueue.length) {
        setCurrentIndex(currentIndex + 1);
        setIsRevealed(false);
        setTypeInAnswer('');
      } else {
        // Complete session
        setSessionCompleted(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        fetchDecksAndCards();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUndoLastReview = async () => {
    if (!lastReviewedCardId || currentIndex === 0) return;
    try {
      await api.undoReview(lastReviewedCardId);
      setCurrentIndex((prev) => prev - 1);
      setIsRevealed(true);
      setLastReviewedCardId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateDeckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    try {
      const d = await api.createDeck({ name: newDeckName, description: newDeckDesc });
      setShowCreateDeckModal(false);
      setNewDeckName('');
      setNewDeckDesc('');
      fetchDecksAndCards();
      setSelectedDeck(d);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeck || !cardFront.trim() || !cardBack.trim()) return;
    try {
      await api.createCard({
        deck_id: selectedDeck.id,
        front: cardFront,
        back: cardBack,
        explanation: cardExplanation,
        card_type: cardType,
      });
      setShowCreateCardModal(false);
      setCardFront('');
      setCardBack('');
      setCardExplanation('');
      const c = await api.getCards({ deck_id: selectedDeck.id });
      setCards(c);
      fetchDecksAndCards();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommitDraftCard = async (draft: any, index: number) => {
    if (!selectedDeck) return;
    try {
      await api.createCard({
        deck_id: selectedDeck.id,
        front: draft.front,
        back: draft.back,
        explanation: draft.explanation,
        card_type: draft.card_type || 'basic',
      });
      setDraftCards((prev) => prev.filter((_, i) => i !== index));
      const c = await api.getCards({ deck_id: selectedDeck.id });
      setCards(c);
      fetchDecksAndCards();
    } catch (e) {
      console.error(e);
    }
  };

  const activeCard = studyQueue[currentIndex];

  return (
    <div className="space-y-6 pb-12">
      {isStudying ? (
        /* Active Study Interface (1 card at a time) */
        <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
          {/* Study Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsStudying(false)}
              className="text-xs text-neutral-500 hover:text-neutral-800 flex items-center space-x-1"
            >
              <ArrowLeft size={14} />
              <span>Exit Study</span>
            </button>
            <div className="flex items-center space-x-3 text-xs">
              <span className="font-mono text-neutral-400">
                Card {currentIndex + 1} of {studyQueue.length}
              </span>
              {lastReviewedCardId && (
                <button
                  onClick={handleUndoLastReview}
                  className="text-neutral-500 hover:text-indigo-600 flex items-center space-x-1"
                  title="Undo last rating"
                >
                  <Undo2 size={13} />
                  <span>Undo</span>
                </button>
              )}
            </div>
          </div>

          {sessionCompleted ? (
            /* Session Summary */
            <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-2xl p-8 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Award size={24} />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Session Complete!
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                You reviewed all {studyQueue.length} flashcards in this queue. Spaced repetition intervals have been recorded in your scheduler.
              </p>
              <button
                onClick={() => setIsStudying(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition"
              >
                Back to Decks
              </button>
            </div>
          ) : (
            /* Card Flip Area */
            <div className="space-y-4">
              <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-2xl p-8 shadow-sm min-h-[260px] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                    {activeCard?.card_type} card • Front (Question)
                  </span>
                  <div className="text-base font-semibold text-neutral-900 dark:text-neutral-100 leading-relaxed whitespace-pre-wrap">
                    {activeCard?.front}
                  </div>
                </div>

                {/* Optional Type In Answer */}
                {!isRevealed && (
                  <div className="mt-4">
                    <input
                      type="text"
                      value={typeInAnswer}
                      onChange={(e) => setTypeInAnswer(e.target.value)}
                      placeholder="Type your answer to test recall (optional)..."
                      className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none"
                    />
                  </div>
                )}

                {/* Back (Answer) when revealed */}
                {isRevealed && (
                  <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 space-y-2 animate-fade-in">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                      Answer:
                    </span>
                    <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                      {activeCard?.back}
                    </div>
                    {activeCard?.explanation && (
                      <p className="text-xs text-neutral-500 italic mt-2 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                        Explanation: {activeCard.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Reveal / Recall Rating Buttons */}
              {!isRevealed ? (
                <button
                  onClick={() => setIsRevealed(true)}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-xs"
                >
                  Show Answer (Spacebar)
                </button>
              ) : (
                <div className="grid grid-cols-4 gap-2 pt-1 animate-fade-in">
                  <button
                    onClick={() => handleRateCard('again')}
                    className="py-2.5 px-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold hover:bg-rose-100 transition"
                  >
                    Again (1d)
                  </button>
                  <button
                    onClick={() => handleRateCard('hard')}
                    className="py-2.5 px-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-semibold hover:bg-amber-100 transition"
                  >
                    Hard
                  </button>
                  <button
                    onClick={() => handleRateCard('good')}
                    className="py-2.5 px-2 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold hover:bg-blue-100 transition"
                  >
                    Good
                  </button>
                  <button
                    onClick={() => handleRateCard('easy')}
                    className="py-2.5 px-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition"
                  >
                    Easy
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Decks & Cards Management View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Interactive Flashcard Decks</h2>
              <p className="text-xs text-neutral-500">Spaced repetition memory practice powered by the FSRS/SM-2 algorithm</p>
            </div>
            <div className="flex items-center space-x-2">
              {draftCards.length > 0 && (
                <button
                  onClick={() => setShowDraftsModal(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 shadow-xs"
                >
                  <Sparkles size={14} />
                  <span>Review Drafts ({draftCards.length})</span>
                </button>
              )}
              <button
                onClick={() => setShowCreateDeckModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 shadow-xs"
              >
                <Plus size={14} />
                <span>New Deck</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Decks List */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                Study Decks
              </span>
              {decks.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDeck(d)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    selectedDeck?.id === d.id
                      ? 'bg-white dark:bg-neutral-900 border-indigo-500 shadow-sm'
                      : 'bg-neutral-50/60 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">{d.name}</h3>
                    {d.due_count > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        {d.due_count} Due
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">{d.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <span>{d.card_count} total cards</span>
                    <span>{d.new_count} new</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right 2-Cols: Selected Deck Actions & Cards List */}
            {selectedDeck && (
              <div className="md:col-span-2 space-y-4">
                <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                      {selectedDeck.name}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">{selectedDeck.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStartStudy('due_today')}
                      className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition flex items-center space-x-1.5"
                    >
                      <Play size={13} />
                      <span>Study Due ({selectedDeck.due_count})</span>
                    </button>
                    <button
                      onClick={() => handleStartStudy('random_practice')}
                      className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-medium hover:bg-neutral-50"
                    >
                      Random Practice
                    </button>
                    <button
                      onClick={() => setShowCreateCardModal(true)}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
                    >
                      + Add Card
                    </button>
                  </div>
                </div>

                {/* Cards in Deck Table */}
                <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                  {cards.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400">No cards in this deck yet.</div>
                  ) : (
                    cards.map((c) => (
                      <div key={c.id} className="p-3.5 flex items-start justify-between hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                        <div className="space-y-1 pr-4">
                          <span className="font-medium text-neutral-900 dark:text-neutral-100 block">
                            Q: {c.front}
                          </span>
                          <span className="text-neutral-500 block">
                            A: {c.back}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 flex-shrink-0 text-[10px] text-neutral-400 font-mono">
                          <span className="capitalize">{c.state}</span>
                          <span>Int: {c.interval_days}d</span>
                          <span>Rep: {c.reps}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create Deck */}
      {showCreateDeckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <h3 className="font-semibold text-sm">Create Flashcard Deck</h3>
            <form onSubmit={handleCreateDeckSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Deck Name</label>
                <input
                  type="text"
                  required
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="e.g. Distributed Consensus"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  placeholder="Scope of questions..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDeckModal(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  Create Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Card */}
      {showCreateCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <h3 className="font-semibold text-sm">Add Flashcard</h3>
            <form onSubmit={handleCreateCardSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Card Type</label>
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                >
                  <option value="basic">Basic (Front & Back)</option>
                  <option value="reversed">Reversed (Two-Way)</option>
                  <option value="cloze">Cloze Deletion (Fill in Blank)</option>
                </select>
              </div>
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Front (Prompt)</label>
                <textarea
                  rows={2}
                  required
                  value={cardFront}
                  onChange={(e) => setCardFront(e.target.value)}
                  placeholder="Question or prompt..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Back (Answer)</label>
                <textarea
                  rows={2}
                  required
                  value={cardBack}
                  onChange={(e) => setCardBack(e.target.value)}
                  placeholder="Answer..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Explanation (Optional)</label>
                <input
                  type="text"
                  value={cardExplanation}
                  onChange={(e) => setCardExplanation(e.target.value)}
                  placeholder="Context or proof..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCardModal(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Review AI-Generated Draft Cards */}
      {showDraftsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Review AI-Drafted Flashcards</h3>
              <span className="text-[11px] text-neutral-400">Review before adding to deck</span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
              {draftCards.map((draft, idx) => (
                <div key={idx} className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg space-y-1 border border-neutral-200 dark:border-neutral-700">
                  <div className="font-semibold">Q: {draft.front}</div>
                  <div className="text-neutral-600 dark:text-neutral-400">A: {draft.back}</div>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleCommitDraftCard(draft, idx)}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700"
                    >
                      Accept & Add to Deck
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDraftsModal(false)}
                className="text-xs text-neutral-500 hover:text-neutral-800 px-3 py-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
