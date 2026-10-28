import React, { useState, useEffect } from 'react';
import {
  Target, Plus, CheckCircle2, Clock, Flame,
  Award, TrendingUp, Calendar, Trash2
} from 'lucide-react';
import { Goal, Course } from '../types';
import { api } from '../api';

interface GoalsViewProps {
  courses: Course[];
}

export const GoalsView: React.FC<GoalsViewProps> = ({ courses }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);

  // Form fields
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('hours');
  const [newTarget, setNewTarget] = useState(5);
  const [newUnit, setNewUnit] = useState('hours');
  const [newPeriod, setNewPeriod] = useState('weekly');

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const data = await api.getGoals();
      setGoals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await api.createGoal({
        title: newTitle,
        goal_type: newType,
        target_value: newTarget,
        unit: newUnit,
        period: newPeriod,
      });
      setShowAddGoalModal(false);
      setNewTitle('');
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleIncrementProgress = async (g: Goal) => {
    try {
      const newVal = g.current_value + 1;
      await api.updateGoal(g.id, { current_value: newVal });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await api.deleteGoal(id);
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Goals & Habit Trackers</h2>
          <p className="text-xs text-neutral-500">Track deliberate study hours, daily cards, and learning milestones</p>
        </div>
        <button
          onClick={() => setShowAddGoalModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 shadow-xs"
        >
          <Plus size={14} />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.current_value / g.target_value) * 100));
          return (
            <div
              key={g.id}
              className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                    {g.period} • {g.goal_type}
                  </span>
                  <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 mt-1.5">
                    {g.title}
                  </h3>
                </div>
                <button
                  onClick={() => handleDeleteGoal(g.id)}
                  className="text-neutral-400 hover:text-rose-600 p-1"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-neutral-500 font-mono">
                  <span>Progress: {g.current_value} / {g.target_value} {g.unit}</span>
                  <span className="font-bold">{pct}%</span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                <span className="text-[11px] text-neutral-400">
                  {pct >= 100 ? '🎉 Goal Completed!' : `${g.target_value - g.current_value} ${g.unit} remaining`}
                </span>
                <button
                  onClick={() => handleIncrementProgress(g)}
                  className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 rounded font-medium text-[11px]"
                >
                  +1 {g.unit}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Goal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 text-xs">
            <h3 className="font-semibold text-sm">Create Learning Goal</h3>
            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Goal Statement</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Study statistics for 5 hours this week"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Target Value</label>
                  <input
                    type="number"
                    min={1}
                    value={newTarget}
                    onChange={(e) => setNewTarget(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="hours, cards, topics"
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Period</label>
                <select
                  value={newPeriod}
                  onChange={(e) => setNewPeriod(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                >
                  <option value="daily">Daily Habit</option>
                  <option value="weekly">Weekly Target</option>
                  <option value="monthly">Monthly Milestone</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
