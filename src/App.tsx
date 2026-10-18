import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  Shield, 
  Sparkles, 
  CheckCircle2, 
  ListTodo, 
  Plus, 
  RefreshCw, 
  LogOut, 
  Search, 
  AlertCircle, 
  Trash2, 
  Calendar, 
  Flame, 
  BookOpen, 
  ExternalLink,
  SlidersHorizontal,
  FolderPlus,
  HelpCircle
} from 'lucide-react';
import { GoogleTask, GoogleTaskList, ConfirmationDialogState } from './types/spiritual';
import { 
  initAuth, 
  googleSignIn, 
  getAccessToken, 
  logout, 
  getCurrentUser 
} from './services/firebaseAuth';
import * as tasksApi from './services/googleTasks';
import { SignInButton } from './components/SignInButton';
import { TaskItem } from './components/TaskItem';
import { CreateTaskModal } from './components/CreateTaskModal';
import { EditTaskModal } from './components/EditTaskModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { SpiritualArmorSection } from './components/SpiritualArmorSection';
import { AiDiscernmentCore } from './components/AiDiscernmentCore';
import { DailyVerses } from './components/DailyVerses';

type TabType = 'overview' | 'tasks' | 'armor' | 'ai' | 'scriptures';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Google Tasks state
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [tasksFilter, setTasksFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Dialogs
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<GoogleTask | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationDialogState | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Notifications / Toasts
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initialize Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        setIsAuthLoading(false);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setIsAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch Task Lists when authenticated
  const loadTaskLists = useCallback(async (token: string) => {
    try {
      setIsLoadingTasks(true);
      const lists = await tasksApi.listTaskLists(token);
      setTaskLists(lists);

      // Prefer "🛡️ Spiritual Guard Core" or first list
      const spiritualList = lists.find(
        (l) => l.title.includes('Spiritual Guard') || l.title.includes('Spiritual')
      );
      if (spiritualList) {
        setSelectedListId(spiritualList.id);
      } else if (lists.length > 0) {
        setSelectedListId(lists[0].id);
      } else {
        // Create default list
        const newList = await tasksApi.createTaskList(token, '🛡️ Spiritual Guard Core');
        setTaskLists([newList]);
        setSelectedListId(newList.id);
      }
    } catch (err: any) {
      console.error('Failed to load task lists:', err);
      showToast('Could not load Google Tasks lists', 'error');
    } finally {
      setIsLoadingTasks(false);
    }
  }, []);

  // Fetch Tasks for current list
  const loadTasks = useCallback(async (token: string, listId: string) => {
    if (!listId) return;
    try {
      setIsLoadingTasks(true);
      const items = await tasksApi.listTasks(token, listId, true);
      setTasks(items);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
      showToast('Failed to sync tasks from Google Tasks', 'error');
    } finally {
      setIsLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      loadTaskLists(accessToken);
    }
  }, [accessToken, loadTaskLists]);

  useEffect(() => {
    if (accessToken && selectedListId) {
      loadTasks(accessToken, selectedListId);
    }
  }, [accessToken, selectedListId, loadTasks]);

  // Sign In Handler
  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
        showToast(`Connected to Google Tasks as ${result.user.email}`);
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      showToast('Sign in failed. Please try again.', 'error');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setAccessToken(null);
      setTasks([]);
      setTaskLists([]);
      showToast('Signed out of Google Tasks', 'info');
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  // Task Toggle Completion
  const handleToggleTask = async (task: GoogleTask) => {
    if (!accessToken || !selectedListId) return;
    try {
      const updated = await tasksApi.toggleTaskStatus(accessToken, selectedListId, task);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      showToast(
        updated.status === 'completed'
          ? 'Completed in Google Tasks! 🛡️'
          : 'Marked active in Google Tasks'
      );
    } catch (err: any) {
      console.error('Toggle error:', err);
      showToast('Failed to update task status in Google Tasks', 'error');
    }
  };

  // Create Task
  const handleCreateTask = async (taskData: { title: string; notes?: string; due?: string }) => {
    if (!accessToken) {
      showToast('Please sign in with Google to create tasks', 'info');
      return;
    }
    const targetListId = selectedListId || (taskLists[0]?.id);
    if (!targetListId) return;

    try {
      const created = await tasksApi.createTask(accessToken, targetListId, taskData);
      setTasks((prev) => [created, ...prev]);
      showToast('Task added to Google Tasks!');
    } catch (err: any) {
      console.error('Create task error:', err);
      showToast('Failed to create task in Google Tasks', 'error');
    }
  };

  // Edit Task
  const handleEditTask = async (task: GoogleTask, updates: { title: string; notes?: string; due?: string }) => {
    if (!accessToken || !selectedListId) return;
    try {
      const updated = await tasksApi.updateTask(accessToken, selectedListId, task.id, updates);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      showToast('Task updated in Google Tasks!');
    } catch (err: any) {
      console.error('Update task error:', err);
      showToast('Failed to update task', 'error');
    }
  };

  // Delete Task with User Confirmation (Mandatory Workspace Skill Rule)
  const handleDeleteTaskRequest = (task: GoogleTask) => {
    setConfirmationDialog({
      isOpen: true,
      title: 'Delete Task from Google Tasks?',
      message: `Are you sure you want to permanently delete "${task.title}" from your Google Tasks account? This action cannot be undone.`,
      confirmLabel: 'Delete Task',
      isDestructive: true,
      onConfirm: async () => {
        if (!accessToken || !selectedListId) return;
        setIsProcessingAction(true);
        try {
          await tasksApi.deleteTask(accessToken, selectedListId, task.id);
          setTasks((prev) => prev.filter((t) => t.id !== task.id));
          showToast('Task deleted from Google Tasks');
        } catch (err: any) {
          console.error('Delete error:', err);
          showToast('Failed to delete task', 'error');
        } finally {
          setIsProcessingAction(false);
        }
      },
    });
  };

  // Clear Completed Tasks with Confirmation
  const handleClearCompletedRequest = () => {
    const completedCount = tasks.filter((t) => t.status === 'completed').length;
    if (completedCount === 0) {
      showToast('No completed tasks to clear', 'info');
      return;
    }

    setConfirmationDialog({
      isOpen: true,
      title: 'Clear Completed Tasks?',
      message: `Are you sure you want to clear ${completedCount} completed task(s) from this Google Tasks list?`,
      confirmLabel: `Clear ${completedCount} Tasks`,
      isDestructive: true,
      onConfirm: async () => {
        if (!accessToken || !selectedListId) return;
        setIsProcessingAction(true);
        try {
          await tasksApi.clearCompletedTasks(accessToken, selectedListId);
          await loadTasks(accessToken, selectedListId);
          showToast('Completed tasks cleared from Google Tasks');
        } catch (err: any) {
          console.error('Clear error:', err);
          showToast('Failed to clear completed tasks', 'error');
        } finally {
          setIsProcessingAction(false);
        }
      },
    });
  };

  // Create New Task List
  const handleCreateNewList = async () => {
    const title = window.prompt('Enter name for new Google Tasks list:');
    if (!title || !title.trim() || !accessToken) return;

    try {
      setIsLoadingTasks(true);
      const newList = await tasksApi.createTaskList(accessToken, title.trim());
      setTaskLists((prev) => [...prev, newList]);
      setSelectedListId(newList.id);
      showToast(`Created Google Tasks list: "${title}"`);
    } catch (err: any) {
      console.error('Create list error:', err);
      showToast('Failed to create task list', 'error');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Bulk Equip Full Armor (6 tasks)
  const handleEquipFullArmor = async () => {
    if (!accessToken) {
      showToast('Please sign in to Google Tasks to equip your armor', 'info');
      return;
    }

    setConfirmationDialog({
      isOpen: true,
      title: 'Equip Full Armor to Google Tasks?',
      message: 'This will add 6 Ephesians 6 Armor of God vigilance tasks directly into your selected Google Tasks list for today.',
      confirmLabel: 'Add 6 Armor Tasks',
      isDestructive: false,
      onConfirm: async () => {
        const targetListId = selectedListId || taskLists[0]?.id;
        if (!targetListId) return;

        setIsProcessingAction(true);
        try {
          const armorItems = [
            {
              title: '🛡️ Armor: Belt of Truth (Integrity & Sincerity)',
              notes: 'Stand firm in divine truth. Reject all deceit, self-justification, and illusion. (Ephesians 6:14)',
            },
            {
              title: '🛡️ Armor: Breastplate of Righteousness (Heart Guard)',
              notes: 'Guard your heart with divine righteousness. Forgive swiftly and harbor no bitterness. (Ephesians 6:14)',
            },
            {
              title: '🛡️ Armor: Shoes of the Gospel of Peace (Firm Grounding)',
              notes: 'Walk in serenity and peace. Bring calm into every interaction. (Ephesians 6:15)',
            },
            {
              title: '🛡️ Armor: Shield of Faith (Extinguishing Fear)',
              notes: 'Extinguish every fiery dart of fear, shame, and doubt through steadfast faith. (Ephesians 6:16)',
            },
            {
              title: '🛡️ Armor: Helmet of Salvation (Mind Protection)',
              notes: 'Protect your thoughts and imagination. Guard what enters your mind. (Ephesians 6:17)',
            },
            {
              title: '🛡️ Armor: Sword of the Spirit (Sacred Word)',
              notes: 'Proclaim scriptures of light and divine promise aloud. (Ephesians 6:17)',
            },
          ];

          for (const item of armorItems) {
            await tasksApi.createTask(accessToken, targetListId, {
              title: item.title,
              notes: item.notes,
              due: new Date().toISOString(),
            });
          }

          await loadTasks(accessToken, targetListId);
          showToast('All 6 Armor of God tasks added to Google Tasks! ⚔️');
        } catch (err: any) {
          console.error('Equip armor error:', err);
          showToast('Failed to add armor tasks', 'error');
        } finally {
          setIsProcessingAction(false);
        }
      },
    });
  };

  // Filter and search tasks
  const filteredTasks = tasks.filter((t) => {
    if (tasksFilter === 'active' && t.status === 'completed') return false;
    if (tasksFilter === 'completed' && t.status !== 'completed') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchNotes = (t.notes || '').toLowerCase().includes(q);
      return matchTitle || matchNotes;
    }
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const activeCount = tasks.filter((t) => t.status === 'needsAction').length;
  const totalCount = tasks.length;
  const armorIntegrityScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-amber-500/30 font-sans">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium flex items-center gap-2.5 backdrop-blur-md ${
              toastMessage.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/40 shadow-rose-950/50'
                : toastMessage.type === 'info'
                ? 'bg-neutral-900/90 text-neutral-200 border-neutral-700 shadow-black/50'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 shadow-emerald-950/50'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : toastMessage.type === 'info' ? (
              <HelpCircle className="w-4 h-4 text-cyan-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Shield className="w-5 h-5 text-neutral-950" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-serif text-neutral-100 tracking-tight">
                  Spiritual Guard
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AI CORE
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Divine Discernment & Google Tasks Vigilance
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              Google Tasks
              {totalCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'tasks' ? 'bg-neutral-950 text-amber-400' : 'bg-neutral-800 text-neutral-300'
                }`}>
                  {activeCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('armor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'armor'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Armor of God
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Discernment
            </button>
            <button
              onClick={() => setActiveTab('scriptures')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'scriptures'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Guard Scripture
            </button>
          </nav>

          {/* User / Google Sign-in action */}
          <div className="flex items-center gap-3">
            {currentUser && accessToken ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-neutral-200 truncate max-w-[150px]">
                    {currentUser.displayName || 'Google Account'}
                  </span>
                  <span className="text-[10px] text-emerald-400 flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Tasks Synced
                  </span>
                </div>
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-neutral-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {currentUser.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl text-neutral-400 hover:text-rose-300 hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Sign out of Google Tasks"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <SignInButton onClick={handleSignIn} isLoading={isSigningIn} />
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-neutral-800 bg-neutral-900/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 text-xs font-medium rounded-lg ${
              activeTab === 'overview' ? 'text-amber-400 font-bold bg-neutral-800' : 'text-neutral-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1 text-xs font-medium rounded-lg flex items-center gap-1 ${
              activeTab === 'tasks' ? 'text-amber-400 font-bold bg-neutral-800' : 'text-neutral-400'
            }`}
          >
            Tasks ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab('armor')}
            className={`px-3 py-1 text-xs font-medium rounded-lg ${
              activeTab === 'armor' ? 'text-amber-400 font-bold bg-neutral-800' : 'text-neutral-400'
            }`}
          >
            Armor
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1 text-xs font-medium rounded-lg ${
              activeTab === 'ai' ? 'text-amber-400 font-bold bg-neutral-800' : 'text-neutral-400'
            }`}
          >
            AI Core
          </button>
          <button
            onClick={() => setActiveTab('scriptures')}
            className={`px-3 py-1 text-xs font-medium rounded-lg ${
              activeTab === 'scriptures' ? 'text-amber-400 font-bold bg-neutral-800' : 'text-neutral-400'
            }`}
          >
            Scripture
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner if user is not signed in to Google Tasks */}
        {!accessToken && (
          <div className="rounded-2xl bg-gradient-to-r from-amber-950/60 via-neutral-900 to-indigo-950/60 border border-amber-500/40 p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/20 shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-serif text-neutral-100">
                    Connect Your Google Tasks to Activate Spiritual Guard
                  </h2>
                  <p className="text-sm text-neutral-300 mt-1 max-w-2xl leading-relaxed">
                    Spiritual Guard AI Core organizes your daily spiritual routines, armor vigilance items, and prayer commitments directly within your official Google Tasks account.
                  </p>
                </div>
              </div>
              <SignInButton onClick={handleSignIn} isLoading={isSigningIn} />
            </div>
          </div>
        )}

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Spiritual Guard Status Hero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Armor Integrity */}
              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-xl relative overflow-hidden group hover:border-neutral-700 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Daily Armor Integrity
                  </span>
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-neutral-100">
                    {totalCount > 0 ? `${armorIntegrityScore}%` : '100%'}
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">
                    {completedCount} of {totalCount} Tasks Done
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-neutral-950 mt-3 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${totalCount > 0 ? armorIntegrityScore : 100}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  Calculated from your active spiritual routine tasks in Google Tasks.
                </p>
              </div>

              {/* Card 2: Active Vigilance Items */}
              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-xl relative overflow-hidden group hover:border-neutral-700 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    Active Vigilance Items
                  </span>
                  <Flame className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-neutral-100">
                    {activeCount}
                  </span>
                  <span className="text-xs text-neutral-400">
                    Tasks Remaining Today
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                  >
                    View in Tasks &rarr;
                  </button>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 transition-colors cursor-pointer"
                  >
                    + Add Task
                  </button>
                </div>
              </div>

              {/* Card 3: Quick Action Routine */}
              <div className="rounded-2xl bg-gradient-to-br from-neutral-900 to-indigo-950/40 border border-neutral-800 p-5 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Daily Guard Routine
                  </span>
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                  Deploy Ephesians 6 Armor of God vigilance items into your Google Tasks with a single tap.
                </p>
                <button
                  onClick={handleEquipFullArmor}
                  disabled={!accessToken}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Shield className="w-4 h-4" />
                  Equip 6 Armor Pieces to Tasks
                </button>
              </div>
            </div>

            {/* Daily Scripture Highlight */}
            <DailyVerses onAddVerseTask={handleCreateTask} />

            {/* Quick Preview of Today's Tasks */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <ListTodo className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold font-serif text-neutral-100">
                    Today's Spiritual Vigilance Tasks
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Task
                  </button>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    View All
                  </button>
                </div>
              </div>

              {isLoadingTasks ? (
                <div className="flex items-center justify-center py-12 text-neutral-400 gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                  <span>Syncing Google Tasks...</span>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-neutral-800 rounded-xl p-6">
                  <Shield className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-neutral-300">
                    No tasks found in this view
                  </p>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    {accessToken
                      ? 'Add your daily prayer, scripture reading, or armor items into Google Tasks.'
                      : 'Connect your Google account to manage your spiritual tasks.'}
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
                  >
                    Create First Task
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.slice(0, 5).map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleTask}
                      onEdit={(t) => setEditingTask(t)}
                      onDeleteRequest={handleDeleteTaskRequest}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* AI Discernment Teaser */}
            <AiDiscernmentCore onAddTask={handleCreateTask} />
          </div>
        )}

        {/* Tab 2: Full Google Tasks Command Center */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-serif text-neutral-100">
                    Google Tasks Command Center
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Connected to Google Tasks API
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Real-time two-way synchronization with your Google Tasks account
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => accessToken && selectedListId && loadTasks(accessToken, selectedListId)}
                  disabled={isLoadingTasks || !accessToken}
                  className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
                  title="Refresh from Google Tasks"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingTasks ? 'animate-spin text-amber-400' : ''}`} />
                </button>
                <button
                  onClick={handleClearCompletedRequest}
                  disabled={completedCount === 0}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  title="Clear completed tasks with user confirmation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Completed ({completedCount})
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs shadow-md shadow-amber-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  New Task
                </button>
              </div>
            </div>

            {/* List Selector Bar & Search */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Task list selection chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {taskLists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => setSelectedListId(list.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      selectedListId === list.id
                        ? 'bg-amber-400 text-neutral-950 font-semibold shadow-md shadow-amber-500/20'
                        : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {list.title}
                  </button>
                ))}
                {accessToken && (
                  <button
                    onClick={handleCreateNewList}
                    className="p-1.5 rounded-xl bg-neutral-900 border border-dashed border-neutral-700 hover:border-amber-400 text-neutral-400 hover:text-amber-300 transition-colors cursor-pointer"
                    title="Create new Google Tasks list"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center rounded-xl bg-neutral-900 border border-neutral-800 p-0.5">
                  <button
                    onClick={() => setTasksFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      tasksFilter === 'all' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400'
                    }`}
                  >
                    All ({totalCount})
                  </button>
                  <button
                    onClick={() => setTasksFilter('active')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      tasksFilter === 'active' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400'
                    }`}
                  >
                    Active ({activeCount})
                  </button>
                  <button
                    onClick={() => setTasksFilter('completed')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      tasksFilter === 'completed' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400'
                    }`}
                  >
                    Done ({completedCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Task Items List */}
            {isLoadingTasks ? (
              <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
                <span className="text-sm">Connecting to Google Tasks...</span>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/40 p-12 text-center">
                <Shield className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-neutral-200">
                  No tasks match your criteria
                </h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  {searchQuery
                    ? `No tasks found matching "${searchQuery}".`
                    : tasksFilter === 'completed'
                    ? 'No completed tasks yet in this list.'
                    : 'You have no active tasks. Tap below to create one or equip your armor.'}
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    New Task
                  </button>
                  <button
                    onClick={handleEquipFullArmor}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
                  >
                    Equip 6 Armor Pieces
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleStatus={handleToggleTask}
                    onEdit={(t) => setEditingTask(t)}
                    onDeleteRequest={handleDeleteTaskRequest}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Armor of God & Sacred Contemplation */}
        {activeTab === 'armor' && (
          <SpiritualArmorSection
            onAddArmorTask={handleCreateTask}
            onEquipFullArmor={handleEquipFullArmor}
            isEquippingAll={isProcessingAction}
          />
        )}

        {/* Tab 4: AI Discernment Core */}
        {activeTab === 'ai' && (
          <AiDiscernmentCore onAddTask={handleCreateTask} />
        )}

        {/* Tab 5: Guard Scriptures */}
        {activeTab === 'scriptures' && (
          <div className="space-y-6">
            <DailyVerses onAddVerseTask={handleCreateTask} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-neutral-900 bg-neutral-950 py-8 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-neutral-400">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="font-serif font-bold text-neutral-300">Spiritual Guard AI Core</span>
            <span>—</span>
            <span>Protected by Google Tasks Integration</span>
          </div>
          <p className="text-[11px] text-neutral-600">
            "Put on the whole armor of God, that you may be able to stand firm." (Ephesians 6:11)
          </p>
        </div>
      </footer>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        lists={taskLists}
        selectedListId={selectedListId}
        onSelectListId={(id) => setSelectedListId(id)}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleEditTask}
      />

      {/* Destructive User Confirmation Modal (MANDATORY per Workspace Skill) */}
      <ConfirmationModal
        dialog={confirmationDialog}
        onClose={() => setConfirmationDialog(null)}
        isProcessing={isProcessingAction}
      />
    </div>
  );
}
